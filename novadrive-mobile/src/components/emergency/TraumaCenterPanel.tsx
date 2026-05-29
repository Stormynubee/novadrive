import { Alert, Linking, Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { HudText } from '../HudText';
import { MargiButton } from '../MargiButton';
import { toDialUrl, toSmsUrl } from '../../lib/emergency/contactActions';
import { tokens } from '../../theme/tokens';

type CenterInfo = {
  name: string;
  phone: string;
  etaMinutes: number | null;
};

type PoliceInfo = {
  name: string;
  phone: string;
  etaMinutes: number | null;
};

export function TraumaCenterPanel({
  traumaCenter,
  policeUnit,
  dispatchStatus,
  onNavigate,
  onEmergencySignal,
  onAlternateTransport,
}: {
  traumaCenter: CenterInfo;
  policeUnit: PoliceInfo;
  dispatchStatus: 'dispatched' | 'partial' | 'failed' | 'pending';
  onNavigate: () => void;
  onEmergencySignal: () => void;
  onAlternateTransport: () => void;
}) {
  const erStatusLabel =
    dispatchStatus === 'dispatched' ? 'READY' : dispatchStatus === 'partial' ? 'PARTIAL' : 'PENDING';
  const erStatusMeta =
    dispatchStatus === 'dispatched'
      ? 'Live dispatch channel active'
      : dispatchStatus === 'partial'
        ? 'One or more units pending confirmation'
        : 'Dispatch synchronization in progress';
  const policeEtaLabel =
    typeof policeUnit.etaMinutes === 'number' ? `ETA ${policeUnit.etaMinutes} MIN` : 'AWAITING UNIT';

  return (
    <View style={styles.wrap}>
      <View style={styles.heading}>
        <MaterialIcons name="local-hospital" size={18} color={tokens.primary} />
        <HudText variant="mono" style={styles.headingText}>
          TRAUMA CENTER COORDINATION
        </HudText>
      </View>

      <View style={styles.centerCard}>
        <View style={styles.centerMain}>
          <HudText variant="bodySm" style={styles.kicker}>
            NEAREST TRAUMA CENTER
          </HudText>
          <HudText variant="headlineMd" style={styles.centerName}>
            {traumaCenter.name}
          </HudText>
          <HudText variant="bodySm" style={styles.meta}>
            {typeof traumaCenter.etaMinutes === 'number'
              ? `ETA ${traumaCenter.etaMinutes} min`
              : 'ETA pending'}{' '}
            · {traumaCenter.phone}
          </HudText>
        </View>
        <MargiButton label="Navigate" onPress={onNavigate} />
      </View>

      <View style={styles.statusGrid}>
        <View style={[styles.statusCard, styles.ok]}>
          <HudText variant="mono" style={styles.statusKicker}>
            ER STATUS
          </HudText>
          <HudText variant="headlineMd" style={styles.okText}>
            {erStatusLabel}
          </HudText>
          <HudText variant="bodySm" style={styles.statusMeta}>
            {erStatusMeta}
          </HudText>
        </View>
        <View style={[styles.statusCard, styles.warn]}>
          <HudText variant="mono" style={styles.statusKicker}>
            POLICE UNIT
          </HudText>
          <HudText variant="headlineMd" style={styles.warnText}>
            {policeEtaLabel}
          </HudText>
          <HudText variant="bodySm" style={styles.statusMeta}>
            {policeUnit.name}
          </HudText>
        </View>
      </View>

      <View style={styles.actions}>
        <MargiButton label="Request Alternate" variant="ghost" onPress={onAlternateTransport} />
        <MargiButton label="Emergency Signal" variant="secondary" onPress={onEmergencySignal} />
      </View>

      <View style={styles.contacts}>
        <HudText variant="mono" style={styles.contactsTitle}>
          ONSITE CONTACTS
        </HudText>
        <ContactRow
          name="Lead Coordinator"
          detail={traumaCenter.name}
          icon="call"
          onPress={() => {
            const url = toDialUrl(traumaCenter.phone);
            if (!url) {
              Alert.alert('Contact unavailable', 'Coordinator phone number is still being synchronized.');
              return;
            }
            void Linking.openURL(url);
          }}
        />
        <ContactRow
          name="Police Dispatch"
          detail={policeUnit.name}
          icon="chat"
          onPress={() => {
            const url = toSmsUrl(policeUnit.phone);
            if (!url) {
              Alert.alert('Contact unavailable', 'Police contact is still being synchronized.');
              return;
            }
            void Linking.openURL(url);
          }}
        />
      </View>
    </View>
  );
}

function ContactRow({
  name,
  detail,
  icon,
  onPress,
}: {
  name: string;
  detail: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
}) {
  return (
    <View style={styles.contactRow}>
      <View style={{ flex: 1 }}>
        <HudText variant="bodyMd" style={styles.contactName}>
          {name}
        </HudText>
        <HudText variant="bodySm" style={styles.contactDetail}>
          {detail}
        </HudText>
      </View>
      <Pressable onPress={onPress} style={styles.iconBtn}>
        <MaterialIcons name={icon} size={20} color={tokens.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: tokens.outlineVariant,
    paddingBottom: 8,
  },
  headingText: { color: tokens.primary, letterSpacing: 1, fontFamily: 'PublicSans_700Bold' },
  centerCard: {
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    borderRadius: tokens.radius.card,
    padding: 12,
    backgroundColor: tokens.surface,
    gap: 10,
  },
  centerMain: { gap: 4 },
  kicker: { color: tokens.onSurfaceVariant, fontFamily: 'PublicSans_700Bold', letterSpacing: 1 },
  centerName: { color: tokens.primary, fontFamily: 'HankenGrotesk_700Bold' },
  meta: { color: tokens.onSurfaceVariant },
  statusGrid: { flexDirection: 'row', gap: 10 },
  statusCard: {
    flex: 1,
    borderRadius: tokens.radius.card,
    borderLeftWidth: 4,
    padding: 10,
    backgroundColor: tokens.surfaceContainerLow,
  },
  ok: { borderLeftColor: tokens.tertiary },
  warn: { borderLeftColor: tokens.secondary },
  statusKicker: { color: tokens.onSurfaceVariant, fontSize: 10 },
  okText: { color: tokens.tertiary, fontFamily: 'HankenGrotesk_700Bold' },
  warnText: { color: tokens.secondaryDeep, fontFamily: 'HankenGrotesk_700Bold' },
  statusMeta: { color: tokens.onSurfaceVariant },
  actions: { flexDirection: 'row', gap: 10 },
  contacts: {
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    borderRadius: tokens.radius.card,
    padding: 10,
    backgroundColor: tokens.surfaceContainerLow,
    gap: 8,
  },
  contactsTitle: { color: tokens.onSurfaceVariant, letterSpacing: 1, fontFamily: 'PublicSans_700Bold' },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: tokens.outlineVariant,
    borderRadius: tokens.radius.button,
    padding: 10,
    backgroundColor: tokens.surface,
  },
  contactName: { color: tokens.primary, fontFamily: 'PublicSans_700Bold' },
  contactDetail: { color: tokens.onSurfaceVariant },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.primaryFixed,
  },
});
