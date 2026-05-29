import type { Lang } from '../types';
import type { SarthiActionCard } from '../sarthiTypes';

export type SarthiKbCategory =
  | 'emergency'
  | 'road_safety'
  | 'journey'
  | 'breakdown'
  | 'distress'
  | 'app_help';

export type SarthiKbEntry = {
  id: string;
  category: SarthiKbCategory;
  patterns: RegExp[];
  priority: number;
  replies: Record<Lang, string>;
  actionCards?: Record<Lang, SarthiActionCard>;
};

export const SARTHI_KB_ENTRIES: SarthiKbEntry[] = [
  {
    id: 'crash_accident',
    category: 'emergency',
    patterns: [/crash|accident|collision|hit (a |the )?car|rollover|overturned/i],
    priority: 95,
    replies: {
      en: '{{name}}, stay calm. If safe, enable hazard lights. Hold SOS on the journey HUD or use Quick SOS from Home. Do not move anyone with neck pain unless immediate danger.',
      hi: '{{name}}, शांत रहें। सुरक्षित हो तो हैज़ार्ड लाइट चालू करें। यात्रा HUD पर SOS दबाए रखें या होम से Quick SOS। गर्दन दर्द में तुरंत खतरे के बिना किसी को न हिलाएं।',
      ta: '{{name}}, அமைதியாக இருங்கள். பாதுகாப்பானால் ஹேசார்ட் லைட் இயக்குங்கள். பயண HUD-ல் SOS அழுத்துங்கள் அல்லது வீட்டிலிருந்து Quick SOS.',
    },
    actionCards: {
      en: { title: 'Crash response', subtitle: 'SOS · Triage · 108 when signal returns' },
      hi: { title: 'दुर्घटना प्रतिक्रिया', subtitle: 'SOS · ट्राइएज · 108' },
      ta: { title: 'விபத்து பதில்', subtitle: 'SOS · ட்ரையேஜ் · 108' },
    },
  },
  {
    id: 'fire_vehicle',
    category: 'emergency',
    patterns: [/fire|smoke|burning|flames|vehicle on fire/i],
    priority: 94,
    replies: {
      en: '{{name}}, get everyone away from the vehicle immediately. Call 108 when possible. Do not open a smoking hood. Use SOS if you cannot dial.',
      hi: '{{name}}, सभी को तुरंत वाहन से दूर ले जाएं। संभव हो तो 108 पर कॉल करें। धुआँ वाला बोनट न खोलें।',
      ta: '{{name}}, அனைவரையும் உடனே வாகனத்திலிருந்து வெளியேற்றுங்கள். முடிந்தால் 108 அழைக்கவும்.',
    },
  },
  {
    id: 'trapped',
    category: 'emergency',
    patterns: [/trapped|stuck in (car|vehicle)|cannot get out|door jammed/i],
    priority: 93,
    replies: {
      en: '{{name}}, keep the phone charged. Tap SOS — responders get your last known corridor context. If fuel or smoke smell, try windows; avoid forcing doors near airbags.',
      hi: '{{name}}, फोन चार्ज रखें। SOS दबाएं — रेस्पॉन्डर्स को आपका कॉरिडोर संदर्भ मिलेगा। धुआँ/ईंधन गंध हो तो खिड़की आज़माएं।',
      ta: '{{name}}, போன் சார்ஜ் வைத்திருங்கள். SOS அழுத்துங்கள் — உங்கள் காரிடார் சூழல் பகிரப்படும்.',
    },
  },
  {
    id: 'bleeding',
    category: 'emergency',
    patterns: [/bleeding|blood loss|heavy blood|hemorrhage/i],
    priority: 92,
    replies: {
      en: '{{name}}, apply firm pressure with a clean cloth. Start emergency triage flow for START tags. Golden Hour Packet shares medical info if you filled Profile.',
      hi: '{{name}}, साफ कपड़े से दबाव रखें। आपात ट्राइएज फ्लो शुरू करें। प्रोफ़ाइल में चिकित्सा जानकारी GHP में जाती है।',
      ta: '{{name}}, சுத்த துணியால் அழுத்துங்கள். அவசர ட்ரையேஜ் தொடங்குங்கள். சுயவிவர மருத்துவ தகவல் GHP-ல் சேரும்.',
    },
  },
  {
    id: 'not_breathing',
    category: 'emergency',
    patterns: [/not breathing|no breathing|stopped breathing|cannot breathe/i],
    priority: 96,
    replies: {
      en: '{{name}}, call 108 if possible. Start chest compressions if trained. Open emergency triage — say "not breathing" so START maps the red pathway.',
      hi: '{{name}}, संभव हो तो 108। प्रशिक्षित हों तो सीपीआर। ट्राइएज में "साँस नहीं" बोलें।',
      ta: '{{name}}, முடிந்தால் 108. பயிற்சி இருந்தால் செஸ்ட் கம்ப்ரெஷன். ட்ரையேஜில் "மூச்சு இல்லை" சொல்லுங்கள்.',
    },
  },
  {
    id: 'unconscious',
    category: 'emergency',
    patterns: [/unconscious|unresponsive|not responding|passed out/i],
    priority: 95,
    replies: {
      en: '{{name}}, check breathing. Do not give food or drink. Use SOS and triage — keywords map consciousness slots offline.',
      hi: '{{name}}, साँस जाँचें। खाना-पानी न दें। SOS और ट्राइएज — कीवर्ड ऑफ़लाइन स्लॉट भरते हैं।',
      ta: '{{name}}, மூச்சு பாருங்கள். உணவு குடிக்க வைக்காதீர். SOS மற்றும் ட்ரையேஜ்.',
    },
  },
  {
    id: 'chest_pain',
    category: 'emergency',
    patterns: [/chest pain|heart attack|cardiac|crushing chest/i],
    priority: 91,
    replies: {
      en: '{{name}}, sit upright, loosen tight clothing, avoid driving. Dial 108. If you have nitro spray prescribed, use as directed only.',
      hi: '{{name}}, सीधे बैठें, कपड़े ढीले करें, गाड़ी न चलाएं। 108 पर कॉल करें।',
      ta: '{{name}}, நேராக உட்காருங்கள், இறுக்கமான ஆடை தளர்வு, வாகனம் ஓட்டாதீர். 108 அழைக்கவும்.',
    },
  },
  {
    id: 'sos_help',
    category: 'road_safety',
    patterns: [/sos|emergency help|need help now|save me/i],
    priority: 90,
    replies: {
      en: '{{name}}, use Hold SOS (3s) on the live journey screen or Quick SOS on Home. I will not auto-dial 108 without your confirmation in this app.',
      hi: '{{name}}, लाइव यात्रा पर SOS दबाए रखें (3s) या होम पर Quick SOS। ऐप बिना पुष्टि 108 नहीं मिलाता।',
      ta: '{{name}}, நேரடி பயண திரையில் SOS (3s) அல்லது வீட்டில் Quick SOS. உறுதி இல்லாமல் 108 இல்லை.',
    },
    actionCards: {
      en: { title: 'Emergency actions', subtitle: 'SOS · Triage · Notify contacts' },
      hi: { title: 'आपात कदम', subtitle: 'SOS · ट्राइएज · संपर्क' },
      ta: { title: 'அவசர நடவடிக்கை', subtitle: 'SOS · ட்ரையேஜ் · தொடர்பு' },
    },
  },
  {
    id: 'call_108',
    category: 'road_safety',
    patterns: [/108|ambulance|call ambulance|emergency number/i],
    priority: 88,
    replies: {
      en: '{{name}}, dial 108 when signal allows. Offline: complete triage and Golden Hour Packet — bystander QR can relay when network returns.',
      hi: '{{name}}, सिग्नल हो तो 108 डायल करें। ऑफ़लाइन: ट्राइएज और GHP पूरा करें — QR रिले कर सकता है।',
      ta: '{{name}}, சிக்னல் இருந்தால் 108. ஆஃப்லைன்: ட்ரையேஜ் + GHP — QR ரிலே செய்யும்.',
    },
  },
  {
    id: 'triage_start',
    category: 'road_safety',
    patterns: [/triage|start triage|injured|casualt/i],
    replies: {
      en: '{{name}}, open emergency flow → triage chat. Say breathing, walking, and consciousness in short phrases — offline parser fills START slots.',
      hi: '{{name}}, आपात फ्लो → ट्राइएज चैट। साँस, चलना, होश के बारे में छोटे वाक्य बोलें।',
      ta: '{{name}}, அவசர ஓட்டம் → ட்ரையேஜ் அரட்டை. மூச்சு, நடத்தல், உணர்வு சொல்லுங்கள்.',
    },
    priority: 85,
  },
  {
    id: 'bystander_qr',
    category: 'road_safety',
    patterns: [/bystander|qr code|scan qr|golden hour|ghp|packet/i],
    priority: 80,
    replies: {
      en: '{{name}}, Home → Bystander QR lets others scan your Golden Hour Packet. Relay caches securely for SMS 108 intent when online.',
      hi: '{{name}}, होम → बाईस्टैंडर QR से GHP स्कैन। ऑनलाइन होने पर 108 SMS इरादा।',
      ta: '{{name}}, வீடு → பைஸ்டாண்டர் QR. GHP ஸ்கேன். ஆன்லைனில் 108 SMS.',
    },
  },
  {
    id: 'plan_corridor',
    category: 'journey',
    patterns: [/corridor|route|nh-|highway|plan (a )?trip|drive plan/i],
    priority: 75,
    replies: {
      en: '{{name}}, open Trip tab to plan {{corridor}}. Start Driving only when ready — calibration runs before the live HUD.',
      hi: '{{name}}, ट्रिप टैब में {{corridor}} प्लान करें। तैयार होने पर ही Start Driving — कैलिब्रेशन पहले।',
      ta: '{{name}}, ட்ரிப் தாவலில் {{corridor}} திட்டமிடுங்கள். தயாரான பிறகே Start Driving.',
    },
    actionCards: {
      en: { title: 'Plan corridor', subtitle: 'NH routes · Offline maps in Trip' },
      hi: { title: 'कॉरिडोर योजना', subtitle: 'NH मार्ग · ऑफ़लाइन मानचित्र' },
      ta: { title: 'காரிடார் திட்டம்', subtitle: 'NH பாதை · ஆஃப்லைன் வரைபடம்' },
    },
  },
  {
    id: 'journey_active',
    category: 'journey',
    patterns: [/active journey|driving now|on road|live hud|speedometer/i],
    priority: 74,
    replies: {
      en: '{{name}}, your journey is ACTIVE — Hold SOS is on the HUD. Voice crash detection follows Settings.',
      hi: '{{name}}, यात्रा ACTIVE — HUD पर Hold SOS। वॉइस क्रैश सेटिंग्स से।',
      ta: '{{name}}, பயணம் ACTIVE — HUD-ல் Hold SOS. குரல் கண்டறிதல் அமைப்புகள்.',
    },
  },
  {
    id: 'calibration',
    category: 'journey',
    patterns: [/calibrat|sensor check|before drive/i],
    priority: 70,
    replies: {
      en: '{{name}}, calibration aligns GPS and motion before monitoring. Complete all steps on the depart screen — do not skip if judges/demo need sensor proof.',
      hi: '{{name}}, कैलिब्रेशन GPS और मोशन संरेखित करता है। प्रस्थान स्क्रीन के सभी चरण पूरे करें।',
      ta: '{{name}}, காலிபிரேஷன் GPS மற்றும் இயக்கம் சீரமைக்கிறது. புறப்படும் திரையில் அனைத்து படிகளும்.',
    },
  },
  {
    id: 'fatigue_sleep',
    category: 'journey',
    patterns: [/tired|sleepy|fatigue|drowsy|yawn/i],
    priority: 72,
    replies: {
      en: '{{name}}, pull over safely, rest 15–20 minutes, hydrate. Do not rely on Sarthi while driving — park first. Resume only when alert.',
      hi: '{{name}}, सुरक्षित रुकें, 15–20 मिनट आराम, पानी। गाड़ी चलाते सारथी पर भरोसा न करें — पहले पार्क करें।',
      ta: '{{name}}, பாதுகாப்பாக நிறுத்தி 15–20 நிமிடம் ஓய்வு. ஓட்டும்போது சார்த்தியை நம்பாதீர்.',
    },
  },
  {
    id: 'flat_tire',
    category: 'breakdown',
    patterns: [/flat tire|puncture|tyre burst|wheel damage/i],
    priority: 68,
    replies: {
      en: '{{name}}, move to shoulder, hazards on, triangle if available. Change tire only if safe; else call highway assistance or 108 if injured.',
      hi: '{{name}}, कंधे पर रुकें, हैज़ार्ड चालू। सुरक्षित हो तो टायर बदलें; नहीं तो सहायता/108।',
      ta: '{{name}}, சாலை விளிம்பில் நிறுத்தி ஹேசார்ட். பாதுகாப்பானால் டயர் மாற்றம்; இல்லையெனில் உதவி/108.',
    },
  },
  {
    id: 'fuel_empty',
    category: 'breakdown',
    patterns: [/out of fuel|no petrol|no diesel|ran out of gas/i],
    priority: 65,
    replies: {
      en: '{{name}}, stay inside vehicle if on a busy NH shoulder. Share location with a contact. Trip tab saved corridors help explain where you are.',
      hi: '{{name}}, व्यस्त NH कंधे पर वाहन में रहें। संपर्क को स्थान भेजें।',
      ta: '{{name}}, பிஸி NH விளிம்பில் வாகனத்தில் இருங்கள். தொடர்புக்கு இடம் அனுப்புங்கள்.',
    },
  },
  {
    id: 'weather_fog',
    category: 'breakdown',
    patterns: [/fog|rain|storm|cyclone|flooded|visibility low|slippery/i],
    priority: 67,
    replies: {
      en: '{{name}}, reduce speed, increase following distance, low beams in fog. Consider pausing journey in Settings until conditions improve.',
      hi: '{{name}}, गति कम करें, दूरी बढ़ाएं, कोहरे में लो बीम। सुधार तक यात्रा रोकें।',
      ta: '{{name}}, வேகம் குறைத்து தூரம் அதிகரிக்கவும். மேம்படும் வரை பயணம் இடைநிறுத்தம்.',
    },
  },
  {
    id: 'harassment',
    category: 'distress',
    patterns: [/harass|stalk|following me|unsafe person|threaten/i],
    priority: 86,
    replies: {
      en: '{{name}}, drive to a lit public place or police outpost if possible. Share live location with a trusted contact. SOS records context for responders.',
      hi: '{{name}}, संभव हो तो रोशनी वाले सार्वजनिक स्थान/पुलिस चौकी की ओर जाएं। विश्वसनीय संपर्क को लाइव लोकेशन भेजें।',
      ta: '{{name}}, முடிந்தால் வெளிச்சமுள்ள பொது இடம்/போலீஸ் நோக்கி செல்லுங்கள். நம்பகமான தொடர்புக்கு இடம் அனுப்புங்கள்.',
    },
  },
  {
    id: 'alone_night',
    category: 'distress',
    patterns: [/alone at night|night drive|scared|unsafe road/i],
    priority: 73,
    replies: {
      en: '{{name}}, keep SOS reachable. Tell someone your corridor and ETA. Regional protocols in Settings tune local guidance.',
      hi: '{{name}}, SOS हाथ के पास रखें। किसी को कॉरिडोर और ETA बताएं। सेटिंग्स में क्षेत्रीय प्रोटोकॉल।',
      ta: '{{name}}, SOS அருகில் வைத்திருங்கள். காரிடார் மற்றும் ETA யாருக்காவது சொல்லுங்கள்.',
    },
  },
  {
    id: 'panic_anxiety',
    category: 'distress',
    patterns: [/panic|anxiety|stressed|cannot calm/i],
    priority: 71,
    replies: {
      en: '{{name}}, park safely if driving. Breathe slowly: in 4 counts, out 6. I guide road safety, not medical diagnosis — call 108 if chest pain or faintness.',
      hi: '{{name}}, गाड़ी चलाते हों तो सुरक्षित पार्क। धीरे साँस: अंदर 4, बाहर 6। छाती दर्द/बेहोशी पर 108।',
      ta: '{{name}}, ஓட்டினால் பாதுகாப்பாக நிறுத்துங்கள். மெதுவாக மூச்சு: உள்ளே 4, வெளியே 6. மார்பு வலி/மயக்கம் 108.',
    },
  },
  {
    id: 'offline_mode',
    category: 'app_help',
    patterns: [/offline|no signal|no network|airplane/i],
    priority: 60,
    replies: {
      en: '{{name}}, offline mode uses this safety library on-device. SOS, triage keywords, and Golden Hour Packet still work.',
      hi: '{{name}}, ऑफ़लाइन मोड इस सुरक्षा पुस्तकालय का उपयोग करता है। SOS, ट्राइएज, GHP काम करते हैं।',
      ta: '{{name}}, ஆஃப்லைன் பாதுகாப்பு நூலகம் சாதனத்தில். SOS, ட்ரையேஜ், GHP வேலை செய்யும்.',
    },
  },
  {
    id: 'language_settings',
    category: 'app_help',
    patterns: [/language|hindi|tamil|english|மொழி|भाषा/i],
    priority: 55,
    replies: {
      en: '{{name}}, change language in Profile → Settings → Regional & Language. Sarthi follows that choice online and offline.',
      hi: '{{name}}, प्रोफ़ाइल → सेटिंग्स → क्षेत्रीय और भाषा में बदलें। सारथी ऑनलाइन/ऑफ़लाइन दोनों में उसी का पालन करता है।',
      ta: '{{name}}, சுயவிவரம் → அமைப்புகள் → மொழி மாற்றம். சார்த்தி ஆன்லைன்/ஆஃப்லைன் இரண்டிலும் பின்பற்றும்.',
    },
  },
  {
    id: 'profile_medical',
    category: 'app_help',
    patterns: [/profile|medical info|blood type|allerg|ice contact/i],
    priority: 58,
    replies: {
      en: '{{name}}, Profile and Medical screens store data for Golden Hour Packet only on your phone. Add ICE contacts for SOS notify.',
      hi: '{{name}}, प्रोफ़ाइल/मेडिकल डेटा फोन पर GHP के लिए। SOS सूचना के लिए ICE संपर्क जोड़ें।',
      ta: '{{name}}, சுயவிவர/மருத்துவ தகவல் GHP-க்கு தொலைபேசியில். SOS-க்கு ICE தொடர்பு சேர்க்கவும்.',
    },
  },
  {
    id: 'guest_identity',
    category: 'app_help',
    patterns: [/who am i|my name|account|sign in|guest/i],
    priority: 50,
    replies: {
      en: '{{name}}, you are using Margi as {{mode}}. Add your name and medical info in Profile for personalized Sarthi and packet handoff.',
      hi: '{{name}}, आप {{mode}} के रूप में Margi उपयोग कर रहे हैं। व्यक्तिगत सारथी के लिए प्रोफ़ाइल में नाम/चिकित्सा जोड़ें।',
      ta: '{{name}}, நீங்கள் {{mode}} ஆக Margi பயன்படுத்துகிறீர்கள். சுயவிவரத்தில் பெயர்/மருத்துவம் சேர்க்கவும்.',
    },
  },
  {
    id: 'offline_sarthi',
    category: 'app_help',
    patterns: [/offline|no network|no signal|airplane|dead zone/i],
    priority: 72,
    replies: {
      en: '{{name}}, Sarthi offline KB covers SOS, START triage, GHP, QR relay, and Naari Shakti. Emergency flow works without internet.',
      hi: '{{name}}, ऑफ़लाइन Sarthi KB में SOS, START ट्रायेज, GHP, QR रिले, Naari Shakti शामिल हैं।',
      ta: '{{name}}, ஆஃப்லைன் Sarthi KB-ல் SOS, START triage, GHP, QR relay, Naari Shakti உள்ளன.',
    },
  },
  {
    id: 'crash_detection_help',
    category: 'distress',
    patterns: [/crash detect|impact|accelerometer|g-force|pothole/i],
    priority: 68,
    replies: {
      en: '{{name}}, crash detection is experimental (default ~2.8g peak + speed drop). Adjust sensitivity in Profile. Always confirm manually — no auto-dial.',
      hi: '{{name}}, क्रैश पहचान प्रयोगात्मक (~2.8g). प्रोफ़ाइल में संवेदनशीलता बदलें। हमेशा मैन्युअल पुष्टि करें।',
      ta: '{{name}}, crash detection experimental (~2.8g). Profile-ல் sensitivity மாற்றவும். கைமுறையாக confirm செய்யவும்.',
    },
  },
  {
    id: 'voice_experimental',
    category: 'distress',
    patterns: [/voice detect|scream|distress voice|yamnet/i],
    priority: 68,
    replies: {
      en: '{{name}}, distress voice is experimental — not validated on highway noise. Toggle in Profile → Voice Crash Detection.',
      hi: '{{name}}, distress voice प्रयोगात्मक — हाईवे शोर पर सत्यापित नहीं। प्रोफ़ाइल में टॉगल करें।',
      ta: '{{name}}, distress voice experimental — highway noise-க்கு validate இல்லை. Profile-ல் toggle.',
    },
  },
  {
    id: 'bystander_relay',
    category: 'distress',
    patterns: [/bystander|relay|scan qr|qr code/i],
    priority: 75,
    replies: {
      en: '{{name}}, show GHP QR on packet screen. Bystander scans in Margi or opens the web relay link — SMS 108 when signal returns.',
      hi: '{{name}}, GHP QR दिखाएं। Upyatri Margi scan या web relay link — signal आने पर SMS 108।',
      ta: '{{name}}, GHP QR காட்டவும். Bystander Margi scan அல்லது web relay — signal வந்தால் SMS 108.',
    },
  },
  {
    id: 'poi_disclaimer',
    category: 'distress',
    patterns: [/hospital data|poi|facility|trauma center|verified/i],
    priority: 65,
    replies: {
      en: '{{name}}, this build ships ~50 demo POIs (11 curated NH48 names + corridor padding). Always verify facility by phone — not NHA registry synced.',
      hi: '{{name}}, ~50 demo POI (11 curated + padding). फोन से सुविधा verify करें — NHA sync नहीं।',
      ta: '{{name}}, ~50 demo POI. தொலைபேசியில் facility verify — NHA sync இல்லை.',
    },
  },
  {
    id: 'start_disclaimer',
    category: 'distress',
    patterns: [/start triage|medical authority|diagnosis|doctor/i],
    priority: 70,
    replies: {
      en: '{{name}}, START triage is decision support only — not a diagnosis. Call 108/112 when possible. Based on public START protocol, not physician-certified in this build.',
      hi: '{{name}}, START triage केवल decision support — diagnosis नहीं। 108/112 कॉल करें।',
      ta: '{{name}}, START triage decision support மட்டும் — diagnosis அல்ல. 108/112 அழைக்கவும்.',
    },
  },
];

const LANGS: Lang[] = ['en', 'hi', 'ta'];

export function validateKnowledgeBase(entries: SarthiKbEntry[] = SARTHI_KB_ENTRIES): string[] {
  const errors: string[] = [];
  for (const e of entries) {
    for (const lang of LANGS) {
      if (!e.replies[lang]?.trim()) errors.push(`${e.id} missing reply.${lang}`);
    }
  }
  return errors;
}

export type SarthiKbMatch = {
  entry: SarthiKbEntry;
  priority: number;
};

export function matchKnowledgeBase(text: string): SarthiKbMatch | null {
  const lower = text.trim();
  if (!lower) return null;

  let best: SarthiKbMatch | null = null;
  for (const entry of SARTHI_KB_ENTRIES) {
    if (!entry.patterns.some((p) => p.test(lower))) continue;
    if (!best || entry.priority > best.priority) {
      best = { entry, priority: entry.priority };
    }
  }
  return best;
}

export function shouldUseOfflineFirst(match: SarthiKbMatch | null): boolean {
  return match !== null && match.priority >= 70;
}
