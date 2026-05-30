import { type Href, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import QRCode from 'react-native-qrcode-svg';
import { HudText } from '../../src/components/HudText';
import { MargiButton } from '../../src/components/MargiButton';
import { TraumaResponseActionBar } from '../../src/components/emergency/TraumaResponseActionBar';
import { FirstAidBoard } from '../../src/components/emergency/FirstAidBoard';
import { LanguageSelector } from '../../src/components/emergency/LanguageSelector';
import { TraumaCenterPanel } from '../../src/components/emergency/TraumaCenterPanel';
import { useApp } from '../../src/context/AppContext';
import type { DispatchResult } from '../../src/lib/emergency/dispatchAdapters';
import { toDialUrl, toSmsUrl } from '../../src/lib/emergency/contactActions';
import {
  resolveDispatchEndpoints,
  runHttpDispatch,
} from '../../src/lib/emergency/dispatchOrchestrator';
import { getSupabaseClient } from '../../src/lib/supabase/client';
import {
  buildVolunteerNotifyResult,
  listNearbyVerifiedVolunteers,
} from '../../src/lib/ngo/volunteerProviders';
import { openMapsNavigate } from '../../src/lib/naariShakti/linkingActions';
import { resolveHospitalNavTarget } from '../../src/lib/emergency/hospitalNavTarget';
import {
  EMERGENCY_ACTIVATION_PATH,
} from '../../src/lib/emergency/emergencyNavigation';
import { unconfiguredDispatchMessage } from '../../src/lib/emergency/dispatchUserMessages';
import { pickDispatchLocation } from '../../src/lib/emergency/dispatchLocation';
import { getOfflineTraumaReply } from '../../src/lib/emergency/traumaAssistantOffline';
import { createTraumaSessionEngine } from '../../src/lib/emergency/traumaSession';
import { resolveSpeechLocale } from '../../src/lib/emergency/voiceLocale';
import { speakA11y } from '../../src/lib/a11yRuntime';
import { tokens } from '../../src/theme/tokens';

type ChatMessage = { role: 'assistant' | 'user'; text: string };

const engine = createTraumaSessionEngine({ assessmentSeconds: 180 });

export default function TraumaResponseScreen() {
  const params = useLocalSearchParams<{ mode?: 'auto' | 'guided' }>();
  const mode = params.mode === 'guided' ? 'guided' : 'auto';
  const {
    session,
    settings,
    profile,
    updateSettings,
    setLocation,
    completeTraumaAssessment,
    resetEmergency,
    a11y,
    markIncidentActivated,
  } = useApp();
  const [dispatchResult, setDispatchResult] = useState<DispatchResult | null>(null);
  const [dispatchError, setDispatchError] = useState<string | null>(null);
  const [volunteerStatus, setVolunteerStatus] = useState<string | null>(null);
  const [chat, setChat] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Calmly follow protocol. Help is on the way. Describe the current injury status.',
    },
  ]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [remaining, setRemaining] = useState(180);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const endpointConfig = useMemo(
    () =>
      resolveDispatchEndpoints({
        traumaUrl: process.env.EXPO_PUBLIC_TRAUMA_DISPATCH_URL,
        policeUrl: process.env.EXPO_PUBLIC_POLICE_DISPATCH_URL,
      }),
    []
  );

  useEffect(() => {    if (!session.incidentType) {
      router.replace(EMERGENCY_ACTIVATION_PATH as Href);
      return;
    }
    markIncidentActivated();
    const started = engine.startSession({
      incidentType: session.incidentType,
      language: (settings.language === 'hi' || settings.language === 'ta') ? settings.language : 'en',
      userName: 'Citizen',
    });
    setSessionId(started.id);
    void runDispatch();

    timerRef.current = setInterval(() => {
      setRemaining((curr) => Math.max(0, curr - 1));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (remaining > 0) return;
    if (!sessionId) return;
    if (mode === 'guided') return;
    const done = engine.finalize(sessionId);
    completeTraumaAssessment(done.severity);
    setChat((prev) => [
      ...prev,
      { role: 'assistant', text: 'Assessment timer completed. Routing to matched facilities.' },
    ]);
  }, [remaining, sessionId, completeTraumaAssessment, mode]);

  const runDispatch = async () => {
    if (!endpointConfig.configured) {
      setDispatchError(unconfiguredDispatchMessage());
      setDispatchResult({
        status: 'partial',
        referenceId: `MARGI-OFFLINE-${Date.now().toString(36).toUpperCase()}`,
        traumaCenter: { name: 'Nearest trauma center', phone: '108', etaMinutes: null },
        policeUnit: { name: 'Local police dispatch', phone: '112', etaMinutes: null },
      });
      return;
    }
    setBusy(true);
    setDispatchError(null);
    try {
      let freshLocation: { lat: number; lng: number } | null = null;
      if (!session.location) {
        const perm = await Location.requestForegroundPermissionsAsync();
        if (perm.status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          freshLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setLocation({
            lat: freshLocation.lat,
            lng: freshLocation.lng,
            accuracyMeters: pos.coords.accuracy ?? undefined,
            capturedAt: new Date().toISOString(),
          });
        }
      }
      const loc = pickDispatchLocation(session.location, freshLocation);
      if (!loc) {
        setDispatchResult(null);
        setDispatchError('Location unavailable — enable GPS to dispatch responders.');
        return;
      }
      const { result, error } = await runHttpDispatch(
        {
          incidentType: session.incidentType ?? 'road_accident',
          lat: loc.lat,
          lng: loc.lng,
          language: (settings.language === 'hi' || settings.language === 'ta') ? settings.language : 'en',
          autoDispatchMedical: settings.autoDispatchMedical,
          medical: profile.medical,
          userId: profile.supabaseUserId,
        },
        {
          traumaEndpoint: endpointConfig.trauma,
          policeEndpoint: endpointConfig.police,
          supabase: getSupabaseClient(),
        }
      );
      setDispatchResult(result);
      if (error) setDispatchError(error);
    } finally {
      setBusy(false);
    }
  };

  const notifyVolunteers = async () => {
    const loc = session.location;
    if (!loc) {
      Alert.alert('Location required', 'Capture GPS before requesting alternate transport.');
      return;
    }
    const client = getSupabaseClient();
    if (!client) {
      Alert.alert('Offline', 'Volunteer registry requires Supabase. Open NGO list from Settings when online.');
      return;
    }
    setBusy(true);
    try {
      const volunteers = await listNearbyVerifiedVolunteers(client, loc);
      const notify = buildVolunteerNotifyResult(volunteers);
      if (notify.notified.length === 0) {
        setVolunteerStatus('No verified volunteers within 25 km.');
        Alert.alert(
          'No nearby volunteers',
          'Register providers in NGO registry and verify them in Supabase Studio for demos.'
        );
        return;
      }
      setVolunteerStatus(
        `${notify.notified.length} volunteer(s) found: ${notify.notified.map((v) => v.org_name).join(', ')}`
      );
      Alert.alert(
        'Notify volunteers?',
        `Contact ${notify.smsTargets.length} number(s) via SMS?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Send SMS',
            onPress: () => {
              const first = notify.smsTargets[0];
              const url = toSmsUrl(first);
              if (url) {
                void Linking.openURL(
                  `${url}&body=${encodeURIComponent(
                    `Margi emergency alternate transport needed. Ref: ${dispatchResult?.referenceId ?? 'pending'}`
                  )}`
                );
              }
            },
          },
        ]
      );
    } finally {
      setBusy(false);
    }
  };

  const escalateDispatch = async () => {
    await runDispatch();
    if (dispatchResult?.referenceId) {
      setVolunteerStatus(`Re-dispatch sent · ${dispatchResult.referenceId}`);
    }
  };

  const onSendChat = (text: string) => {
    const msg = text.trim();
    if (!msg) return;
    setChat((prev) => [...prev, { role: 'user', text: msg }]);
    setDraft('');
    if (!sessionId) return;
    engine.recordAnswer(sessionId, msg);
    const sarthiLang = (settings.language === 'hi' || settings.language === 'ta') ? settings.language : 'en';
    const reply = getOfflineTraumaReply(msg, sarthiLang);
    const locale = resolveSpeechLocale(sarthiLang);
    const assistantText = `${reply.message} ${reply.actions[0]}`;
    setChat((prev) => [...prev, { role: 'assistant', text: assistantText }]);
    speakA11y(assistantText, { ...a11y, ttsEnabled: true }, locale);
    if (/not breathing|unconscious|heavy bleeding|bleeding heavy/i.test(msg)) {
      completeTraumaAssessment('RED');
    } else if (/fracture|chest pain|dizzy/i.test(msg)) {
      completeTraumaAssessment('YELLOW');
    } else {
      completeTraumaAssessment('GREEN');
    }
  };

  const activeReply = getOfflineTraumaReply(
    [...chat].reverse().find((c) => c.role === 'user')?.text ?? '',
    (settings.language === 'hi' || settings.language === 'ta') ? settings.language : 'en'
  );

  const traumaCenter = dispatchResult?.traumaCenter ?? {
    name: 'Synchronizing trauma center...',
    phone: '108',
    etaMinutes: null,
  };
  const policeUnit = dispatchResult?.policeUnit ?? {
    name: 'Synchronizing police unit...',
    phone: '112',
    etaMinutes: null,
  };

  const hospitalTarget = resolveHospitalNavTarget(session);
  const icePhone =
    settings.notifyEmergencyContacts !== false
      ? profile.medical?.primaryContact?.phone?.trim() || null
      : null;
  const incidentLabel = session.incidentType?.replace(/_/g, ' ').toUpperCase();

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={tokens.onPrimary} />
        </Pressable>
        <HudText variant="headlineMd" style={styles.headerTitle}>
          TRAUMA RESPONSE
        </HudText>
        <Pressable onPress={() => void runDispatch()}>
          <MaterialIcons name="my-location" size={22} color={tokens.onPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TraumaResponseActionBar
          activatedAt={session.activatedAt ?? session.location?.capturedAt}
          incidentLabel={incidentLabel}
        />

        <View style={styles.voiceBanner}>
          <View style={styles.voiceHead}>
            <HudText variant="mono" style={styles.voiceLabel}>
              SARTHI AI IS SPEAKING
            </HudText>
            <MaterialIcons name="graphic-eq" size={20} color={tokens.secondary} />
          </View>
          <HudText variant="headlineMd" style={styles.voiceText}>
            Calmly follow protocol. Help is on the way.
          </HudText>
          <HudText variant="bodyMd" style={styles.voiceSub}>
            {`Assessment time left: ${Math.floor(remaining / 60)
              .toString()
              .padStart(2, '0')}:${(remaining % 60).toString().padStart(2, '0')}`}
          </HudText>
          <HudText variant="bodySm" style={styles.modeBadge}>
            {mode === 'auto' ? 'AUTO SYSTEM MODE' : 'GUIDED SCROLL MODE'}
          </HudText>
        </View>

        <LanguageSelector value={(settings.language === 'hi' || settings.language === 'ta') ? settings.language : 'en'} onChange={(value) => void updateSettings({ language: value })} />

        {dispatchError ? (
          <View style={styles.infoCard}>
            <HudText variant="bodySm" style={styles.infoText}>
              {dispatchError}
            </HudText>
          </View>
        ) : null}

        {volunteerStatus ? (
          <HudText variant="bodySm" style={{ color: tokens.onSurfaceVariant }}>
            {volunteerStatus}
          </HudText>
        ) : null}

        <FirstAidBoard
          actions={activeReply.actions}
          onPreset={(message) => {
            setDraft(message);
            onSendChat(message);
          }}
        />

        <View style={styles.chatCard}>
          <HudText variant="mono" style={styles.sectionLabel}>
            OFFLINE MEDICAL ASSISTANT
          </HudText>
          <View style={styles.chatList}>
            {chat.slice(-4).map((message, index) => (
              <View
                key={`${message.role}_${index}`}
                style={[styles.bubble, message.role === 'user' ? styles.userBubble : styles.aiBubble]}
              >
                <HudText variant="bodyMd" style={message.role === 'user' ? styles.userText : styles.aiText}>
                  {message.text}
                </HudText>
              </View>
            ))}
          </View>
          <View style={styles.chatComposer}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Describe current health situation..."
              placeholderTextColor={tokens.onSurfaceVariant}
              style={styles.input}
            />
            <Pressable style={styles.sendBtn} onPress={() => onSendChat(draft)}>
              <MaterialIcons name="send" size={18} color={tokens.onPrimary} />
            </Pressable>
          </View>
        </View>

        <TraumaCenterPanel
          traumaCenter={traumaCenter}
          policeUnit={policeUnit}
          dispatchStatus={dispatchResult?.status ?? 'pending'}
          onNavigate={() => router.push('/emergency/route' as Href)}
          onAlternateTransport={() => void notifyVolunteers()}
          onEmergencySignal={() => void escalateDispatch()}
        />

        <View style={styles.mapCard}>
          <HudText variant="mono" style={styles.sectionLabel}>
            CLEAR DIRECTION TO TRAUMA CENTER
          </HudText>
          <View style={styles.mapPlaceholder}>
            <MaterialIcons name="map" size={54} color={tokens.primary} />
            <HudText variant="bodySm" style={{ color: tokens.onSurfaceVariant }}>
              {hospitalTarget
                ? `Navigate to ${hospitalTarget.label}`
                : session.location
                  ? 'Ranking nearest trauma center…'
                  : 'Capture location in emergency flow first'}
            </HudText>
          </View>
          <MargiButton
            label={hospitalTarget ? 'Navigate to Hospital' : 'Open Route'}
            onPress={() => {
              if (hospitalTarget) {
                openMapsNavigate(hospitalTarget.lat, hospitalTarget.lng);
                return;
              }
              router.push('/emergency/route' as Href);
            }}
          />
        </View>

        <View style={styles.qrCard}>
          <HudText variant="headlineMd" style={{ textAlign: 'center', color: tokens.primary }}>
            Bystander QR Handoff
          </HudText>
          <HudText variant="bodySm" style={{ textAlign: 'center', color: tokens.onSurfaceVariant }}>
            Scan to share trauma logs and current guidance snapshot.
          </HudText>
          <View style={styles.qrWrap}>
            <QRCode
              value={JSON.stringify({
                id: dispatchResult?.referenceId ?? 'NOVA-TR',
                incidentType: session.incidentType,
                triage: session.triage,
              })}
              size={160}
              color={tokens.primary}
              backgroundColor="#fff"
            />
          </View>
        </View>

        <View style={styles.bottomActions}>
          <MargiButton
            label={busy ? 'Dispatching...' : 'Refresh Dispatch Status'}
            onPress={() => void runDispatch()}
            variant="ghost"
            disabled={busy}
          />
          <MargiButton label="Proceed to Facility Routing" onPress={() => router.push('/emergency/route' as Href)} large />
          <MargiButton
            label="Cancel SOS"
            onPress={() => {
              resetEmergency();
              router.replace('/(tabs)/explore' as Href);
            }}
            variant="danger"
          />
        </View>
      </ScrollView>

      {icePhone ? (
        <Pressable
          style={styles.iceFab}
          onPress={() => {
            const url = toDialUrl(icePhone);
            if (!url) {
              Alert.alert('Contact unavailable', 'Emergency contact phone is not valid.');
              return;
            }
            void Linking.openURL(url);
          }}
        >
          <MaterialIcons name="contact-phone" size={20} color={tokens.onSecondary} />
          <HudText variant="bodySm" style={{ color: tokens.onSecondary, fontFamily: 'PublicSans_700Bold' }}>
            CALL ICE
          </HudText>
        </Pressable>
      ) : null}
      <Pressable
        style={[styles.fab, icePhone ? styles.fabWithIce : null]}
        onPress={() => {
          const url = toDialUrl(traumaCenter.phone);
          if (!url) {
            Alert.alert('Contact unavailable', 'Trauma center phone is still being synchronized.');
            return;
          }
          void Linking.openURL(url);
        }}
      >
        <MaterialIcons name="call" size={20} color={tokens.onPrimary} />
        <HudText variant="bodySm" style={{ color: tokens.onPrimary, fontFamily: 'PublicSans_700Bold' }}>
          CALL CENTER
        </HudText>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.background },
  header: {
    height: 64,
    backgroundColor: tokens.primary,
    paddingHorizontal: tokens.spacing.sideMargin,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { color: tokens.onPrimary, fontFamily: 'HankenGrotesk_700Bold' },
  scroll: {
    padding: tokens.spacing.gutter,
    gap: tokens.spacing.gutter,
    paddingBottom: 120,
  },
  voiceBanner: {
    borderRadius: tokens.radius.card,
    backgroundColor: tokens.primaryContainer,
    borderLeftWidth: 4,
    borderLeftColor: tokens.secondary,
    padding: 12,
    gap: 8,
  },
  voiceHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  voiceLabel: { color: tokens.secondary, letterSpacing: 1, fontFamily: 'PublicSans_700Bold' },
  voiceText: { color: tokens.onPrimaryContainer, fontFamily: 'HankenGrotesk_700Bold' },
  voiceSub: { color: tokens.onSurfaceVariant },
  modeBadge: { color: tokens.secondary, fontFamily: 'PublicSans_700Bold', letterSpacing: 1 },
  infoCard: {
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    backgroundColor: tokens.surfaceContainerHigh,
    padding: 12,
  },
  infoText: { color: tokens.onSurfaceVariant },
  chatCard: {
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    borderRadius: tokens.radius.card,
    backgroundColor: tokens.surface,
    padding: 12,
    gap: 10,
  },
  sectionLabel: { color: tokens.primary, letterSpacing: 1, fontFamily: 'PublicSans_700Bold' },
  chatList: { gap: 8 },
  bubble: { borderRadius: tokens.radius.button, padding: 10 },
  aiBubble: {
    backgroundColor: tokens.surfaceContainerHigh,
    borderLeftWidth: 3,
    borderLeftColor: tokens.secondary,
  },
  userBubble: { backgroundColor: tokens.primary },
  aiText: { color: tokens.onSurface },
  userText: { color: tokens.onPrimary },
  chatComposer: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  input: {
    flex: 1,
    minHeight: 42,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    borderRadius: tokens.radius.input,
    paddingHorizontal: 10,
    color: tokens.onSurface,
    backgroundColor: tokens.surfaceContainerLow,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.primary,
  },
  mapCard: {
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    borderRadius: tokens.radius.card,
    backgroundColor: tokens.surface,
    padding: 12,
    gap: 10,
  },
  mapPlaceholder: {
    minHeight: 140,
    borderRadius: tokens.radius.button,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: tokens.surfaceContainerLow,
  },
  qrCard: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: tokens.outline,
    borderRadius: tokens.radius.card,
    backgroundColor: tokens.surfaceContainerHigh,
    padding: 14,
    gap: 8,
  },
  qrWrap: {
    alignSelf: 'center',
    padding: 10,
    borderRadius: tokens.radius.button,
    backgroundColor: '#fff',
  },
  bottomActions: { gap: 10 },
  iceFab: {
    position: 'absolute',
    right: 16,
    bottom: 72,
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: tokens.secondaryContainer,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...tokens.elevation.card,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: tokens.primary,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...tokens.elevation.card,
  },
  fabWithIce: { bottom: 16 },
});
