// Conversational AI knowledge base for Dr. Aayushi's clinic
// Covers symptoms, services, booking, timings, and general gynaecological guidance

export interface BotResponse {
  text: string;
  followUps?: string[];
}

// Normalize user input
function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Keyword matcher — returns score 0..n
function score(text: string, keywords: string[]): number {
  return keywords.filter((kw) => text.includes(kw)).length;
}

type Rule = {
  keywords: string[];
  response: BotResponse;
  minScore?: number;
};

const RULES: Rule[] = [
  // ── Greetings ───────────────────────────────────────────────────
  {
    keywords: ['hello', 'hi', 'hey', 'namaste', 'namaskar', 'good morning', 'good afternoon', 'good evening'],
    response: {
      text: "Namaste! I'm Aayushi AI, your virtual health assistant for Dr. Aayushi's Navjeevan Clinic. I'm here to help you with any questions about women's health, our services, or booking an appointment.\n\nWhat's on your mind today?",
      followUps: ['Book an appointment', 'Know about PCOS', 'Pregnancy related query', 'Check clinic timings'],
    },
  },

  // ── Booking / Appointment ───────────────────────────────────────
  {
    keywords: ['book', 'appointment', 'visit', 'schedule', 'slot', 'appoint', 'consult', 'meet doctor', 'see doctor'],
    response: {
      text: "I'd be happy to help you book an appointment with Dr. Aayushi!\n\nYou can:\n• **Book online** — use the Booking page on this website\n• **Call us** — 74289 26418\n• **WhatsApp** — same number, available 24/7\n\nDr. Aayushi is available:\n• **Mon–Sat:** 9:00 AM – 1:00 PM & 5:00 PM – 8:00 PM\n• **Sunday:** Closed\n\nWould you like me to tell you what to expect at your first visit?",
      followUps: ['What happens at first visit?', 'Check clinic timings', 'Call now'],
    },
  },

  // ── Clinic timings ─────────────────────────────────────────────
  {
    keywords: ['timing', 'timings', 'hours', 'time', 'open', 'closed', 'schedule', 'days', 'sunday', 'monday', 'saturday', 'weekend'],
    response: {
      text: "**Navjeevan Clinic Timings:**\n\n🕘 **Monday – Saturday**\n   Morning: 9:00 AM – 1:00 PM\n   Evening: 5:00 PM – 8:00 PM\n\n🕙 **Sunday**\n   Closed\n\n📍 The clinic is closed on major public holidays.\n\nFor urgent queries, you can call **74289 26418** anytime — emergency availability is provided.",
      followUps: ['Book an appointment', 'Where is the clinic?', 'Emergency contact'],
    },
  },

  // ── Location / address ─────────────────────────────────────────
  {
    keywords: ['address', 'location', 'where', 'located', 'place', 'directions', 'reach', 'map', 'area', 'city'],
    response: {
      text: "Navjeevan Clinic is conveniently located and easily accessible.\n\nFor the exact address and directions, please:\n• **Call us:** 74289 26418\n• **WhatsApp:** 74289 26418\n\nOur staff will share the precise location and help you with directions!",
      followUps: ['Book an appointment', 'Check clinic timings'],
    },
  },

  // ── Emergency ──────────────────────────────────────────────────
  {
    keywords: ['emergency', 'urgent', 'serious', 'danger', 'bleeding', 'pain severe', 'severe pain', 'immediately', 'right now', 'asap'],
    response: {
      text: "⚠️ **If this is a medical emergency, please call immediately:**\n\n📞 **74289 26418**\n\nDr. Aayushi provides emergency availability round the clock.\n\n**Common gynae emergencies include:**\n• Heavy sudden bleeding\n• Severe abdominal or pelvic pain\n• Signs of pregnancy complications\n• Postoperative concerns\n\nPlease don't delay — call right away. Is there something specific I can help with?",
      followUps: ['Symptoms of miscarriage', 'Heavy bleeding', 'Pregnancy complications'],
    },
  },

  // ── Fees / cost ────────────────────────────────────────────────
  {
    keywords: ['fees', 'fee', 'cost', 'charge', 'price', 'expensive', 'affordable', 'how much', 'consultation fee', 'payment'],
    response: {
      text: "Dr. Aayushi's clinic offers **very affordable consultation fees** with no hidden charges.\n\nThe consultation fee varies by service type (general OPD, specialist, procedures). For the exact current fee:\n\n• **Call:** 74289 26418\n• **WhatsApp:** 74289 26418\n\nAll payments are transparent and discussed upfront. We believe quality healthcare should be accessible to everyone.",
      followUps: ['Book an appointment', 'What services are available?'],
    },
  },

  // ── About doctor ───────────────────────────────────────────────
  {
    keywords: ['doctor', 'dr aayushi', 'qualification', 'experience', 'mbbs', 'ms', 'dnb', 'specialist', 'about doctor', 'credentials', 'obg'],
    response: {
      text: "**Dr. Aayushi** is a highly qualified Obstetrician and Gynaecologist:\n\n🎓 **Qualifications:** MBBS · MS (OBG & Gynaecology) · DNB\n\n✨ **Specialisations:**\n• Normal & Caesarean Deliveries\n• High-Risk Pregnancy\n• Laparoscopic Surgery\n• PCOS / PCOD Management\n• Infertility Consultation\n• Adolescent Health\n\nDr. Aayushi is known for her compassionate approach — every patient receives personalised, dignified care in a comfortable setting.\n\nWould you like to know more about any specific service?",
      followUps: ['PCOS treatment', 'Infertility consultation', 'Laparoscopic surgery', 'High-risk pregnancy'],
    },
  },

  // ── PCOS / PCOD ────────────────────────────────────────────────
  {
    keywords: ['pcos', 'pcod', 'polycystic', 'ovary', 'ovarian cyst', 'cyst', 'irregular period', 'irregular cycle', 'hormonal imbalance', 'acne', 'hair growth', 'facial hair', 'weight gain hormone'],
    response: {
      text: "**PCOS (Polycystic Ovarian Syndrome)** is one of the most common hormonal conditions in women — and it's very treatable!\n\n**Common symptoms:**\n• Irregular or missed periods\n• Weight gain, especially around the abdomen\n• Acne and oily skin\n• Unwanted facial/body hair\n• Hair thinning\n• Difficulty conceiving\n\n**How Dr. Aayushi treats PCOS:**\n1. Hormone & ultrasound evaluation\n2. Personalised diet + lifestyle guidance\n3. Medication to regulate cycles\n4. Fertility support if needed\n\n⚠️ Left untreated, PCOS can increase risk of diabetes and heart disease. Early treatment makes a huge difference!\n\nDo you have specific symptoms you'd like to discuss?",
      followUps: ['PCOS and fertility', 'How to regulate periods', 'Book appointment for PCOS'],
    },
  },

  // ── Periods / menstruation ─────────────────────────────────────
  {
    keywords: ['period', 'periods', 'menstrual', 'menstruation', 'cycle', 'bleeding', 'irregular', 'heavy periods', 'missed period', 'late period', 'cramps', 'dysmenorrhea', 'spotting', 'discharge'],
    response: {
      text: "Menstrual concerns are very common and Dr. Aayushi specialises in diagnosing and treating them.\n\n**When should you see a doctor?**\n• Periods lasting more than 7 days\n• Soaking more than 1 pad/tampon per hour\n• Severe cramps interfering with daily life\n• Periods more than 35 days apart or fewer than 21 days\n• Bleeding between periods or after sex\n• Missed periods (and not pregnant)\n\n**Common causes include:**\n• PCOS / hormonal imbalance\n• Fibroids or polyps\n• Thyroid issues\n• Endometriosis\n• Stress\n\nWould you like more information on any of these conditions?",
      followUps: ['PCOS symptoms', 'What is endometriosis?', 'Fibroid treatment', 'Book appointment'],
    },
  },

  // ── Pregnancy ──────────────────────────────────────────────────
  {
    keywords: ['pregnant', 'pregnancy', 'expecting', 'baby', 'due date', 'conceived', 'first trimester', 'second trimester', 'third trimester', 'prenatal', 'antenatal', 'delivery', 'labour', 'labor'],
    response: {
      text: "Congratulations if you're expecting! Dr. Aayushi provides complete pregnancy care from the first confirmation to delivery.\n\n**Your pregnancy journey with us:**\n\n📅 **First visit** — Confirm pregnancy, blood tests, dating scan\n📋 **Antenatal visits** — Monthly till 28 wks, fortnightly till 36 wks, weekly after\n🔬 **Key scans** — NT scan (11–13 wks), anomaly scan (18–20 wks), growth scans\n💉 **Vaccinations** — Tetanus, flu vaccine as needed\n🏥 **Delivery** — Normal or C-section at affiliated hospitals\n\n**Important:** Start folic acid before or as soon as you know you're pregnant!\n\nWhat stage of pregnancy are you in? I can share more relevant advice.",
      followUps: ['High-risk pregnancy', 'Normal delivery vs C-section', 'Pregnancy diet tips', 'Book antenatal visit'],
    },
  },

  // ── High-risk pregnancy ────────────────────────────────────────
  {
    keywords: ['high risk', 'risk pregnancy', 'diabetes pregnancy', 'thyroid pregnancy', 'bp pregnancy', 'hypertension pregnancy', 'twin', 'twins', 'preeclampsia', 'gestational diabetes', 'complication'],
    response: {
      text: "**High-Risk Pregnancy** requires extra care — and Dr. Aayushi has specialised expertise in managing complex cases.\n\n**Conditions that make a pregnancy high-risk:**\n• Diabetes (pre-existing or gestational)\n• Thyroid disorders\n• High blood pressure / preeclampsia\n• Previous C-section or pregnancy loss\n• Twins or multiple pregnancy\n• Age above 35\n• Heart or kidney conditions\n\n**What Dr. Aayushi offers:**\n✓ More frequent monitoring visits\n✓ Growth scans every 2–4 weeks\n✓ Coordination with specialists\n✓ Personalised birth plan\n✓ 24/7 emergency support\n\nDon't worry — with proper management, the vast majority of high-risk pregnancies have excellent outcomes. Book a consultation early!",
      followUps: ['Gestational diabetes', 'Book appointment', 'Preeclampsia signs'],
    },
  },

  // ── Infertility ────────────────────────────────────────────────
  {
    keywords: ['infertility', 'fertility', 'conceive', 'trying to get pregnant', 'not getting pregnant', 'iui', 'ivf', 'ovulation', 'sperm', 'trying to conceive', 'ttc', 'miscarriage', 'pregnancy loss'],
    response: {
      text: "Struggling to conceive can be emotionally challenging — you're not alone, and many causes are treatable.\n\n**When to see a fertility specialist:**\n• Trying for 12+ months (under 35 years)\n• Trying for 6+ months (over 35 years)\n• Irregular or absent periods\n• Known PCOS, fibroids, or endometriosis\n• Previous pregnancy loss\n\n**Dr. Aayushi's infertility workup:**\n1. 🔬 Hormone panel (FSH, LH, AMH, thyroid)\n2. 🖥️ Pelvic ultrasound\n3. 📋 Ovulation tracking\n4. 🧬 Partner's semen analysis\n\n**Treatments offered:**\n• Ovulation induction tablets\n• IUI preparation & guidance\n• Referral for IVF if needed\n\nEarly evaluation greatly improves your chances. Would you like to know more?",
      followUps: ['PCOS and fertility', 'Ovulation problems', 'Book fertility consultation'],
    },
  },

  // ── Menopause ──────────────────────────────────────────────────
  {
    keywords: ['menopause', 'hot flash', 'hot flashes', 'night sweat', 'perimenopause', 'periods stopped', 'mood swing', 'vaginal dryness', 'post menopause', 'hrt', 'hormone therapy'],
    response: {
      text: "**Menopause** is a natural transition, but symptoms can significantly affect quality of life — help is available!\n\n**Common symptoms:**\n• Hot flashes and night sweats\n• Mood changes and irritability\n• Sleep disturbances\n• Vaginal dryness\n• Bone loss (osteoporosis risk)\n• Memory and concentration changes\n\n**Dr. Aayushi's approach:**\n✓ Hormone level evaluation\n✓ Bone density assessment\n✓ Symptom management options\n✓ Calcium & Vitamin D guidance\n✓ Heart health monitoring\n✓ Hormone replacement therapy (if suitable)\n\nMenopause usually begins in the late 40s to early 50s, but can occur earlier. If symptoms are affecting your daily life, a consultation can make a big difference!",
      followUps: ['Bone health after menopause', 'HRT — is it safe?', 'Book consultation'],
    },
  },

  // ── Endometriosis ──────────────────────────────────────────────
  {
    keywords: ['endometriosis', 'endo', 'painful periods', 'pelvic pain', 'pain during sex', 'deep pain', 'pain intercourse', 'chronic pelvic'],
    response: {
      text: "**Endometriosis** is a condition where tissue similar to the uterine lining grows outside the uterus — it affects 1 in 10 women.\n\n**Key symptoms:**\n• Severe period pain (worse than normal cramps)\n• Chronic pelvic pain\n• Pain during or after sex\n• Heavy periods\n• Painful bowel movements/urination during periods\n• Difficulty getting pregnant\n\n⚠️ Many women suffer for years before diagnosis because they're told 'it's just cramps'. It is NOT normal to have pain that disrupts your life!\n\n**Management options:**\n• Pain relief and anti-inflammatory medications\n• Hormonal therapy to reduce tissue growth\n• Laparoscopic surgery to remove endometrial deposits\n\nDr. Aayushi has expertise in diagnosing and managing endometriosis. Please don't suffer in silence!",
      followUps: ['Laparoscopic surgery', 'Endometriosis and fertility', 'Book appointment'],
    },
  },

  // ── Fibroids ───────────────────────────────────────────────────
  {
    keywords: ['fibroid', 'fibroids', 'uterine fibroid', 'myoma', 'heavy bleeding fibroid', 'fibroid treatment', 'fibroid surgery'],
    response: {
      text: "**Uterine Fibroids** are non-cancerous growths in the uterus — very common (up to 70% of women develop them by age 50).\n\n**Symptoms (not all fibroids cause symptoms):**\n• Heavy or prolonged periods\n• Pelvic pressure or pain\n• Frequent urination\n• Backache or leg pain\n• Difficulty getting pregnant\n\n**Important:** Fibroids are almost never cancerous.\n\n**Treatment options:**\n• **Watch and wait** — if no symptoms\n• **Medication** — to reduce bleeding and shrink fibroids\n• **Minimally invasive surgery** — myomectomy (fibroid removal)\n• **Laparoscopic approach** — small cuts, faster recovery\n\nThe best option depends on the fibroid size, location, and your family planning goals. Dr. Aayushi will guide you with a personalised plan.",
      followUps: ['Laparoscopic surgery', 'Fibroid and pregnancy', 'Book appointment'],
    },
  },

  // ── Laparoscopy ────────────────────────────────────────────────
  {
    keywords: ['laparoscopy', 'laparoscopic', 'keyhole surgery', 'minimally invasive', 'small cut', 'surgery', 'operation', 'hysterectomy', 'myomectomy'],
    response: {
      text: "**Laparoscopic (Keyhole) Surgery** is a minimally invasive technique Dr. Aayushi uses for several gynaecological procedures.\n\n**Advantages over open surgery:**\n✓ Only 3–4 tiny cuts (5–10 mm each)\n✓ Much less pain\n✓ Shorter hospital stay (often home next day)\n✓ Faster recovery (1–2 weeks vs 4–6 weeks)\n✓ Minimal scarring\n✓ Lower infection risk\n\n**Procedures done laparoscopically:**\n• Fibroid removal (myomectomy)\n• Ovarian cyst removal\n• Endometriosis treatment\n• Hysterectomy\n• Diagnostic laparoscopy (for unexplained pelvic pain / infertility)\n\nSurgeries are performed at affiliated hospitals. Dr. Aayushi will discuss whether you're a suitable candidate at consultation.",
      followUps: ['Fibroid treatment', 'Endometriosis treatment', 'Book consultation', 'Recovery after surgery'],
    },
  },

  // ── Contraception / family planning ────────────────────────────
  {
    keywords: ['contraception', 'birth control', 'family planning', 'iucd', 'iud', 'copper t', 'pills', 'oral contraceptive', 'condom', 'injection contraceptive', 'prevent pregnancy', 'unwanted pregnancy'],
    response: {
      text: "**Family Planning** — choosing the right contraception is a personal decision, and Dr. Aayushi will help you make an informed choice.\n\n**Available options:**\n\n💊 **Oral contraceptive pills** — daily pill, highly effective\n🩺 **IUCD (Copper T / Hormonal IUD)** — inserted once, works 5–10 years, 99%+ effective\n💉 **Injectable contraceptive** — every 3 months injection\n🔒 **Permanent options** — tubal ligation (laparoscopic)\n\n**Which is best for you depends on:**\n• Whether you want future pregnancies\n• Your medical history\n• How long you want contraception\n• Preference for hormone-free options\n\nDr. Aayushi provides non-judgmental, personalised counselling. Would you like to know more about any specific method?",
      followUps: ['About IUCD', 'Pills side effects', 'Permanent contraception', 'Book appointment'],
    },
  },

  // ── HPV vaccination ────────────────────────────────────────────
  {
    keywords: ['hpv', 'cervical cancer vaccine', 'vaccination', 'vaccine', 'gardasil', 'cervarix', 'cancer prevention', 'pap smear', 'pap test', 'cervical screening', 'cervical cancer'],
    response: {
      text: "**HPV Vaccination** is one of the most powerful ways to prevent cervical cancer.\n\n**About the vaccine:**\n• Protects against HPV types that cause 70–90% of cervical cancers\n• Recommended for girls/women from age 9 to 45\n• Most effective before first sexual contact, but beneficial at any age\n• 2 or 3 doses depending on age at first vaccination\n• Safe, well-studied, minimal side effects (mild arm soreness)\n\n**Cervical Screening (Pap Smear):**\n• Recommended every 3 years from age 21 onwards\n• Detects precancerous changes before they become cancer\n• Quick, slightly uncomfortable procedure — takes about 5 minutes\n\n🌸 Vaccination + regular screening is the best protection. Has Dr. Aayushi's clinic scheduled your Pap smear?",
      followUps: ['When to get HPV vaccine', 'Pap smear procedure', 'Book screening'],
    },
  },

  // ── Adolescent health ──────────────────────────────────────────
  {
    keywords: ['teenager', 'teen', 'adolescent', 'young girl', 'puberty', 'first period', 'school girl', 'daughter', 'young woman', '13', '14', '15', '16', '17', '18'],
    response: {
      text: "Dr. Aayushi provides **compassionate, sensitive care for adolescent girls** in a safe and comfortable environment.\n\n**Common adolescent concerns:**\n• First period questions\n• Irregular or painful periods\n• Unusual discharge\n• Breast development concerns\n• Acne related to hormones\n• PCOS symptoms in teens\n• Nutrition and reproductive health education\n\n**Parent note:** Adolescent consultations respect the young woman's privacy. Dr. Aayushi creates a comfortable space where girls can ask any question without embarrassment.\n\nEarly gynaecological care sets the foundation for lifelong reproductive health. Would you like to book a first-visit consultation?",
      followUps: ['PCOS in teenagers', 'Painful periods in teens', 'Book appointment'],
    },
  },

  // ── Breast health ──────────────────────────────────────────────
  {
    keywords: ['breast', 'lump', 'breast lump', 'breast pain', 'nipple discharge', 'breast tenderness', 'mammogram', 'breast cancer', 'breast check'],
    response: {
      text: "**Breast Health** is an important part of women's care at Navjeevan Clinic.\n\n**When to see a doctor:**\n• Any new breast lump — most are benign but should be checked\n• Nipple discharge (especially bloody or spontaneous)\n• Skin changes — dimpling, redness, rash\n• Persistent breast pain\n• Change in breast size or shape\n• Lump in armpit\n\n**What to expect:**\n1. Clinical breast examination\n2. Ultrasound (preferred in women under 40)\n3. Mammogram (if needed)\n4. Biopsy only if ultrasound suggests concern\n\n✅ The vast majority of breast lumps are NOT cancer. Early evaluation brings peace of mind and ensures any issues are caught early.\n\nDon't delay — a 10-minute check can save your life.",
      followUps: ['Book breast check', 'Breast self-examination', 'What is fibroadenoma?'],
    },
  },

  // ── White discharge / leucorrhoea ──────────────────────────────
  {
    keywords: ['white discharge', 'discharge', 'leucorrhoea', 'vaginal discharge', 'yellowish discharge', 'smelly discharge', 'itching', 'itching down', 'vaginal itching', 'infection'],
    response: {
      text: "**Vaginal discharge** is normal in certain amounts and consistency — but changes can signal an infection.\n\n**Normal discharge:**\n• Clear or milky white\n• Mild or odourless\n• Varies throughout the cycle\n\n**See a doctor if discharge is:**\n• Thick, white and cottage-cheese-like → possible yeast infection\n• Yellow, green or grey → possible bacterial infection or STI\n• Foul-smelling\n• Accompanied by itching, burning, or sores\n• Unusual in amount (much more than normal)\n\n**Common causes:**\n• Yeast infection (Candida)\n• Bacterial vaginosis\n• Sexually transmitted infections\n• Cervicitis\n\n⚠️ Do not douche or self-medicate — it can make infections worse. A quick swab test at the clinic will identify the exact cause and guide the right treatment.",
      followUps: ['Yeast infection treatment', 'Book appointment', 'STI concerns'],
    },
  },

  // ── Ovarian cyst ───────────────────────────────────────────────
  {
    keywords: ['ovarian cyst', 'cyst ovary', 'ovary pain', 'ovarian', 'follicle', 'functional cyst', 'dermoid', 'endometrioma'],
    response: {
      text: "**Ovarian Cysts** are fluid-filled sacs that develop on the ovaries. They're extremely common and most resolve on their own.\n\n**Types:**\n• **Functional cysts** — most common, often resolve in 1–3 cycles, no treatment needed\n• **Endometrioma** — related to endometriosis, may need treatment\n• **Dermoid cysts** — contain various tissues, usually need removal if large\n• **Polycystic ovaries** — related to PCOS\n\n**Symptoms (if present):**\n• Pelvic pain (dull ache to sharp pain)\n• Bloating\n• Irregular periods\n• Pain during sex\n• Frequent urination\n\n**When it's urgent:**\nSudden severe pain + vomiting → seek emergency care (possible cyst rupture or torsion)\n\nDr. Aayushi monitors cysts with ultrasound and decides if treatment is needed. Most cysts require only observation.",
      followUps: ['Ovarian cyst and fertility', 'Cyst surgery', 'Book ultrasound'],
    },
  },

  // ── Normal vs C-section delivery ───────────────────────────────
  {
    keywords: ['normal delivery', 'vaginal delivery', 'c section', 'cesarean', 'caesarean', 'which delivery', 'mode of delivery', 'natural birth', 'vbac'],
    response: {
      text: "**Normal Delivery vs C-Section** — Dr. Aayushi supports both and helps you plan the safest option.\n\n**Normal (Vaginal) Delivery:**\n✓ Faster mother recovery (days vs weeks)\n✓ Lower infection risk\n✓ Shorter hospital stay\n✓ Better for baby's gut microbiome\n\n**C-Section is recommended when:**\n• Baby is in breech or awkward position\n• Placenta previa\n• Fetal distress during labour\n• Previous C-section (in some cases)\n• Multiple pregnancies in certain situations\n• Certain medical conditions\n\nDr. Aayushi always aims for normal delivery unless there's a medical reason for C-section. The decision is made together with you, based on your health and your baby's condition.\n\n**VBAC (Vaginal Birth After C-Section)** may also be possible in suitable candidates — ask Dr. Aayushi!",
      followUps: ['Book delivery consultation', 'Preparing for labour', 'Recovery after C-section'],
    },
  },

  // ── Thank you / closing ─────────────────────────────────────────
  {
    keywords: ['thank', 'thanks', 'thankyou', 'thank you', 'helpful', 'great', 'perfect', 'awesome', 'bye', 'goodbye', 'ok', 'okay'],
    response: {
      text: "You're very welcome! 😊 I'm glad I could help.\n\nRemember, for any health concerns — no matter how small they seem — Dr. Aayushi is here to listen. Women's health is our priority.\n\n📞 **Helpline:** 74289 26418\n🌐 **Book online** anytime via this website\n\nTake care and stay healthy! 🌸",
      followUps: ['Book an appointment', 'Check timings', 'Ask another question'],
    },
  },
];

