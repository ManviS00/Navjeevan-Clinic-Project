// Navjeevan Clinic — Ziva AI women's health knowledge engine.
// Provides general health information only. Never diagnoses conditions
// or replaces urgent medical care.

export interface KnowledgeEntry {
  id: string;
  keywords: string[];
  question: string;
  answer: string[]; // multiple variants so the assistant never repeats verbatim
  category:
    | 'clinic'
    | 'appointments'
    | 'pregnancy'
    | 'pcos'
    | 'fertility'
    | 'periods'
    | 'symptoms'
    | 'emergency'
    | 'general';
  // optional — for symptom entries, what these symptoms may suggest
  relatedConditions?: string[];
}

export const knowledgeBase: KnowledgeEntry[] = [
  {
    id: 'clinic-about',
    keywords: ['who', 'about', 'navjeevan', 'clinic', 'tell me about', 'doctor', 'aayushi', 'pal'],
    question: 'Tell me about Navjeevan Clinic',
    answer: [
      "Navjeevan Clinic is a dedicated Obstetrics & Gynaecology centre in Maujpur, Delhi, led by Dr. Aayushi Pal (MBBS, MS OBG, DNB). We provide compassionate, evidence-based care across pregnancy, PCOS, infertility, cancer screening, menstrual health, and more — all under one roof.",
      "We're a women's health-focused clinic in Maujpur, Delhi. Dr. Aayushi Pal (MBBS, MS OBG, DNB) leads the team, covering everything from routine pregnancy care to PCOS, infertility, and cancer screening. The idea is simple: most of your gynaec needs met in one place.",
      "Navjeevan Clinic is an OBG centre in Delhi where Dr. Aayushi Pal and the team handle pregnancy care, PCOS, infertility, menstrual issues, and cancer screening. We focus on evidence-based medicine with a genuinely patient-first approach.",
    ],
    category: 'clinic',
  },
  {
    id: 'clinic-address',
    keywords: ['address', 'location', 'where', 'find', 'maujpur', 'delhi', 'reach', 'how to come'],
    question: 'Where is the clinic located?',
    answer: [
      "We are at C-130, Puri Gali, Maujpur, Delhi — 110053. The nearest metro is Maujpur-Jafrabad on the Pink Line, and several bus routes pass nearby. Look for the Navjeevan signage near Puri Gali.",
      "You'll find us at C-130, Puri Gali, Maujpur, Delhi — 110053. The Maujpur-Jafrabad Pink Line metro station is a short walk away. If you're coming by bus, there are stops along the main road near Puri Gali.",
      "Our address is C-130, Puri Gali, Maujpur, Delhi 110053. By metro, get off at Maujpur-Jafrabad (Pink Line) and it's a brief walk. We're easy to spot — just look for the Navjeevan board at Puri Gali.",
    ],
    category: 'clinic',
  },
  {
    id: 'clinic-hours',
    keywords: ['hours', 'timing', 'open', 'close', 'when open', 'time', 'working'],
    question: 'What are the clinic timings?',
    answer: [
      "We're open Monday to Saturday. Sundays are closed. Please check the clinic booking page for current appointment slots and holiday changes.",
      "Navjeevan Clinic runs Monday–Saturday. Sunday is closed. On public holidays, please confirm timings before visiting.",
      "Our working hours are Monday through Saturday. Sundays are closed. Please check the booking page or call the clinic on public holidays to confirm timings.",
    ],
    category: 'clinic',
  },
  {
    id: 'clinic-contact',
    keywords: ['contact', 'phone', 'call', 'number', 'reach', 'whatsapp'],
    question: 'How can I contact the clinic?',
    answer: [
      "You can reach Navjeevan Clinic at 7428926418 for appointments and enquiries. For non-urgent questions, you can also leave a message and our front desk will call you back during working hours.",
      "Call us at 7428926418 — that's the main line for appointments and questions. If you can't get through right away, leave a message and we'll call you back during clinic hours.",
      "The clinic number is 7428926418. Use it to book, ask questions, or check timings. Our front desk returns missed-call messages during working hours.",
    ],
    category: 'clinic',
  },
  {
    id: 'doctor-profile',
    keywords: ['aayushi', 'pal', 'doctor', 'gynaecologist', 'obstetrician', 'qualifications', 'experience'],
    question: 'Tell me about Dr. Aayushi Pal',
    answer: [
      "Dr. Aayushi Pal holds an MBBS, a Master of Surgery in Obstetrics & Gynaecology (MS OBG), and a DNB. She has years of experience managing high-risk pregnancies, infertility, PCOS, and minimally invasive gynaec procedures. Her approach blends modern evidence-based medicine with a warm, patient-first philosophy.",
      "Dr. Aayushi Pal (MBBS, MS OBG, DNB) is the lead gynaecologist at Navjeevan. Her experience spans high-risk obstetrics, infertility, PCOS, and minor gynaec surgeries. Patients often describe her as thorough, gentle, and genuinely caring.",
      "Dr. Pal is qualified with an MBBS, MS in Obstetrics & Gynaecology, and a DNB. She focuses on high-risk pregnancies, fertility, PCOS, and minimally invasive procedures — always with an evidence-based, patient-first mindset.",
    ],
    category: 'clinic',
  },
  {
    id: 'services-list',
    keywords: ['services', 'offer', 'provide', 'treat', 'specialty', 'specialise', 'specialize'],
    question: 'What services does the clinic offer?',
    answer: [
      "Navjeevan Clinic offers: routine & high-risk pregnancy care, antenatal classes, PCOS management, infertility evaluation & counselling, fertility tracking, menstrual disorder treatment, cancer screening (Pap smear, HPV), ultrasound, ultrasound-guided procedures, menopause care, and minor gynaecological surgeries.",
      "Our services cover the full women's health journey — pregnancy care (routine and high-risk), PCOS, infertility workup, fertility tracking, period problems, cancer screening, ultrasound, menopause support, and minor gynaec surgeries.",
      "We handle pregnancy care, antenatal classes, PCOS, infertility, fertility tracking, menstrual disorders, Pap smears and HPV screening, ultrasound, menopause care, and minor gynaec procedures. Essentially your one-stop women's health clinic.",
    ],
    category: 'clinic',
  },
  {
    id: 'appointment-book',
    keywords: ['book', 'appointment', 'schedule', 'fix', 'visit', 'see doctor', 'consultation'],
    question: 'How do I book an appointment?',
    answer: [
      "You can book an appointment three ways: call us at 7428926418, visit the clinic in person during working hours, or use the Book Appointment form on this website. We recommend booking at least a day in advance for specialist consultations, though we do accommodate urgent walk-ins when possible.",
      "Booking is easy — call 7428926418, walk in during clinic hours, or use the appointment form here on the site. For specialist visits, try to book a day ahead. Urgent walk-ins are welcome when we have a slot.",
      "To see Dr. Pal, ring us at 7428926418, drop by during working hours, or fill the appointment form on this site. A day's notice helps for specialist consults, but we'll always try to fit in urgent cases.",
    ],
    category: 'appointments',
  },
  {
    id: 'appointment-fee',
    keywords: ['fee', 'cost', 'charge', 'price', 'how much', 'consultation fee', 'payment'],
    question: 'What is the consultation fee?',
    answer: [
      "A standard gynaecology consultation is ₹500. Follow-up visits within 7 days are ₹300. Ultrasound scans, procedures, and antenatal packages are priced separately — please ask our front desk for the full price list when you book.",
      "The first consultation is ₹500, and a follow-up within a week is ₹300. Scans, procedures, and antenatal packages are billed separately — our front desk can give you the complete price list.",
      "You're looking at ₹500 for a standard consult and ₹300 for a follow-up within 7 days. Ultrasounds and procedures have separate charges — just ask when you book and we'll walk you through it.",
    ],
    category: 'appointments',
  },
  {
    id: 'appointment-bring',
    keywords: ['bring', 'documents', 'reports', 'carry', 'need to bring', 'previous'],
    question: 'What should I bring to my appointment?',
    answer: [
      "Please bring: a photo ID, any previous ultrasound or lab reports, your current medication list, and (for pregnancy visits) your antenatal card if you have one. If you're coming for a fertility consultation, bring records of your menstrual cycle and any prior investigations.",
      "Carry a photo ID, any old ultrasound or blood reports, and a list of medicines you're on. For pregnancy visits, bring your antenatal card. For fertility, it helps to have your cycle history and any previous tests.",
      "Handy to bring: photo ID, past reports and scans, current medicines, and your antenatal card (if pregnant). Fertility consults go smoother if you bring cycle dates and any prior investigations.",
    ],
    category: 'appointments',
  },
  {
    id: 'pregnancy-first-visit',
    keywords: ['pregnancy', 'pregnant', 'first visit', 'antenatal', 'prenatal', 'first trimester', 'expecting'],
    question: 'When should I have my first pregnancy visit?',
    answer: [
      "Ideally, book your first antenatal visit as soon as you miss a period and confirm a positive test — usually around 6–8 weeks. This first visit includes a dating scan, basic blood tests, and a personalised care plan. Early booking helps us screen for risks and start folic acid if you haven't already.",
      "Aim for your first visit at 6–8 weeks — right after a missed period and a positive test. We'll do a dating scan, some baseline blood work, and set up your care plan. Coming in early means we can start folic acid and catch any risk factors sooner.",
      "The sooner the better — book around 6 to 8 weeks, once you've missed a period and tested positive. The first visit covers a dating scan, basic tests, and your personalised plan. Early booking is the best way to screen for risks early.",
    ],
    category: 'pregnancy',
  },
  {
    id: 'pregnancy-checkup-schedule',
    keywords: ['how often', 'checkup', 'check up', 'schedule', 'frequency', 'visits', 'scans'],
    question: 'How often are pregnancy check-ups?',
    answer: [
      "Typically: every 4 weeks until 28 weeks, every 2 weeks from 28 to 36 weeks, and weekly after 36 weeks until delivery. High-risk pregnancies may need closer monitoring. Each visit includes blood pressure, weight, fetal heart rate, and growth checks at the right intervals.",
      "The usual schedule is monthly until 28 weeks, fortnightly from 28–36 weeks, then weekly until you deliver. High-risk pregnancies need more frequent visits. At each check we track your BP, weight, baby's heartbeat, and growth.",
      "Plan on visits every 4 weeks till 28 weeks, every 2 weeks till 36 weeks, then weekly till birth. If your pregnancy is high-risk we'll see you more often. Each visit checks BP, weight, fetal heart rate, and growth.",
    ],
    category: 'pregnancy',
  },
  {
    id: 'pregnancy-diet',
    keywords: ['eat', 'diet', 'food', 'nutrition', 'what to eat', 'avoid eating', 'pregnancy food'],
    question: 'What should I eat during pregnancy?',
    answer: [
      "Focus on a balanced diet with plenty of fruits, vegetables, whole grains, dairy, and lean protein. Continue folic acid and take iron and calcium as advised. Stay well hydrated. Avoid raw or undercooked meat, unpasteurised dairy, high-mercury fish, alcohol, and excess caffeine. A dietitian referral is available if you'd like a personalised plan.",
      "Build your plate around fruits, vegetables, whole grains, dairy, and lean protein. Keep up your folic acid and take iron/calcium as prescribed. Skip raw or undercooked meat, unpasteurised dairy, high-mercury fish, alcohol, and too much caffeine. We can arrange a dietitian if you want a tailored plan.",
      "Eat a balanced mix of fruit, veg, whole grains, dairy, and lean protein. Folic acid, iron, and calcium supplements as advised. Off-limits: raw/undercooked meat, unpasteurised dairy, high-mercury fish, alcohol, and excess caffeine. A dietitian referral is available.",
    ],
    category: 'pregnancy',
  },
  {
    id: 'pregnancy-nausea',
    keywords: ['nausea', 'vomiting', 'morning sickness', 'throw up', 'queasy', 'first trimester sick'],
    question: 'How do I manage pregnancy nausea?',
    answer: [
      "Morning sickness is common, especially in the first trimester. Try: small frequent meals, dry crackers before getting up, ginger tea, avoiding strong smells, and staying hydrated with sips of water. Vitamin B6 may help — ask your doctor. Contact us if you can't keep any fluids down for 24 hours, are losing weight, or feel dizzy.",
      "For first-trimester nausea, eat small meals often, keep dry crackers by the bed, sip water through the day, and try ginger tea. Avoid strong-smelling foods. Vitamin B6 can help — check with us first. Call immediately if you can't keep fluids down for a day, feel dizzy, or are losing weight.",
      "Nausea in early pregnancy usually eases with small frequent meals, crackers before you rise, ginger, and avoiding strong odours. Hydration is key — sip, don't gulp. If you vomit everything for 24 hours, feel faint, or lose weight, contact us right away — that may be hyperemesis and needs treatment.",
    ],
    category: 'pregnancy',
  },
  {
    id: 'pregnancy-warning-signs',
    keywords: ['bleeding', 'spotting', 'pain', 'cramp', 'danger', 'warning', 'risk', 'wrong'],
    question: 'What are pregnancy warning signs?',
    answer: [
      "Seek immediate care if you notice: heavy vaginal bleeding, severe abdominal pain, sudden severe headache with vision changes, reduced fetal movements after 20 weeks, water breaking early, or high fever. These can signal serious problems and should never be ignored. Call 7428926418 or go to the nearest emergency.",
      "Red flags in pregnancy: heavy bleeding, severe belly pain, sudden severe headache with blurred vision, baby moving less after 20 weeks, water breaking before term, or high fever. Don't wait these out — call 7428926418 or head to the nearest emergency.",
      "Don't ignore: heavy vaginal bleeding, severe abdominal pain, severe headache with vision changes, reduced fetal movements (after 20 weeks), preterm water-break, or fever. Any of these needs urgent assessment — call 7428926418 or go to an emergency straight away.",
    ],
    category: 'pregnancy',
  },
  {
    id: 'pregnancy-exercise',
    keywords: ['exercise', 'yoga', 'walk', 'activity', 'workout', 'safe exercise'],
    question: 'Is exercise safe during pregnancy?',
    answer: [
      "Yes — moderate exercise is encouraged for most healthy pregnancies. Walking, prenatal yoga, and swimming are excellent. Aim for about 30 minutes most days. Avoid contact sports, heavy lifting, and lying flat on your back after the first trimester. If your pregnancy is high-risk, check with Dr. Pal before starting any routine.",
      "For most healthy pregnancies, moderate activity is great. Walking, prenatal yoga, and swimming are ideal — about 30 minutes a day. Steer clear of contact sports, heavy weights, and lying flat on your back after the first trimester. High-risk? Check with Dr. Pal first.",
      "Generally yes — walking, prenatal yoga, and swimming are safe and beneficial, about 30 minutes most days. Avoid contact sports, heavy lifting, and back-lying after the first trimester. If you have a high-risk pregnancy, please clear any routine with Dr. Pal.",
    ],
    category: 'pregnancy',
  },
  {
    id: 'pcos-what',
    keywords: ['pcos', 'pcod', 'polycystic', 'cyst', 'hormone', 'what is pcos'],
    question: 'What is PCOS?',
    answer: [
      "PCOS (Polycystic Ovary Syndrome) is a common hormonal condition where the ovaries produce higher-than-usual amounts of androgens, which can disrupt ovulation. Symptoms often include irregular periods, acne, weight gain, and excess facial hair. It's managed — not 'cured' — through lifestyle changes, medication, and regular monitoring.",
      "PCOS is a hormone imbalance where the ovaries make extra androgens, interfering with ovulation. It often shows up as irregular periods, acne, weight gain, and excess facial or body hair. There's no one-shot cure, but lifestyle changes, medicines, and monitoring keep it well managed.",
      "Think of PCOS as a common hormonal pattern: the ovaries produce too many androgens, ovulation becomes irregular, and you may notice missed periods, acne, weight gain, or extra facial hair. It's a long-term condition managed through lifestyle, medication, and follow-ups.",
    ],
    category: 'pcos',
  },
  {
    id: 'pcos-symptoms',
    keywords: ['pcos symptoms', 'irregular', 'acne', 'hair', 'weight gain', 'facial hair'],
    question: 'What are the symptoms of PCOS?',
    answer: [
      "Common symptoms include irregular or missed periods, unwanted facial or body hair, persistent acne, thinning hair on the scalp, weight gain that's hard to lose, and difficulty getting pregnant. Not everyone has all symptoms. A proper diagnosis needs blood tests and an ultrasound — book a consultation to get evaluated.",
      "Watch for: irregular or skipped periods, extra facial/body hair, stubborn acne, scalp hair thinning, weight that's hard to shed, and trouble conceiving. You won't necessarily have all of them. Diagnosis combines blood tests and an ultrasound, so do come in for evaluation.",
      "Typical PCOS signs are irregular periods, hirsutism (extra facial/body hair), acne, scalp hair loss, resistant weight gain, and fertility issues. The mix varies person to person. A confirmed diagnosis needs hormone blood work plus an ultrasound — book a consult to check.",
    ],
    category: 'pcos',
  },
  {
    id: 'pcos-treatment',
    keywords: ['pcos treatment', 'treat pcos', 'cure pcos', 'manage pcos', 'pcos diet', 'pcos medicine'],
    question: 'How is PCOS treated?',
    answer: [
      "PCOS management combines lifestyle changes and medication. Losing even 5–10% of body weight through diet and regular exercise can restore regular periods. Medicines may include metformin for insulin resistance, combined oral contraceptives to regulate cycles, and fertility medicines if you're trying to conceive. We tailor the plan to your goals.",
      "Treatment is a mix of lifestyle and medication. Losing just 5–10% of body weight often restores regular cycles. Medicines might include metformin (insulin resistance), birth control pills (cycle regulation), or ovulation medicines if you're trying for a baby. We tailor everything to your goals.",
      "We manage PCOS with lifestyle first — weight loss of 5–10% can make a big difference — plus medication as needed: metformin, oral contraceptives, or fertility drugs if conceiving. The plan is always personalised based on whether your priority is cycles, skin, weight, or fertility.",
    ],
    category: 'pcos',
  },
  {
    id: 'pcos-fertility',
    keywords: ['pcos pregnant', 'pcos conceive', 'pcos fertility', 'get pregnant pcos'],
    question: 'Can I get pregnant with PCOS?',
    answer: [
      "Yes, absolutely. Many women with PCOS conceive naturally or with simple treatment. Lifestyle changes are the first step. If needed, ovulation-inducing medicines like letrozole can be very effective. We'll evaluate your hormone profile and ovulation, then create a fertility plan suited to you.",
      "Yes — PCOS doesn't mean you can't get pregnant. Lifestyle changes are step one, and if ovulation is irregular, medicines like letrozole work well. We'll check your hormones and ovulation pattern and build a plan around your cycle.",
      "Definitely. Plenty of women with PCOS conceive, many naturally. We start with lifestyle, add ovulation induction (letrozole is common) if needed, and track your response. A personalised fertility plan makes a real difference.",
    ],
    category: 'pcos',
  },
  {
    id: 'fertility-window',
    keywords: ['fertile', 'fertility window', 'ovulation', 'best time', 'conceive', 'get pregnant'],
    question: 'When is my fertile window?',
    answer: [
      "Your fertile window is the ~6 days leading up to and including ovulation — typically around day 14 in a 28-day cycle, but it varies. The most fertile days are the 2–3 days before ovulation. Tracking basal body temperature, cervical mucus, and ovulation predictor kits can help pinpoint it. We offer ovulation tracking scans too.",
      "The fertile window spans about 6 days — the days before ovulation plus ovulation day. In a 28-day cycle that's roughly day 14, but cycles vary. The 2–3 days before ovulation are your best bet. Tracking temperature, mucus, and ovulation kits helps, and we can do tracking scans at the clinic.",
      "You're most fertile in the ~6 days around ovulation — usually near day 14 if your cycle is 28 days, but everyone's different. The two to three days before ovulation are peak time. Combine home tracking (temperature, mucus, OPKs) with our ovulation scans for best accuracy.",
    ],
    category: 'fertility',
  },
  {
    id: 'fertility-when-to-seek',
    keywords: ['infertility', 'trying', 'not getting pregnant', 'conceive difficulty', 'when to see doctor'],
    question: 'When should I see a doctor about fertility?',
    answer: [
      "If you're under 35 and have been trying for 12 months, or 35 and older after 6 months, it's worth a fertility evaluation. Come sooner if you have irregular periods, PCOS, endometriosis, or a history of pelvic surgery. We'll assess both partners — fertility is a couple's journey — with simple tests to start.",
      "As a rule: try for 12 months if you're under 35, or 6 months if you're 35+. Come earlier if your periods are irregular, you have PCOS or endometriosis, or past pelvic surgery. We evaluate both partners — it's a team effort — starting with straightforward tests.",
      "If you're under 35, see us after a year of trying; if you're 35 or older, after 6 months. Don't wait if you have irregular cycles, PCOS, endometriosis, or a surgical history. We assess both partners with simple tests first.",
    ],
    category: 'fertility',
  },
  {
    id: 'fertility-tests',
    keywords: ['fertility test', 'amh', 'hsg', 'semen', 'test for fertility', 'investigations'],
    question: 'What fertility tests are done?',
    answer: [
      "Basic tests include hormone blood work (FSH, LH, AMH, thyroid, prolactin), an ultrasound to check your ovaries and uterus, and a semen analysis for the male partner. Sometimes an HSG (an X-ray to check your tubes) is needed. We start simple and build the picture step by step.",
      "We usually begin with hormone bloods — FSH, LH, AMH, thyroid, prolactin — plus a pelvic ultrasound and a semen analysis for your partner. If needed, an HSG checks whether your tubes are open. We build the picture step by step.",
      "Expect hormone blood tests (FSH, LH, AMH, thyroid, prolactin), an ultrasound of your uterus and ovaries, and a partner semen analysis. An HSG (tube-check X-ray) may follow. We keep it stepwise so nothing is done unnecessarily.",
    ],
    category: 'fertility',
  },
  {
    id: 'periods-irregular',
    keywords: ['irregular period', 'missed period', 'late period', 'no period', 'amenorrhea', 'skipped'],
    question: 'Why are my periods irregular?',
    answer: [
      "Irregular periods can result from stress, weight changes, thyroid issues, PCOS, perimenopause, or hormonal imbalances. Occasional variation is normal, but if your cycle is consistently shorter than 21 days, longer than 35 days, or you miss 3+ periods in a row, please book a consultation. We'll find the cause with a few simple tests.",
      "Lots of things can throw off your cycle — stress, weight gain or loss, thyroid problems, PCOS, or perimenopause. An odd late period is usually fine, but cycles under 21 days, over 35 days, or 3+ missed periods in a row need a proper look. We'll run a few simple tests to find why.",
      "Irregularity often comes from stress, weight shifts, thyroid imbalance, PCOS, or perimenopause. The occasional off-cycle is normal; but if you're consistently under 21 days, over 35 days, or missing several in a row, come in. A few blood tests usually pinpoint the cause.",
    ],
    category: 'periods',
  },
  {
    id: 'periods-heavy',
    keywords: ['heavy period', 'heavy bleeding', 'lots of blood', 'flooding', 'menorrhagia', 'clots'],
    question: 'What causes heavy periods?',
    answer: [
      "Heavy periods (menorrhagia) can be caused by fibroids, hormonal imbalance, PCOS, thyroid problems, endometriosis, or sometimes no clear cause. Signs include soaking a pad every hour for 2+ hours, passing large clots, or bleeding longer than 7 days. Please see us — we can investigate and offer treatment from medicines to minor procedures.",
      "Heavy bleeding may come from fibroids, a hormone imbalance, PCOS, thyroid issues, or endometriosis — and sometimes no cause is found. If you're soaking a pad an hour for 2+ hours, passing big clots, or bleeding beyond 7 days, please come in. We can investigate and treat, from medicines to minor procedures.",
      "Menorrhagia (heavy flow) has many possible causes: fibroids, hormones, PCOS, thyroid, endometriosis. If you soak a pad hourly for 2+ hours, pass large clots, or bleed more than a week, that's not normal — please book a consult. Treatment ranges from medicines to minor procedures.",
    ],
    category: 'periods',
  },
  {
    id: 'periods-pain',
    keywords: ['painful period', 'cramps', 'period pain', 'dysmenorrhea', 'severe pain'],
    question: 'How do I manage period pain?',
    answer: [
      "Mild cramps respond well to a warm compress, gentle exercise, and over-the-counter pain relief like ibuprofen. But if your pain is severe, stops you doing daily activities, or comes with heavy bleeding, it could signal endometriosis or fibroids — please get it checked rather than just pushing through.",
      "For mild cramps, a hot water bag, light movement, and ibuprofen usually do the trick. But severe pain that disrupts your day — especially with heavy bleeding — isn't something to just endure. It could be endometriosis or fibroids, so please come in for an evaluation.",
      "Warmth, gentle activity, and ibuprofen help with ordinary cramps. However, if the pain is disabling or paired with heavy bleeding, don't keep gritting through it — endometriosis and fibroids are common culprits and worth diagnosing. Book a consult so we can help properly.",
    ],
    category: 'periods',
  },
  // ---------- SYMPTOM CHECKER ----------
  {
    id: 'symptom-vaginal-discharge',
    keywords: ['discharge', 'white discharge', 'vaginal discharge', 'leucorrhoea', 'leukorrhea', 'itching discharge', 'smelly discharge', 'abnormal discharge'],
    question: 'I have abnormal vaginal discharge',
    answer: [
      "Some clear or whitish discharge is normal, but changes can signal an infection. Thick white, curdy discharge with itching often points to a yeast (candidal) infection. Greyish, foul-smelling discharge is typical of bacterial vaginosis. Yellow-green, frothy discharge may mean trichomoniasis. Please come in for a simple examination and swab — most of these clear up quickly with the right treatment.",
      "Vaginal discharge is normal in small amounts, but colour, smell, or itch changes matter. Curdy white discharge with itch = likely yeast. Grey, fishy-smelling = likely bacterial vaginosis. Yellow-green and frothy = possibly trichomoniasis. An examination and swab will tell us exactly which, and treatment is usually straightforward.",
      "Not all discharge is a problem, but watch for: curdy white + itching (yeast), grey + fishy smell (bacterial vaginosis), or yellow-green frothy (trichomoniasis). Blood-tinged or persistent discharge needs a check too. A quick swab at the clinic identifies the cause, and most infections respond well to targeted treatment.",
    ],
    category: 'symptoms',
    relatedConditions: ['Yeast infection', 'Bacterial vaginosis', 'Trichomoniasis', 'STI'],
  },
  {
    id: 'symptom-vaginal-itching',
    keywords: ['itching', 'itch', 'vaginal itch', 'vulva itch', 'irritation', 'soreness', 'burning vagina'],
    question: 'I have vaginal itching or irritation',
    answer: [
      "Vaginal itching is most often from a yeast infection, irritation from soap or products, or bacterial vaginosis. It can also come from tight clothing, sweating, or (less commonly) an STI or a skin condition like lichen sclerosus. Try avoiding scented products and wear loose cotton underwear. If it persists beyond a few days, comes with an unusual discharge, or is severe, please book an examination — the right treatment depends on the cause.",
      "Common causes of vaginal itch: yeast infections, reaction to soaps or detergents, bacterial vaginosis, or tight/synthetic clothing. Rarer causes include STIs or skin conditions like lichen sclerosus. Switch to mild, unscented products and cotton underwear; if it lasts more than a few days, is severe, or has an odd discharge, come in for a check.",
      "Itching down there is usually yeast, contact irritation (soaps, pads), or bacterial vaginosis. Sometimes it's an STI or a vulval skin condition. Avoid scented products, keep the area dry, and wear loose cotton. If it's not settling in a few days, or there's a discharge or soreness, please come in so we can identify the cause.",
    ],
    category: 'symptoms',
    relatedConditions: ['Yeast infection', 'Bacterial vaginosis', 'Contact dermatitis', 'Lichen sclerosus', 'STI'],
  },
  {
    id: 'symptom-lower-abdominal-pain',
    keywords: ['lower abdominal pain', 'lower belly pain', 'pelvic pain', 'stomach pain', 'tummy pain', 'abdomen pain', 'belly ache', 'pelvis pain'],
    question: 'I have lower abdominal or pelvic pain',
    answer: [
      "Lower abdominal pain in women has many possible causes: ovulation pain (mid-cycle, mild), period cramps, a urinary infection, ovarian cysts, endometriosis, pelvic inflammatory disease, or an ectopic pregnancy. The pattern matters — is it tied to your cycle, sudden, one-sided, with fever, or with bleeding? Sudden severe pain, especially one-sided with faintness, needs emergency care. For recurring or persistent pain, book a consultation so we can examine and scan you.",
      "Pelvic pain can come from ovulation, period cramps, urine infections, cysts, endometriosis, pelvic inflammatory disease, or ectopic pregnancy. Sudden severe one-sided pain with dizziness is an emergency — don't wait. For pain that keeps coming back or lasts, come in for an exam and ultrasound to find the cause.",
      "There are many reasons for lower belly pain in women — cyclical (ovulation, cramps), infections (urine or pelvic), cysts, endometriosis, or rarely ectopic pregnancy. The timing and other symptoms guide us. Severe, sudden, one-sided pain with fainting needs the emergency department. Otherwise, book a consult for a proper assessment and scan.",
    ],
    category: 'symptoms',
    relatedConditions: ['Ovulation pain', 'UTI', 'Ovarian cyst', 'Endometriosis', 'PID', 'Ectopic pregnancy'],
  },
  {
    id: 'symptom-breast-lump',
    keywords: ['breast lump', 'lump in breast', 'breast pain', 'breast discharge', 'nipple discharge', 'breast swelling', 'breast change'],
    question: 'I found a breast lump or have breast changes',
    answer: [
      "Most breast lumps are benign — cysts, fibroadenomas, or fibrocystic changes — but every new lump needs proper evaluation. Watch for: a persistent lump, change in breast shape or skin, nipple discharge (especially bloody), or a lump that grows. Please book a consultation; we'll examine you and arrange an ultrasound or mammogram as needed. Early assessment brings peace of mind and, if needed, early treatment.",
      "Breast lumps are often benign (cysts, fibroadenomas), but any new, persistent, or changing lump should be checked. Red flags: skin dimpling, nipple retraction, bloody nipple discharge, or a growing lump. Come in for an exam — we'll organise imaging (ultrasound/mammogram) so we know exactly what we're dealing with.",
      "A new breast lump can be worrying, but most are non-cancerous. Still, don't ignore it — especially if it's persistent, growing, painful, or comes with skin or nipple changes. Book a consult; we examine and arrange ultrasound or mammogram. Knowing is always better than worrying.",
    ],
    category: 'symptoms',
    relatedConditions: ['Fibroadenoma', 'Breast cyst', 'Fibrocystic changes', 'Mastitis', 'Breast cancer'],
  },
  {
    id: 'symptom-uti',
    keywords: ['burning urine', 'painful urination', 'frequent urination', 'urine infection', 'uti', 'urinary tract', 'pee burning', 'blood in urine'],
    question: 'I have burning or frequent urination',
    answer: [
      "Burning, frequency, and urgency usually mean a urinary tract infection (UTI), which is common in women. Drink plenty of water and don't hold urine. If symptoms are mild, hydration can help, but persistent burning, fever, back pain, or blood in the urine needs a urine test and antibiotics. Please come in — untreated UTIs can climb to the kidneys. If you're pregnant, any UTI needs prompt treatment.",
      "Pain or burning when passing urine, plus frequent trips to the loo, usually points to a UTI. Hydrate well and don't delay urination. But if it persists beyond a day, there's fever, back pain, or blood in the urine, come in for a urine test and antibiotics. Pregnant? Don't wait — even symptom-free UTIs in pregnancy need treating.",
      "That burning, frequent urge is most often a UTI. Drink lots of water, don't hold on. If it's not settling, or you have fever, loin pain, or blood-tinged urine, book a urine culture. Antibiotics usually clear it fast. In pregnancy, UTIs are treated more aggressively, so do come in promptly.",
    ],
    category: 'symptoms',
    relatedConditions: ['UTI', 'Cystitis', 'Kidney infection'],
  },
  {
    id: 'symptom-frequent-urination',
    keywords: ['frequent urination', 'always peeing', 'urine often', 'waking up to pee', 'nocturia', 'overactive bladder'],
    question: 'I keep needing to urinate often',
    answer: [
      "Frequent urination can be a UTI, but if there's no burning it may be overactive bladder, pregnancy (early sign), diabetes, excessive caffeine/fluids, or (later in pregnancy) pressure from the baby. If it's new and persistent, especially with thirst or weight loss (think diabetes), or a chance of pregnancy, please come in. We'll check a urine sample and rule out the common causes.",
      "Going often? It could be a UTI, overactive bladder, early pregnancy, diabetes, or simply too much tea/coffee. If it's persistent and new — especially with thirst, weight loss, or a missed period — come in for a urine check and basic tests to find the cause.",
      "Frequent urination has many causes: UTI, overactive bladder, early pregnancy, diabetes, or high fluid/caffeine intake. New and persistent frequency deserves a check, particularly with thirst, weight loss, or a possible pregnancy. We'll run a urine sample and a few simple tests.",
    ],
    category: 'symptoms',
    relatedConditions: ['UTI', 'Overactive bladder', 'Pregnancy', 'Diabetes', 'Pelvic floor weakness'],
  },
  {
    id: 'symptom-fatigue',
    keywords: ['tired', 'fatigue', 'exhausted', 'weak', 'low energy', 'no energy', 'always tired', 'feeling weak'],
    question: "I'm always tired and low on energy",
    answer: [
      "Fatigue in women is very common and has many causes: iron-deficiency anaemia (especially with heavy periods), thyroid problems, vitamin D or B12 deficiency, poor sleep, stress, or pregnancy. If it's persistent and not explained by your lifestyle, come in for a blood test — checking haemoglobin, thyroid, and vitamins. Often a simple deficiency is the answer and is easily treated.",
      "Constant tiredness often comes from anaemia (common with heavy periods), an underactive thyroid, low vitamin D or B12, stress, or poor sleep. It's also an early pregnancy sign. If rest doesn't fix it, a basic blood panel — haemoglobin, thyroid, vitamins — usually finds the cause. Easy to treat once we know.",
      "Ongoing fatigue deserves attention. In women, common culprits are iron-deficiency anaemia (heavy periods), hypothyroidism, vitamin D/B12 deficiency, pregnancy, or chronic stress. A blood test at the clinic can screen for all of these. Most causes respond well to simple, targeted treatment.",
    ],
    category: 'symptoms',
    relatedConditions: ['Iron-deficiency anaemia', 'Hypothyroidism', 'Vitamin deficiency', 'Pregnancy', 'Depression'],
  },
  {
    id: 'symptom-weight-gain',
    keywords: ['weight gain', 'gaining weight', 'sudden weight gain', 'cant lose weight', 'hard to lose weight', 'obesity', 'overweight'],
    question: "I'm gaining weight or can't lose it",
    answer: [
      "Unexplained or stubborn weight gain can be linked to PCOS (insulin resistance), an underactive thyroid (hypothyroidism), stress/cortisol, certain medicines, or perimenopause. If the gain is sudden or accompanied by irregular periods, fatigue, or mood changes, come in for a check — a thyroid test and hormone panel can clarify whether there's an underlying cause beyond diet and activity.",
      "If weight is creeping on without an obvious reason, think PCOS, hypothyroidism, stress, or hormonal shifts. Pair it with irregular periods, fatigue, or mood changes and it's worth investigating. A thyroid test and hormone panel at the clinic can tell us if something medical is driving it.",
      "Stubborn weight gain isn't always just diet. PCOS, an underactive thyroid, stress, and perimenopause can all contribute. If it's sudden or comes with period changes or fatigue, book a check — simple blood work can rule thyroid and hormones in or out.",
    ],
    category: 'symptoms',
    relatedConditions: ['PCOS', 'Hypothyroidism', 'Insulin resistance', 'Perimenopause'],
  },
  {
    id: 'symptom-hair-loss',
    keywords: ['hair loss', 'hair fall', 'thinning hair', 'losing hair', 'bald patch', 'scalp hair', 'hair shedding'],
    question: "My hair is thinning or falling out",
    answer: [
      "Hair loss in women often relates to iron deficiency, thyroid problems, PCOS (androgenic alopecia), stress, post-pregnancy (telogen effluvium), or vitamin deficiencies. If it's diffuse thinning or increased shedding, a blood test for iron, thyroid, and hormones helps identify the cause. Most cases improve once the underlying issue is treated — come in and we'll check.",
      "Thinning or shedding hair can stem from low iron, thyroid imbalance, PCOS, stress, recent pregnancy, or vitamin gaps. A simple blood panel — iron studies, thyroid, hormones — usually points us to the cause. Treatment targets the underlying issue, so come in for a check.",
      "Female hair loss has several common drivers: iron deficiency, hypothyroidism, PCOS-related androgenic alopecia, postpartum shedding, and stress. Blood tests for iron, thyroid, and hormones can pinpoint the cause. Most cases improve with targeted treatment — book a consult.",
    ],
    category: 'symptoms',
    relatedConditions: ['Iron-deficiency anaemia', 'Hypothyroidism', 'PCOS', 'Telogen effluvium', 'Androgenic alopecia'],
  },
  {
    id: 'symptom-mood-swings',
    keywords: ['mood swing', 'mood', 'irritable', 'anxiety', 'depressed', 'low mood', 'sad', 'emotional', 'irritable before period'],
    question: "I'm having mood swings or low mood",
    answer: [
      "Hormonal shifts can strongly affect mood — PMS, pregnancy, postpartum changes, perimenopause, and thyroid issues all play a role. If mood changes are severe, persistent, affect your daily life, or include thoughts of self-harm, please seek help urgently. For cyclical mood symptoms tied to your period or menopause, come in and we'll evaluate hormone-related causes alongside appropriate support.",
      "Mood swings can be tied to PMS, pregnancy, the postpartum period, perimenopause, or thyroid imbalance. If they're severe, lasting, or affecting daily life — or if you ever feel unsafe — please reach out for help right away. For hormone-linked mood changes, we can assess and guide you to the right support.",
      "Hormones and mood are closely linked. PMS, pregnancy, postpartum, perimenopause, and thyroid issues can all drive mood swings. If feelings are intense, persistent, or include self-harm thoughts, please seek urgent help. Otherwise, come in and we'll look into hormonal causes and the right support.",
    ],
    category: 'symptoms',
    relatedConditions: ['PMS/PMDD', 'Perimenopause', 'Postpartum mood disorder', 'Thyroid dysfunction', 'Depression'],
  },
  {
    id: 'symptom-hot-flashes',
    keywords: ['hot flash', 'hot flush', 'night sweat', 'sweating', 'menopause', 'perimenopause', 'heat wave', 'flushing'],
    question: "I'm getting hot flashes or night sweats",
    answer: [
      "Hot flashes and night sweats are classic perimenopause and menopause symptoms, caused by falling oestrogen. They can start in your 40s and vary in intensity. Lifestyle tweaks (cool room, layered clothing, limiting caffeine/spicy food) help, and if they're disruptive, effective medical options exist. Come in to discuss whether it's menopause and what might ease things.",
      "These are hallmark signs of perimenopause/menopause — your oestrogen is declining. Simple measures: keep cool, layer up, cut caffeine and spicy foods. If they're disturbing sleep or daily life, there are good medical options. Book a consult to confirm and plan.",
      "Hot flushes and night sweats usually point to the menopausal transition. Keeping cool, layering, and reducing triggers (caffeine, spice) helps. If they're severe or wrecking your sleep, come in — we can confirm the stage of menopause and discuss treatment options.",
    ],
    category: 'symptoms',
    relatedConditions: ['Perimenopause', 'Menopause', 'Thyroid dysfunction'],
  },
  {
    id: 'symptom-nausea-not-pregnant',
    keywords: ['nausea not pregnant', 'feeling sick', 'giddy', 'dizzy', 'vertigo', 'lightheaded', 'fainting', 'dizziness'],
    question: "I feel dizzy, giddy, or nauseous",
    answer: [
      "Dizziness and nausea have many causes: low blood pressure, anaemia, low blood sugar, dehydration, inner-ear issues, or (if there's a chance) pregnancy. If dizziness comes with fainting, severe headache, chest pain, or blurred vision, seek urgent care. Otherwise, stay hydrated and come in for a blood pressure and haemoglobin check to rule out anaemia and other common causes.",
      "Feeling giddy or sick can be low BP, anaemia, low sugar, dehydration, an inner-ear problem, or pregnancy. If you faint, or have a severe headache, chest pain, or blurred vision, treat it as urgent. Otherwise hydrate and come in to check your BP and haemoglobin.",
      "Dizziness and nausea may signal anaemia, low blood pressure, low sugar, dehydration, inner-ear trouble, or pregnancy. Fainting, severe headache, vision changes, or chest pain = urgent care. Otherwise, drink fluids and book a check — we'll measure BP and run a blood test.",
    ],
    category: 'symptoms',
    relatedConditions: ['Anaemia', 'Hypotension', 'Hypoglycaemia', 'Dehydration', 'Pregnancy', 'Vertigo'],
  },
  {
    id: 'symptom-bleeding-between-periods',
    keywords: ['bleeding between periods', 'spotting', 'intermenstrual bleeding', 'bleeding after sex', 'irregular bleeding', 'mid cycle bleeding'],
    question: "I'm bleeding between my periods",
    answer: [
      "Bleeding between periods or after sex can come from hormonal changes, cervical ectropion, polyps, fibroids, pelvic infection, or — important to rule out — cervical precancer/cancer. Any new intermenstrual bleeding deserves a check, especially if persistent or after intercourse. Please come in for an examination and a Pap smear if you're due. Most causes are benign, but it's not something to ignore.",
      "Spotting between periods or after sex has several causes: hormonal shifts, cervical ectropion, polyps, fibroids, infection, or cervical cell changes. Because some causes need ruling out, any new bleeding like this should be assessed — come in for an exam and a Pap smear if due. Usually benign, but don't ignore it.",
      "Intermenstrual bleeding (between periods) or post-coital bleeding can be hormonal, a polyp or fibroid, cervical ectropion, infection, or rarely cervical precancer. Please book an examination and a Pap smear if you're overdue. We take it seriously and most often find a treatable, benign cause.",
    ],
    category: 'symptoms',
    relatedConditions: ['Cervical ectropion', 'Endometrial polyp', 'Fibroids', 'PID', 'Cervical dysplasia'],
  },
  {
    id: 'symptom-painful-intercourse',
    keywords: ['painful sex', 'pain during sex', 'dyspareunia', 'sex painful', 'intercourse pain', 'deep pain sex'],
    question: 'Sex is painful for me',
    answer: [
      "Pain during sex (dyspareunia) can be superficial — from dryness, infection, or vulval conditions — or deep, from endometriosis, pelvic inflammatory disease, or ovarian cysts. Vaginal dryness is common around perimenopause and is very treatable. Please come in; we'll examine, identify the cause, and tailor treatment. You don't have to just put up with it.",
      "Painful intercourse has many causes: dryness, infections, vulval skin issues, endometriosis, PID, or cysts. Dryness in perimenopause is common and responds well to treatment. Book a consult — we examine, find the cause, and treat accordingly. Help is available.",
      "Dyspareunia may be superficial (dryness, infection, skin conditions) or deep (endometriosis, PID, cysts). Don't ignore it — it's common and very treatable. Come in for an assessment and we'll pinpoint the cause and tailor a plan for you.",
    ],
    category: 'symptoms',
    relatedConditions: ['Vaginal dryness', 'Endometriosis', 'PID', 'Vulvodynia', 'Ovarian cyst'],
  },
  {
    id: 'symptom-pregnancy-symptoms',
    keywords: ['am i pregnant', 'pregnancy symptoms', 'early pregnancy', 'missed period pregnant', 'could i be pregnant', 'signs of pregnancy', 'pregnant signs'],
    question: 'Could I be pregnant? What are the signs?',
    answer: [
      "Early pregnancy signs include a missed period, breast tenderness, mild nausea, fatigue, frequent urination, and heightened smell. A home urine test is reliable from the first day of a missed period. If positive (or if your period is late and tests are negative), come in for a confirmation and a dating scan around 6–8 weeks. If you have bleeding or pain with a positive test, please come in sooner.",
      "Classic early signs: missed period, sore breasts, nausea, fatigue, peeing more, and sensitivity to smells. A urine test works from the day of your missed period. If positive, book a dating scan at 6–8 weeks. Any bleeding or pain with a positive test — come in promptly to rule out issues like ectopic pregnancy.",
      "Think you might be pregnant? Look for a missed period, breast tenderness, nausea, fatigue, and frequent urination. Test at home from the missed-period day. If positive, we'll confirm and arrange a dating scan at 6–8 weeks. Bleeding or one-sided pain with a positive test needs urgent assessment.",
    ],
    category: 'symptoms',
    relatedConditions: ['Pregnancy', 'Ectopic pregnancy', 'Chemical pregnancy'],
  },
  {
    id: 'symptom-swelling-pregnancy',
    keywords: ['swelling', 'swollen feet', 'swollen hands', 'edema', 'puffy face', 'puffiness', 'swelling pregnancy'],
    question: "I'm pregnant and swelling up",
    answer: [
      "Mild ankle swelling in late pregnancy is common, but sudden swelling — especially of the face and hands, or with headache or vision changes — can signal pre-eclampsia, a serious condition. Please contact us immediately or go to emergency if you notice sudden swelling, severe headache, upper abdominal pain, or vision changes. For ordinary mild ankle swelling, rest with your feet up and stay hydrated, and mention it at your next visit.",
      "Late-pregnancy ankle swelling is usually normal. But sudden swelling of the face/hands, with headache or vision changes, can mean pre-eclampsia — this is an emergency. Call us or go to hospital right away if that happens. For mild ankle puffiness, elevate your feet and hydrate, and flag it at your next check.",
      "Some ankle swelling in later pregnancy is expected. The danger sign is sudden, widespread swelling — especially face and hands — with headache, upper belly pain, or vision changes: possible pre-eclampsia. That needs emergency care now. Routine mild swelling: rest with feet raised, stay hydrated, mention at your next visit.",
    ],
    category: 'symptoms',
    relatedConditions: ['Normal pregnancy oedema', 'Pre-eclampsia', 'Gestational hypertension'],
  },
  {
    id: 'symptom-fever-pregnancy',
    keywords: ['fever pregnant', 'fever in pregnancy', 'temperature pregnant', 'high temperature', 'chills pregnant'],
    question: "I'm pregnant and have a fever",
    answer: [
      "A fever in pregnancy — especially above 38.5°C (101°F) — should not be ignored. It could be a simple viral illness, a urine infection, or something more serious. Paracetamol in standard doses is generally safe in pregnancy; avoid ibuprofen. Please contact us promptly, or go to emergency if the fever is very high, persistent, or comes with abdominal pain, reduced fetal movements, or rash.",
      "Fever during pregnancy needs attention. Above 38.5°C, please contact us — it could be a viral illness, UTI, or something more. Paracetamol is generally safe; avoid ibuprofen. Seek emergency care if the fever is very high or persistent, or if you have abdominal pain, fewer fetal movements, or a rash.",
      "Don't brush off a fever in pregnancy. Temperatures over 38.5°C warrant a prompt call to us. Safe to take: paracetamol. Avoid: ibuprofen. If the fever is very high, won't settle, or comes with pain, rash, or reduced fetal movements, treat it as urgent and get assessed.",
    ],
    category: 'symptoms',
    relatedConditions: ['Viral illness', 'UTI', 'Chorioamnionitis', 'Other infection'],
  },
  // ---------- EMERGENCY ----------
  {
    id: 'emergency-when',
    keywords: ['emergency', 'urgent', 'immediate', 'serious', 'danger', 'severe pain', 'heavy bleeding emergency'],
    question: 'When is it a gynaecological emergency?',
    answer: [
      "Seek emergency care immediately for: very heavy vaginal bleeding (soaking a pad in an hour), severe sudden abdominal pain, fever with pelvic pain, fainting or dizziness with bleeding, a miscarriage, or ectopic pregnancy symptoms. Do not wait — call 7428926418 or go to the nearest hospital emergency department right away.",
      "These need emergency care now: heavy bleeding (a pad an hour), sudden severe belly pain, fever with pelvic pain, fainting with bleeding, miscarriage, or ectopic pregnancy signs. Call 7428926418 or head straight to the nearest emergency.",
      "Treat as an emergency: very heavy bleeding, sudden severe abdominal pain, fever with pelvic pain, dizziness or fainting with bleeding, miscarriage, or suspected ectopic pregnancy. Don't delay — call 7428926418 or get to an emergency department immediately.",
    ],
    category: 'emergency',
  },
  {
    id: 'emergency-ectopic',
    keywords: ['ectopic', 'tubal pregnancy', 'one sided pain', 'shoulder pain', 'emergency pregnancy'],
    question: 'What are ectopic pregnancy signs?',
    answer: [
      "An ectopic pregnancy can be life-threatening. Warning signs include sharp one-sided abdominal pain, shoulder-tip pain, dizziness or fainting, and vaginal bleeding in early pregnancy. If you experience these, go to an emergency immediately — this is not something to wait on or call about.",
      "Ectopic pregnancy is a medical emergency. Look out for sharp one-sided lower belly pain, pain at the tip of your shoulder, dizziness or collapse, and bleeding in early pregnancy. If these happen, go to an emergency department straight away — don't wait.",
      "Signs of an ectopic — a life-threatening emergency — include severe one-sided pelvic pain, shoulder-tip pain, fainting, and early-pregnancy bleeding. This needs immediate emergency care. Please don't try to ride it out or even call first; just go.",
    ],
    category: 'emergency',
  },
  {
    id: 'emergency-miscarriage',
    keywords: ['miscarriage', 'losing baby', 'bleeding early pregnancy', 'cramping bleeding', 'early pregnancy loss'],
    question: 'I think I might be having a miscarriage',
    answer: [
      "Bleeding and cramping in early pregnancy don't always mean miscarriage, but they need prompt assessment. If you're bleeding heavily (soaking a pad in an hour), passing large clots, or have severe pain, go to emergency now. For lighter bleeding, contact us right away for an ultrasound and assessment. You're not alone — please reach out.",
      "Early-pregnancy bleeding and cramps need checking — they don't always mean miscarriage. Heavy bleeding (a pad an hour), big clots, or severe pain = emergency now. Lighter bleeding? Call us today for an ultrasound and review. Please don't wait, and don't go through it alone.",
      "Bleeding and cramping in the first trimester warrant a prompt assessment — sometimes it's harmless, sometimes not. Heavy bleeding, clots, or severe pain: emergency department now. Milder bleeding: contact us for an urgent scan. Support is available, so please reach out.",
    ],
    category: 'emergency',
  },
  // ---------- GENERAL ----------
  {
    id: 'general-disclaimer',
    keywords: ['advice', 'diagnose', 'diagnosis', 'medical advice', 'can you tell me if i have'],
    question: 'Can you diagnose my condition?',
    answer: [
      "I can share general health information, but I cannot diagnose conditions or replace a consultation with Dr. Pal. For an accurate diagnosis and treatment plan, please book an appointment at 7428926418. Your health deserves a proper, personal evaluation.",
      "I'm here to guide and inform, not to diagnose. A real diagnosis needs an examination and tests — that's Dr. Pal's role. Please book an appointment at 7428926418 for a proper, personal assessment.",
      "Think of me as a helpful starting point — I can explain symptoms and what they might mean, but I can't diagnose you. For that, please see Dr. Pal. Book at 7428926418 and you'll get a proper evaluation.",
    ],
    category: 'general',
  },
  {
    id: 'general-thanks',
    keywords: ['thank', 'thanks', 'great', 'awesome', 'helpful'],
    question: 'Thanks',
    answer: [
      "You're most welcome! I'm here whenever you have questions. Remember, for anything urgent please call the clinic at 7428926418. Take care.",
      "Anytime! I'm always glad to help. For anything urgent, the clinic line is 7428926418. Look after yourself.",
      "Happy to help! Don't hesitate to come back with more questions. For urgent concerns, call 7428926418 right away. Take care.",
    ],
    category: 'general',
  },
  {
    id: 'general-greet',
    keywords: ['hello', 'hi', 'hey', 'namaste', 'good morning', 'good evening', 'good afternoon'],
    question: 'Hello',
    answer: [
      "Namaste! I'm Ziva, your AI health assistant from Navjeevan Clinic. I can help with questions about pregnancy, PCOS, fertility, periods, appointments, and clinic services. How can I help you today?",
      "Hello there! I'm Ziva from Navjeevan Clinic. Whether it's a symptom you're worried about, a pregnancy question, or booking help — I'm here. What's on your mind?",
      "Hi! Ziva here, your AI assistant from Navjeevan Clinic. You can ask me about symptoms, pregnancy, PCOS, fertility, periods, or booking a visit. How can I assist?",
    ],
    category: 'general',
  },
  {
    id: 'general-farewell',
    keywords: ['bye', 'goodbye', 'see you', 'thanks bye', 'that all', 'nothing else'],
    question: 'Goodbye',
    answer: [
      "Take care of yourself! If you have any health concerns, don't hesitate to call Navjeevan Clinic at 7428926418 or book an appointment through this site. Wishing you good health.",
      "Look after yourself! For any worries, the clinic line is 7428926418, or you can book through this site. Stay well.",
      "Goodbye for now — and remember, we're a call away at 7428926418 if anything comes up. Wishing you the best of health.",
    ],
    category: 'general',
  },
  {
    id: 'general-capabilities',
    keywords: ['what can you do', 'help me', 'what do you do', 'features', 'options', 'topics'],
    question: 'What can you help me with?',
    answer: [
      "I can help with: understanding women's health symptoms (discharge, pelvic pain, breast changes, burning urine, fatigue, hair loss, and more), pregnancy guidance, PCOS, fertility and ovulation, menstrual problems, clinic info, and booking appointments. I'll also flag when something needs urgent care. What would you like to know?",
      "My topics include symptom guidance (vaginal discharge, itching, pelvic pain, breast lumps, UTI symptoms, fatigue, weight changes, hair loss, mood, hot flushes, dizziness), pregnancy, PCOS, fertility, periods, and clinic/appointment info. I also tell you when to seek urgent care. Where shall we start?",
      "I cover a lot — symptoms and what they may mean, pregnancy, PCOS, fertility, periods, menopause, and clinic info like timings, fees, and booking. If something sounds urgent, I'll say so. Just tell me what's bothering you.",
    ],
    category: 'general',
  },
];

const STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'am', 'i', 'me', 'my', 'we', 'our', 'you', 'your',
  'to', 'of', 'in', 'on', 'for', 'and', 'or', 'with', 'do', 'does', 'did', 'can',
  'could', 'should', 'would', 'will', 'how', 'what', 'when', 'where', 'why', 'who',
  'tell', 'about', 'have', 'has', 'had', 'it', 'this', 'that', 'please', 'want',
  'need', 'get', 'got', 'know', 'see', 'help', 'more', 'any', 'some', 'feel',
  'feeling', 'm', 're', 've', 'll', 's', 't',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function scoreEntry(query: string, entry: KnowledgeEntry): number {
  const q = query.toLowerCase();
  let score = 0;

  for (const kw of entry.keywords) {
    if (q.includes(kw)) {
      score += kw.length > 6 ? 3 : 2;
    }
  }

  const queryTokens = new Set(tokenize(query));
  for (const kw of entry.keywords) {
    const kwTokens = tokenize(kw);
    for (const t of kwTokens) {
      if (queryTokens.has(t)) score += 1;
    }
  }

  // Bonus: matching tokens from the question text itself.
  const qTokens = tokenize(entry.question);
  for (const t of qTokens) {
    if (queryTokens.has(t)) score += 1;
  }

  // Symptom entries get a small priority bump — patients describing symptoms
  // should reach the symptom checker rather than generic clinic answers.
  if (entry.category === 'symptoms') {
    score += 0.5;
  }

  return score;
}

export interface MatchResult {
  entry: KnowledgeEntry;
  score: number;
}

export function findBestMatch(query: string): MatchResult | null {
  const results: MatchResult[] = knowledgeBase
    .map((entry) => ({ entry, score: scoreEntry(query, entry) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return results.length > 0 ? results[0] : null;
}

export function getSuggestions(): string[] {
  return [
    'I have abnormal vaginal discharge',
    'I have lower abdominal pain',
    'Could I be pregnant?',
    'I have burning when I urinate',
    'I found a breast lump',
    "I'm always tired and low on energy",
  ];
}