// Fallback responses for when nothing matches
const FALLBACKS: BotResponse[] = [
  {
    text: "I want to make sure I give you the right information. Could you tell me a bit more about what you're experiencing? For example — is this related to your periods, pregnancy, pain, or something else?",
    followUps: ['Period problems', 'Pregnancy query', 'Pain or discomfort', 'Book appointment'],
  },
  {
    text: "I'm not sure I fully understood that. I can help with questions about periods, pregnancy, PCOS, fertility, menopause, and more. Could you describe your concern in a bit more detail?",
    followUps: ['PCOS symptoms', 'Pregnancy care', 'Irregular periods', 'Book appointment'],
  },
  {
    text: "That's a great question — for the most accurate answer, I'd recommend speaking directly with Dr. Aayushi. You can book a consultation or call **74289 26418**.\n\nMeanwhile, is there anything else I can help you with?",
    followUps: ['Book an appointment', 'Clinic timings', 'Services offered'],
  },
];

let fallbackIdx = 0;

export function getBotResponse(userMessage: string): BotResponse {
  const norm = normalize(userMessage);

  let bestRule: Rule | null = null;
  let bestScore = 0;

  for (const rule of RULES) {
    const s = score(norm, rule.keywords);
    const min = rule.minScore ?? 1;
    if (s >= min && s > bestScore) {
      bestScore = s;
      bestRule = rule;
    }
  }

  if (bestRule) return bestRule.response;

  // Rotate through fallbacks
  const fb = FALLBACKS[fallbackIdx % FALLBACKS.length];
  fallbackIdx++;
  return fb;
}

// Opening message when chat is first opened
export const WELCOME_MESSAGE: BotResponse = {
  text: "Namaste! 🌸 I'm **Aayushi AI**, your virtual health assistant for Navjeevan Clinic.\n\nI can help you with:\n• Women's health questions\n• Information about our services\n• Booking and timing queries\n• Guidance on symptoms\n\nPlease remember — I'm an AI assistant, not a doctor. For medical advice, always consult Dr. Aayushi.\n\nWhat can I help you with today?",
  followUps: ['PCOS symptoms', 'Book an appointment', 'Pregnancy care', 'Clinic timings'],
};
