export interface DialogueLine {
  speaker: 'doctor' | 'patient';
  text: string;
  duration: number;
}

export interface VideoScene {
  title: string;
  subtitle: string;
  bgFrom: string;
  bgTo: string;
  accent: string;
  icon: string;
  dialogue: DialogueLine[];
}

export interface ServiceVideo {
  scenes: VideoScene[];
}

const C = {
  rose: { from: '#fdf2f8', to: '#fce7f3', accent: '#e11d48' },
  amber: { from: '#fef3c7', to: '#fde68a', accent: '#d97706' },
  blue: { from: '#dbeafe', to: '#bfdbfe', accent: '#2563eb' },
  indigo: { from: '#e0e7ff', to: '#c7d2fe', accent: '#4f46e5' },
  green: { from: '#d1fae5', to: '#a7f3d0', accent: '#059669' },
  pink: { from: '#fce7f3', to: '#fbcfe8', accent: '#be185d' },
  teal: { from: '#ccfbf1', to: '#99f6e4', accent: '#0d9488' },
  cyan: { from: '#cffafe', to: '#a5f3fc', accent: '#0891b2' },
  orange: { from: '#ffedd5', to: '#fed7aa', accent: '#ea580c' },
  fuchsia: { from: '#fae8ff', to: '#f5d0fe', accent: '#c026d3' },
  sky: { from: '#e0f2fe', to: '#bae6fd', accent: '#0284c7' },
};

export const SERVICE_VIDEOS: Record<string, ServiceVideo> = {
  /* =========================================================
     1. GENERAL GYNAECOLOGY
  ========================================================= */

  'general-gynae': {
    scenes: [
      {
        title: 'General Gynaecology',
        subtitle: 'Common women’s health concerns',
        icon: '🏥',
        ...C.rose,
        dialogue: [
          {
            speaker: 'patient',
            text: 'Doctor, I have been experiencing irregular bleeding and some discomfort.',
            duration: 6,
          },
          {
            speaker: 'doctor',
            text: 'I understand. How long have you been experiencing these symptoms? Have you noticed anything else?',
            duration: 8,
          },
          {
            speaker: 'patient',
            text: 'It has been happening for about two months. I have also noticed some unusual discharge.',
            duration: 7,
          },
          {
            speaker: 'doctor',
            text: 'Thank you for sharing that. We will perform a thorough examination and recommend the appropriate tests to identify the cause.',
            duration: 10,
          },
        ],
      },
      {
        title: 'Diagnosis & Tests',
        subtitle: 'Ultrasound, blood work, and screening',
        icon: '📡',
        ...C.blue,
        dialogue: [
          {
            speaker: 'doctor',
            text: 'Your ultrasound looks normal. However, your blood tests show a mild thyroid imbalance.',
            duration: 6,
          },
          {
            speaker: 'patient',
            text: 'Is that something serious? Will I need surgery?',
            duration: 5,
          },
          {
            speaker: 'doctor',
            text: 'There is no immediate need for surgery. We can begin with appropriate medication and monitor your progress.',
            duration: 10,
          },
        ],
      },
      {
        title: 'Treatment & Follow-up',
        subtitle: 'Medication, lifestyle, and regular check-ups',
        icon: '💊',
        ...C.green,
        dialogue: [
          {
            speaker: 'doctor',
            text: 'I am prescribing medication for the next three months, after which we will review your progress.',
            duration: 8,
          },
          {
            speaker: 'patient',
            text: 'Thank you, Doctor. Knowing that the condition can be managed is a great relief.',
            duration: 6,
          },
          {
            speaker: 'doctor',
            text: 'You are welcome. Please contact us if your symptoms change or become more severe.',
            duration: 6,
          },
        ],
      },
    ],
  },

  /* =========================================================
     2. OBSTETRICS
  ========================================================= */

  'obstetrics': {
    scenes: [
      {
        title: 'Obstetrics',
        subtitle: 'Care from conception to delivery',
        icon: '🤰',
        ...C.pink,
        dialogue: [
          {
            speaker: 'patient',
            text: 'Doctor, I have just found out that I am pregnant. What should I do first?',
            duration: 6,
          },
          {
            speaker: 'doctor',
            text: 'Congratulations! We will begin with a complete check-up and schedule your first ultrasound.',
            duration: 7,
          },
          {
            speaker: 'patient',
            text: 'I am feeling a little nervous. Will everything be okay?',
            duration: 5,
          },
          {
            speaker: 'doctor',
            text: 'We will closely monitor both you and your baby throughout the pregnancy. You are in good hands.',
            duration: 8,
          },
        ],
      },
      {
        title: 'Pregnancy Monitoring',
        subtitle: 'Maternal and fetal well-being',
        icon: '🗣',
        ...C.blue,
        dialogue: [
          {
            speaker: 'doctor',
            text: 'Your baby is developing well. The heartbeat is strong and regular.',
            duration: 6,
          },
          {
            speaker: 'patient',
            text: 'That is such a relief to hear, Doctor.',
            duration: 5,
          },
          {
            speaker: 'doctor',
            text: 'Continue your supplements, maintain a healthy diet, and attend your scheduled antenatal visits.',
            duration: 8,
          },
        ],
      },
      {
        title: 'Preparing for Delivery',
        subtitle: 'A safe and healthy birth',
        icon: '🍼',
        ...C.green,
        dialogue: [
          {
            speaker: 'patient',
            text: 'What should I expect when I go into labor?',
            duration: 6,
          },
          {
            speaker: 'doctor',
            text: 'I will guide you through every stage of labor. Together, we will prepare a safe delivery plan.',
            duration: 8,
          },
          {
            speaker: 'patient',
            text: 'I feel much more confident knowing you will be there.',
            duration: 6,
          },
        ],
      },
    ],
  },

  /* =========================================================
     3. PREGNANCY CARE
  ========================================================= */

  'pregnancy-care': {
    scenes: [
      {
        title: 'Pregnancy Care',
        subtitle: 'Regular antenatal check-ups',
        icon: '🤱',
        ...C.pink,
        dialogue: [
          {
            speaker: 'patient',
            text: 'Doctor, how often should I come for check-ups during pregnancy?',
            duration: 6,
          },
          {
            speaker: 'doctor',
            text: 'Typically, visits are monthly until 28 weeks, every two weeks until 36 weeks, and weekly thereafter, depending on your individual needs.',
            duration: 10,
          },
          {
            speaker: 'patient',
            text: 'What tests will I need during pregnancy?',
            duration: 5,
          },
          {
            speaker: 'doctor',
            text: 'We will monitor your blood tests, ultrasounds, and your baby’s growth at important stages of the pregnancy.',
            duration: 10,
          },
        ],
      },
      {
        title: 'Fetal Growth Monitoring',
        subtitle: 'Tracking your baby’s development',
        icon: '📡',
        ...C.blue,
        dialogue: [
          {
            speaker: 'doctor',
            text: 'Your baby is growing well. The weight and measurements are within the expected range.',
            duration: 8,
          },
          {
            speaker: 'patient',
            text: 'Is the baby in the correct position?',
            duration: 5,
          },
          {
            speaker: 'doctor',
            text: 'At the moment, the baby is in a healthy position. We will continue monitoring throughout the pregnancy.',
            duration: 8,
          },
        ],
      },
      {
        title: 'Healthy Pregnancy',
        subtitle: 'Safe motherhood starts here',
        icon: '🌼',
        ...C.green,
        dialogue: [
          {
            speaker: 'doctor',
            text: 'Maintain a balanced diet, stay physically active as advised, and take your prescribed folic acid regularly.',
            duration: 8,
          },
          {
            speaker: 'patient',
            text: 'Thank you, Doctor. I appreciate all the guidance.',
            duration: 5,
          },
        ],
      },
    ],
  },

  /* =========================================================
     4. ANTENATAL CARE
  ========================================================= */

  'antenatal-care': {
    scenes: [
      {
        title: 'Antenatal Care',
        subtitle: 'Scheduled visits and counselling',
        icon: '📋',
        ...C.pink,
        dialogue: [
          {
            speaker: 'patient',
            text: 'Doctor, what happens during each antenatal visit?',
            duration: 6,
          },
          {
            speaker: 'doctor',
            text: 'We check your blood pressure, weight, and the baby’s heartbeat. Ultrasounds and other tests are scheduled when needed.',
            duration: 10,
          },
          {
            speaker: 'patient',
            text: 'Will I need any vaccinations during pregnancy?',
            duration: 6,
          },
          {
            speaker: 'doctor',
            text: 'Yes. Recommended vaccinations and supplements are an important part of antenatal care.',
            duration: 8,
          },
        ],
      },
      {
        title: 'Counselling & Support',
        subtitle: 'Guidance at every stage',
        icon: '💬',
        ...C.blue,
        dialogue: [
          {
            speaker: 'patient',
            text: 'I have been feeling quite tired and experiencing mood changes.',
            duration: 6,
          },
          {
            speaker: 'doctor',
            text: 'These symptoms can occur during pregnancy. We will check your iron levels and discuss ways to help you feel better.',
            duration: 10,
          },
          {
            speaker: 'patient',
            text: 'Thank you, Doctor. It is reassuring to know that I can discuss these concerns with you.',
            duration: 10,
          },
        ],
      },
      {
        title: 'Ready for Baby',
        subtitle: 'Better outcomes for mother and baby',
        icon: '🍼',
        ...C.green,
        dialogue: [
          {
            speaker: 'doctor',
            text: 'You are doing well. Continue attending your scheduled visits and follow the recommended care plan.',
            duration: 10,
          },
          {
            speaker: 'patient',
            text: 'I feel much more confident now. Thank you, Doctor.',
            duration: 6,
          },
        ],
      },
    ],
  },

  /* =========================================================
     5. HIGH-RISK PREGNANCY
  ========================================================= */

  'high-risk': {
    scenes: [
      {
        title: 'High-Risk Pregnancy',
        subtitle: 'Extra care when it matters most',
        icon: '⚕️',
        ...C.amber,
        dialogue: [
          {
            speaker: 'patient',
            text: 'Doctor, I have a thyroid condition and I am pregnant. I am very worried.',
            duration: 6,
          },
          {
            speaker: 'doctor',
            text: 'I understand your concern. We will monitor both you and your baby closely throughout the pregnancy.',
            duration: 10,
          },
          {
            speaker: 'patient',
            text: 'Could my thyroid condition affect my pregnancy?',
            duration: 6,
          },
          {
            speaker: 'doctor',
            text: 'With appropriate treatment and regular monitoring, many women with thyroid conditions have healthy pregnancies.',
            duration: 10,
          },
        ],
      },
      {
        title: 'Close Monitoring',
        subtitle: 'Frequent checks and tailored care',
        icon: '📡',
        ...C.blue,
        dialogue: [
          {
            speaker: 'doctor',
            text: 'We may need to see you more frequently and perform additional scans to monitor your health and the baby’s development.',
            duration: 10,
          },
          {
            speaker: 'patient',
            text: 'I also have diabetes. Will that require any changes?',
            duration: 6,
          },
          {
            speaker: 'doctor',
            text: 'Yes. We will work with your physician to keep your blood sugar within the recommended range throughout pregnancy.',
            duration: 10,
          },
        ],
      },
      {
        title: 'Safe Outcome',
        subtitle: 'Reducing risks together',
        icon: '🌼',
        ...C.green,
        dialogue: [
          {
            speaker: 'doctor',
            text: 'Your latest reports are stable. Continue following the care plan and attend all scheduled appointments.',
            duration: 10,
          },
          {
            speaker: 'patient',
            text: 'Thank you, Doctor. I feel reassured knowing that I am being monitored carefully.',
            duration: 10,
          },
        ],
      },
    ],
  },

  /* =========================================================
     6. MENSTRUAL DISORDERS
  ========================================================= */

  'menstrual': {
    scenes: [
      {
        title: 'Menstrual Disorders',
        subtitle: 'Irregular, painful, or heavy periods',
        icon: '🌙',
        ...C.indigo,
        dialogue: [
          {
            speaker: 'patient',
            text: 'Doctor, my periods are very irregular and sometimes extremely heavy.',
            duration: 10,
          },
          {
            speaker: 'doctor',
            text: 'Let us understand your cycle pattern. How frequently do your periods occur, and how long do they usually last?',
            duration: 10,
          },
          {
            speaker: 'patient',
            text: 'Sometimes they come after 40 days and can last for eight to ten days, with blood clots.',
            duration: 10,
          },
          {
            speaker: 'doctor',
            text: 'We will perform hormone tests and an ultrasound to determine the possible cause of the irregular bleeding.',
            duration: 10,
          },
        ],
      },
      {
        title: 'Finding the Cause',
        subtitle: 'Hormone panel and ultrasound',
        icon: '🧪',
        ...C.blue,
        dialogue: [
          {
            speaker: 'doctor',
            text: 'Your hormone levels show a mild imbalance, while the ultrasound appears normal.',
            duration: 10,
          },
          {
            speaker: 'patient',
            text: 'Can this be treated without surgery?',
            duration: 6,
          },
          {
            speaker: 'doctor',
            text: 'Yes. In many cases, medication can help regulate the menstrual cycle and control symptoms.',
            duration: 10,
          },
        ],
      },
      {
        title: 'Symptom Relief',
        subtitle: 'Improved quality of life',
        icon: '🌼',
        ...C.green,
        dialogue: [
          {
            speaker: 'doctor',
            text: 'Take the prescribed medication for the next three cycles. We will then assess how your periods have responded.',
            duration: 10,
          },
          {
            speaker: 'patient',
            text: 'That is a relief. I have been worried about this for several months.',
            duration: 8,
          },
        ],
      },
    ],
  },

  /* =========================================================
     7. PCOS / PCOD
  ========================================================= */

  'pcos': {
    scenes: [
      {
        title: 'PCOS / PCOD',
        subtitle: 'Hormonal imbalance and irregular cycles',
        icon: '🔬',
        ...C.indigo,
        dialogue: [
          {
            speaker: 'patient',
            text: 'Doctor, I have gained weight and my periods sometimes occur only once every two months.',
            duration: 8,
          },
          {
            speaker: 'doctor',
            text: 'These can be common signs of PCOS. Have you also noticed acne or increased facial or body hair?',
            duration: 8,
          },
          {
            speaker: 'patient',
            text: 'Yes, I have both. I am also concerned about my future fertility.',
            duration: 8,
          },
          {
            speaker: 'doctor',
            text: 'PCOS can be managed effectively. We will perform the necessary evaluation and create a treatment plan suited to you.',
            duration: 10,
          },
        ],
      },
      {
        title: 'Diagnosis & Plan',
        subtitle: 'Lifestyle, diet, and medication',
        icon: '🥭',
        ...C.green,
        dialogue: [
          {
            speaker: 'doctor',
            text: 'Your evaluation is consistent with PCOS. The good news is that symptoms can often be managed effectively with the right approach.',
            duration: 10,
          },
          {
            speaker: 'patient',
            text: 'What should I do first?',
            duration: 5,
          },
          {
            speaker: 'doctor',
            text: 'We will focus on a healthy diet, regular physical activity, and medication if needed. We will review your progress in three months.',
            duration: 10,
          },
        ],
      },
      {
        title: 'Hormonal Balance',
        subtitle: 'Regular periods and improved fertility',
        icon: '🌼',
        ...C.rose,
        dialogue: [
          {
            speaker: 'patient',
            text: 'My periods are regular now, and I have also lost five kilograms.',
            duration: 8,
          },
          {
            speaker: 'doctor',
            text: 'That is excellent progress. Continue with your current routine. Improving metabolic and hormonal health can also support fertility.',
            duration: 10,
          },
        ],
      },
    ],
  },

  /* =========================================================
     8. INFERTILITY
  ========================================================= */

  'infertility': {
    scenes: [
      {
        title: 'Infertility Consultation',
        subtitle: 'Understanding why conception hasn’t happened',
        icon: '💗',
        ...C.rose,
        dialogue: [
          {
            speaker: 'patient',
            text: 'Doctor, we have been trying to conceive for a year but have not been successful.',
            duration: 8,
          },
          {
            speaker: 'doctor',
            text: 'I understand. We will evaluate both partners systematically to identify any factors that may be affecting conception.',
            duration: 10,
          },
          {
            speaker: 'patient',
            text: 'What tests will we need?',
            duration: 5,
          },
          {
            speaker: 'doctor',
            text: 'Depending on your history, we may recommend hormone testing, ovulation tracking, ultrasound, and a semen analysis for your partner.',
            duration: 10,
          },
        ],
      },
      {
        title: 'Identifying the Cause',
        subtitle: 'Targeted investigations',
        icon: '🔍',
        ...C.blue,
        dialogue: [
          {
            speaker: 'doctor',
            text: 'Your evaluation suggests irregular ovulation along with a mild hormonal imbalance.',
            duration: 8,
          },
          {
            speaker: 'patient',
            text: 'Can this be treated?',
            duration: 5,
          },
          {
            speaker: 'doctor',
            text: 'Yes. We can consider ovulation-inducing treatment and monitor your cycles carefully.',
            duration: 8,
          },
        ],
      },
      {
        title: 'Improving Chances',
        subtitle: 'A personalised fertility plan',
        icon: '🌼',
        ...C.green,
        dialogue: [
          {
            speaker: 'doctor',
            text: 'Many couples benefit from targeted treatment. We will take this step by step and adjust the plan according to your response.',
            duration: 10,
          },
          {
            speaker: 'patient',
            text: 'Thank you, Doctor. I feel hopeful again.',
            duration: 6,
          },
        ],
      },
    ],
  },

  /* =========================================================
     9. MENOPAUSE
  ========================================================= */

  'menopause': {
    scenes: [
      {
        title: 'Menopause Management',
        subtitle: 'Navigating this natural transition',
        icon: '🌺',
        ...C.fuchsia,
        dialogue: [
          {
            speaker: 'patient',
            text: 'Doctor, I have been experiencing hot flashes and night sweats. Could this be menopause?',
            duration: 10,
          },
          {
            speaker: 'doctor',
            text: 'These symptoms can occur during menopause. How have your sleep and mood been recently?',
            duration: 10,
          },
          {
            speaker: 'patient',
            text: 'I am not sleeping well and I have been feeling irritable most days.',
            duration: 10,
          },
          {
            speaker: 'doctor',
            text: 'These symptoms are common during the menopausal transition. We can assess your symptoms and discuss suitable treatment options.',
            duration: 10,
          },
        ],
      },
      {
        title: 'Bone & Heart Health',
        subtitle: 'Preventive care after menopause',
        icon: '🦴',
        ...C.blue,
        dialogue: [
          {
            speaker: 'doctor',
            text: 'After menopause, bone health becomes especially important. We can assess your calcium, vitamin D, and overall bone health.',
            duration: 10,
          },
          {
            speaker: 'patient',
            text: 'Should I take calcium and vitamin D supplements?',
            duration: 6,
          },
          {
            speaker: 'doctor',
            text: 'They may be recommended depending on your diet and test results. Weight-bearing exercise is also important for bone health.',
            duration: 10,
          },
        ],
      },
      {
        title: 'Better Quality of Life',
        subtitle: 'Symptom control and confidence',
        icon: '🌼',
        ...C.green,
        dialogue: [
          {
            speaker: 'doctor',
            text: 'With appropriate care, many menopausal symptoms can be managed effectively and your quality of life can improve significantly.',
            duration: 10,
          },
          {
            speaker: 'patient',
            text: 'Thank you for explaining everything so clearly. I feel much more reassured.',
            duration: 8,
          },
        ],
      },
    ],
  },

  /* =========================================================
     10. FAMILY PLANNING
  ========================================================= */

  'family-planning': {
    scenes: [
      {
        title: 'Family Planning',
        subtitle: 'Informed choices for your family',
        icon: '👨‍👩‍👧',
        ...C.teal,
        dialogue: [
          {
            speaker: 'patient',
            text: 'Doctor, we would like to wait about two years before having another child. What options are available?',
            duration: 10,
          },
          {
            speaker: 'doctor',
            text: 'There are several options, including pills, intrauterine devices, and injectable contraception. We can choose one based on your needs and medical history.',
            duration: 10,
          },
          {
            speaker: 'patient',
            text: 'Which option is the most effective?',
            duration: 6,
          },
          {
            speaker: 'doctor',
            text: 'Long-acting methods such as an IUD are highly effective and do not require daily attention.',
            duration: 8,
          },
        ],
      },
      {
        title: 'Choosing the Right Method',
        subtitle: 'Counselling and personalised advice',
        icon: '💬',
        ...C.blue,
        dialogue: [
          {
            speaker: 'doctor',
            text: 'Based on your medical history and preferences, an IUD may be a suitable option for you.',
            duration: 8,
          },
          {
            speaker: 'patient',
            text: 'Is it safe? Will the insertion be painful?',
            duration: 6,
          },
          {
            speaker: 'doctor',
            text: 'For most women, IUD insertion is safe and takes only a few minutes. Some temporary discomfort or cramping can occur.',
            duration: 10,
          },
        ],
      },
      {
        title: 'Safe and Informed',
        subtitle: 'Reproductive choices with confidence',
        icon: '🌼',
        ...C.green,
        dialogue: [
          {
            speaker: 'patient',
            text: 'I feel confident about my decision. Thank you for explaining the options so clearly.',
            duration: 8,
          },
          {
            speaker: 'doctor',
            text: 'You are welcome. We are here to support you whenever you need guidance.',
            duration: 8,
          },
        ],
      },
    ],
  },

  /* =========================================================
     11. CONTRACEPTION
  ========================================================= */

  'contraception': {
    scenes: [
      {
        title: 'Contraception',
        subtitle: 'Preventing unintended pregnancy',
        icon: '💊',
        ...C.teal,
        dialogue: [
          {
            speaker: 'patient',
            text: 'Doctor, I would like to start contraception, but I am unsure which method is best for me.',
            duration: 8,
          },
          {
            speaker: 'doctor',
            text: 'Of course. Let us discuss your options. Are you looking for a short-term or long-term method?',
            duration: 8,
          },
          {
            speaker: 'patient',
            text: 'I would prefer something that I do not have to remember every day.',
            duration: 8,
          },
          {
            speaker: 'doctor',
            text: 'In that case, a long-acting method such as an IUD may be suitable. We can discuss the benefits and possible side effects.',
            duration: 10,
          },
        ],
      },
      {
        title: 'Understanding Options',
        subtitle: 'Pills, IUCD, injectables, and more',
        icon: '📋',
        ...C.blue,
        dialogue: [
          {
            speaker: 'doctor',
            text: 'Each contraceptive method has its own benefits and considerations. I will explain them so you can make an informed decision.',
            duration: 10,
          },
          {
            speaker: 'patient',
            text: 'What about possible side effects?',
            duration: 5,
          },
          {
            speaker: 'doctor',
            text: 'Side effects vary by method and are often mild. We can monitor them and change the method if necessary.',
            duration: 10,
          },
        ],
      },
      {
        title: 'Confident Choice',
        subtitle: 'Safe and protected',
        icon: '🌼',
        ...C.green,
        dialogue: [
          {
            speaker: 'patient',
            text: 'I think an IUD would be the right choice for me. I would like to proceed.',
            duration: 8,
          },
          {
            speaker: 'doctor',
            text: 'Certainly. We can schedule the insertion at a convenient time and discuss what to expect beforehand.',
            duration: 10,
          },
        ],
      },
    ],
  },

  /* =========================================================
     12. HPV VACCINATION
  ========================================================= */

  'hpv': {
    scenes: [
      {
        title: 'HPV Vaccination',
        subtitle: 'Protection against cervical cancer',
        icon: '💉',
        ...C.cyan,
        dialogue: [
          {
            speaker: 'patient',
            text: 'Doctor, should I get the HPV vaccine? I am 26 years old.',
            duration: 8,
          },
          {
            speaker: 'doctor',
            text: 'HPV vaccination can help protect against HPV types associated with cervical cancer and other diseases. We can discuss whether it is appropriate for you.',
            duration: 12,
          },
          {
            speaker: 'patient',
            text: 'Can it still be effective at my age?',
            duration: 6,
          },
          {
            speaker: 'doctor',
            text: 'The vaccine provides the greatest benefit before HPV exposure, but vaccination may still be recommended for some adults after individual assessment.',
            duration: 12,
          },
        ],
      },
      {
        title: 'How It Works',
        subtitle: 'Building immunity against HPV',
        icon: '🔬',
        ...C.blue,
        dialogue: [
          {
            speaker: 'doctor',
            text: 'Depending on your age and vaccination history, you may need two or three doses. The vaccine is given as a simple injection.',
            duration: 12,
          },
          {
            speaker: 'patient',
            text: 'Are there any side effects?',
            duration: 5,
          },
          {
            speaker: 'doctor',
            text: 'Mild soreness at the injection site is common. Serious side effects are uncommon.',
            duration: 8,
          },
        ],
      },
      {
        title: 'Long-term Protection',
        subtitle: 'Reducing cancer risk for years',
        icon: '🌼',
        ...C.green,
        dialogue: [
          {
            speaker: 'doctor',
            text: 'Vaccination, together with regular cervical screening, can significantly reduce the risk of cervical cancer.',
            duration: 10,
          },
          {
            speaker: 'patient',
            text: 'I would like to get vaccinated. Let us schedule my first dose.',
            duration: 8,
          },
        ],
      },
    ],
  },

  /* =========================================================
     13. CERVICAL CANCER SCREENING
  ========================================================= */

  'cervical-screening': {
    scenes: [
      {
        title: 'Cervical Cancer Screening',
        subtitle: 'Early detection saves lives',
        icon: '🔍',
        ...C.cyan,
        dialogue: [
          {
            speaker: 'patient',
            text: 'Doctor, I have never had a Pap smear. Should I get one?',
            duration: 8,
          },
          {
            speaker: 'doctor',
            text: 'Cervical screening is an important part of preventive healthcare. We can recommend the appropriate screening schedule based on your age and health history.',
            duration: 12,
          },
          {
            speaker: 'patient',
            text: 'Is the test painful?',
            duration: 5,
          },
          {
            speaker: 'doctor',
            text: 'The procedure is usually quick. You may experience some temporary discomfort, but it generally takes only a few minutes.',
            duration: 12,
          },
        ],
      },
      {
        title: 'The Screening Process',
        subtitle: 'Pap smear and HPV testing',
        icon: '🧪',
        ...C.blue,
        dialogue: [
          {
            speaker: 'doctor',
            text: 'A small sample of cells is collected from the cervix and sent to the laboratory for testing.',
            duration: 8,
          },
          {
            speaker: 'patient',
            text: 'When will I receive the results?',
            duration: 6,
          },
          {
            speaker: 'doctor',
            text: 'Results are usually available within a few days to a couple of weeks, depending on the laboratory. We will discuss them with you.',
            duration: 12,
          },
        ],
      },
      {
        title: 'Peace of Mind',
        subtitle: 'Detecting changes before they become cancer',
        icon: '🌼',
        ...C.green,
        dialogue: [
          {
            speaker: 'doctor',
            text: 'Your results are normal. We will advise you when your next screening should be scheduled based on the recommended guidelines.',
            duration: 12,
          },
          {
            speaker: 'patient',
            text: 'That is a relief. I will make sure to keep up with my regular screenings.',
            duration: 8,
          },
        ],
      },
    ],
  },

  /* =========================================================
     14. BREAST HEALTH
  ========================================================= */

  'breast': {
    scenes: [
      {
        title: 'Breast Health Check-up',
        subtitle: 'Early detection of breast disease',
        icon: '🫀',
        ...C.cyan,
        dialogue: [
          {
            speaker: 'patient',
            text: 'Doctor, I found a small lump in my breast and I am very worried.',
            duration: 8,
          },
          {
            speaker: 'doctor',
            text: 'I understand why you are concerned. Many breast lumps are benign, but it is important to have any new lump properly evaluated.',
            duration: 12,
          },
          {
            speaker: 'patient',
            text: 'How will you evaluate it?',
            duration: 5,
          },
          {
            speaker: 'doctor',
            text: 'We will perform a clinical examination and may recommend an ultrasound or other imaging. A biopsy may be needed if indicated.',
            duration: 12,
          },
        ],
      },
      {
        title: 'Evaluation',
        subtitle: 'Examination and imaging',
        icon: '📡',
        ...C.blue,
        dialogue: [
          {
            speaker: 'doctor',
            text: 'The lump feels smooth and mobile, which can be reassuring, but imaging is still important for a proper assessment.',
            duration: 12,
          },
          {
            speaker: 'patient',
            text: 'Does that mean it is not cancer?',
            duration: 6,
          },
          {
            speaker: 'doctor',
            text: 'These features can suggest a benign cause, but we should wait for the imaging results before drawing any conclusions.',
            duration: 12,
          },
        ],
      },
      {
        title: 'All Clear',
        subtitle: 'Early detection brings peace of mind',
        icon: '🌼',
        ...C.green,
        dialogue: [
          {
            speaker: 'doctor',
            text: 'The ultrasound shows a simple cyst, which is benign. At this stage, no treatment is necessary unless it causes symptoms.',
            duration: 12,
          },
          {
            speaker: 'patient',
            text: 'That is such a relief. Thank you so much, Doctor.',
            duration: 6,
          },
        ],
      },
    ],
  },

  /* =========================================================
     15. ADOLESCENT HEALTH
  ========================================================= */

  'adolescent': {
    scenes: [
      {
        title: 'Adolescent Health',
        subtitle: 'Care for teenage girls',
        icon: '🌸',
        ...C.rose,
        dialogue: [
          {
            speaker: 'patient',
            text: 'Doctor, my daughter has very irregular periods. She is only 15 years old.',
            duration: 8,
          },
          {
            speaker: 'doctor',
            text: 'Irregular cycles can be common during the first few years after periods begin. Is she also experiencing pain or heavy bleeding?',
            duration: 12,
          },
          {
            speaker: 'patient',
            text: 'Yes. She has severe cramps and sometimes misses school because of the pain.',
            duration: 8,
          },
          {
            speaker: 'doctor',
            text: 'We should evaluate her symptoms carefully. We can check for underlying causes and develop a safe plan to manage the pain.',
            duration: 12,
          },
        ],
      },
      {
        title: 'Guidance & Counselling',
        subtitle: 'Nutrition, puberty, and reproductive health',
        icon: '💬',
        ...C.blue,
        dialogue: [
          {
            speaker: 'doctor',
            text: 'Her evaluation is reassuring. We can focus on managing the pain, tracking her cycles, and supporting healthy development.',
            duration: 12,
          },
          {
            speaker: 'patient',
            text: 'Will she need medication?',
            duration: 6,
          },
          {
            speaker: 'doctor',
            text: 'If needed, appropriate pain relief can help. A healthy diet, adequate rest, and regular monitoring are also important.',
            duration: 12,
          },
        ],
      },
      {
        title: 'Healthy Development',
        subtitle: 'Early management for a healthy future',
        icon: '🌼',
        ...C.green,
        dialogue: [
          {
            speaker: 'patient',
            text: 'She is doing much better now and is no longer missing school.',
            duration: 8,
          },
          {
            speaker: 'doctor',
            text: 'That is wonderful to hear. Please bring her back for a follow-up in about six months, or sooner if her symptoms return.',
            duration: 12,
          },
        ],
      },
    ],
  },

  /* =========================================================
     16. NORMAL DELIVERY
  ========================================================= */

  'normal-delivery': {
    scenes: [
      {
        title: 'Normal Delivery',
        subtitle: 'Safe vaginal childbirth',
        icon: '🍼',
        ...C.pink,
        dialogue: [
          {
            speaker: 'patient',
            text: 'Doctor, I would like to have a vaginal delivery. How can I prepare?',
            duration: 8,
          },
          {
            speaker: 'doctor',
            text: 'Throughout your pregnancy, we will monitor your health and the baby’s development to determine the safest approach to delivery.',
            duration: 12,
          },
          {
            speaker: 'patient',
            text: 'What if complications arise during labor?',
            duration: 6,
          },
          {
            speaker: 'doctor',
            text: 'We will monitor you and the baby closely and respond promptly if any complications arise. Safety will always be our priority.',
            duration: 12,
          },
        ],
      },
      {
        title: 'During Labor',
        subtitle: 'Guided, supported, and safe',
        icon: '🗣',
        ...C.blue,
        dialogue: [
          {
            speaker: 'doctor',
            text: 'You are doing very well. Your baby’s heartbeat is strong and reassuring.',
            duration: 8,
          },
          {
            speaker: 'patient',
            text: 'The contractions are becoming stronger and more frequent.',
            duration: 8,
          },
          {
            speaker: 'doctor',
            text: 'That can indicate that labor is progressing. Keep breathing steadily and follow the guidance of the care team.',
            duration: 12,
          },
        ],
      },
      {
        title: 'A Healthy Baby',
        subtitle: 'Quicker recovery with vaginal birth',
        icon: '👶',
        ...C.green,
        dialogue: [
          {
            speaker: 'doctor',
            text: 'Congratulations! Your baby is healthy, and you did an excellent job.',
            duration: 8,
          },
          {
            speaker: 'patient',
            text: 'Thank you, Doctor. I feel so happy and relieved.',
            duration: 6,
          },
        ],
      },
    ],
  },

  /* =========================================================
     17. CESAREAN SECTION
  ========================================================= */

  'cesarean': {
    scenes: [
      {
        title: 'Cesarean Section',
        subtitle: 'Surgical delivery when medically indicated',
        icon: '🏥',
        ...C.amber,
        dialogue: [
          {
            speaker: 'patient',
            text: 'Doctor, why might I need a cesarean delivery?',
            duration: 6,
          },
          {
            speaker: 'doctor',
            text: 'A cesarean may be recommended when it is safer for the mother or baby, for example because of the baby’s position, fetal distress, or certain previous surgeries.',
            duration: 12,
          },
          {
            speaker: 'patient',
            text: 'Is it safe? I am feeling a little nervous about surgery.',
            duration: 8,
          },
          {
            speaker: 'doctor',
            text: 'Cesarean delivery is a common procedure. We will explain each step and closely monitor you throughout the surgery.',
            duration: 12,
          },
        ],
      },
      {
        title: 'The Procedure',
        subtitle: 'Performed at affiliated hospitals',
        icon: '🏥',
        ...C.blue,
        dialogue: [
          {
            speaker: 'doctor',
            text: 'The procedure usually takes around 45 minutes, although the exact time can vary. With regional anesthesia, you are generally awake during the birth.',
            duration: 12,
          },
          {
            speaker: 'patient',
            text: 'How long will recovery take?',
            duration: 5,
          },
          {
            speaker: 'doctor',
            text: 'Recovery varies from person to person. We will guide you through wound care, mobility, pain management, and follow-up.',
            duration: 12,
          },
        ],
      },
      {
        title: 'Safe Delivery',
        subtitle: 'Best outcome for mother and baby',
        icon: '👶',
        ...C.green,
        dialogue: [
          {
            speaker: 'doctor',
            text: 'The procedure went well, and both you and your baby are doing well. We will continue monitoring your recovery.',
            duration: 12,
          },
          {
            speaker: 'patient',
            text: 'Thank you, Doctor. I am very grateful for your care and support.',
            duration: 8,
          },
        ],
      },
    ],
  },

  /* =========================================================
     18. LAPAROSCOPY
  ========================================================= */

  'laparoscopy': {
    scenes: [
      {
        title: 'Laparoscopic Surgery',
        subtitle: 'Minimally invasive gynaecological surgery',
        icon: '🔭',
        ...C.sky,
        dialogue: [
          {
            speaker: 'patient',
            text: 'Doctor, I have a fibroid that requires surgery. Is laparoscopy an option?',
            duration: 8,
          },
          {
            speaker: 'doctor',
            text: 'In suitable cases, yes. Laparoscopic surgery uses small incisions, a camera, and specialized instruments to perform the procedure.',
            duration: 12,
          },
          {
            speaker: 'patient',
            text: 'How is it different from open surgery?',
            duration: 6,
          },
          {
            speaker: 'doctor',
            text: 'It may result in smaller scars, less postoperative discomfort, a shorter hospital stay, and a faster recovery for suitable patients.',
            duration: 12,
          },
        ],
      },
      {
        title: 'The Procedure',
        subtitle: 'Performed at affiliated hospitals',
        icon: '🏥',
        ...C.blue,
        dialogue: [
          {
            speaker: 'doctor',
            text: 'The procedure is performed through several small incisions. Many patients are able to return home within a day, depending on the surgery.',
            duration: 12,
          },
          {
            speaker: 'patient',
            text: 'Will there be a large scar?',
            duration: 5,
          },
          {
            speaker: 'doctor',
            text: 'The incisions are usually small, often around five to ten millimetres, although this can vary depending on the procedure.',
            duration: 12,
          },
        ],
      },
      {
        title: 'Faster Recovery',
        subtitle: 'Back to your life sooner',
        icon: '🌼',
        ...C.green,
        dialogue: [
          {
            speaker: 'doctor',
            text: 'Recovery time depends on the procedure, but many patients can gradually return to normal activities within a few weeks.',
            duration: 12,
          },
          {
            speaker: 'patient',
            text: 'That sounds reassuring. I would like to discuss proceeding with the procedure.',
            duration: 8,
          },
        ],
      },
    ],
  },

  /* =========================================================
     19. FIBROID
  ========================================================= */

  'fibroid': {
    scenes: [
      {
        title: 'Fibroid Treatment',
        subtitle: 'Relief from bleeding, pain, and pressure',
        icon: '🦻',
        ...C.orange,
        dialogue: [
          {
            speaker: 'patient',
            text: 'Doctor, my periods are very heavy and I have been experiencing pelvic pressure.',
            duration: 8,
          },
          {
            speaker: 'doctor',
            text: 'These symptoms can occur with fibroids. We will use an ultrasound to assess whether fibroids are the cause.',
            duration: 12,
          },
          {
            speaker: 'patient',
            text: 'Are fibroids cancerous?',
            duration: 5,
          },
          {
            speaker: 'doctor',
            text: 'Most uterine fibroids are benign. We will evaluate their size, location, and symptoms before discussing treatment options.',
            duration: 12,
          },
        ],
      },
      {
        title: 'Treatment Options',
        subtitle: 'Medical and surgical management',
        icon: '💊',
        ...C.blue,
        dialogue: [
          {
            speaker: 'doctor',
            text: 'Your fibroid is moderate in size. We can begin by discussing medication to help control the bleeding and other symptoms.',
            duration: 12,
          },
          {
            speaker: 'patient',
            text: 'What if medication does not control the symptoms?',
            duration: 6,
          },
          {
            speaker: 'doctor',
            text: 'If symptoms persist, we can discuss minimally invasive procedures or surgery depending on the fibroid’s size, location, and your future fertility plans.',
            duration: 12,
          },
        ],
      },
      {
        title: 'Symptom Relief',
        subtitle: 'Feeling like yourself again',
        icon: '🌼',
        ...C.green,
        dialogue: [
          {
            speaker: 'patient',
            text: 'My bleeding is much lighter now, and I feel much more like myself.',
            duration: 6,
          },
          {
            speaker: 'doctor',
            text: 'That is good to hear. We will continue monitoring the fibroid and your symptoms during follow-up visits.',
            duration: 10,
          },
        ],
      },
    ],
  },

  /* =========================================================
     20. OVARIAN CYST
  ========================================================= */

  'cyst': {
    scenes: [
      {
        title: 'Ovarian Cyst Treatment',
        subtitle: 'Evaluation and care for ovarian cysts',
        icon: '⭕',
        ...C.orange,
        dialogue: [
          {
            speaker: 'patient',
            text: 'Doctor, my scan shows an ovarian cyst. Could it be dangerous?',
            duration: 8,
          },
          {
            speaker: 'doctor',
            text: 'Many ovarian cysts are benign and resolve on their own. We will assess the cyst and your symptoms carefully.',
            duration: 10,
          },
          {
            speaker: 'patient',
            text: 'I have lower abdominal pain and bloating.',
            duration: 8,
          },
          {
            speaker: 'doctor',
            text: 'We can monitor the cyst with a follow-up scan and decide whether any further treatment is needed.',
            duration: 10,
          },
        ],
      },
      {
        title: 'Monitoring & Treatment',
        subtitle: 'Medicines or surgery when indicated',
        icon: '📡',
        ...C.blue,
        dialogue: [
          {
            speaker: 'doctor',
            text: 'Your cyst has become smaller, which is reassuring. At this stage, surgery is not necessary.',
            duration: 10,
          },
          {
            speaker: 'patient',
            text: 'That is good news. What if it comes back?',
            duration: 6,
          },
          {
            speaker: 'doctor',
            text: 'We will continue monitoring you. If the cyst grows, causes significant pain, or develops concerning features, we will discuss the appropriate options.',
            duration: 12,
          },
        ],
      },
      {
        title: 'Ovarian Health',
        subtitle: 'Preserving your fertility and comfort',
        icon: '🌼',
        ...C.green,
        dialogue: [
          {
            speaker: 'doctor',
            text: 'Your ovaries appear healthy. The cyst appears to have been a temporary fluid-filled cyst.',
            duration: 8,
          },
          {
            speaker: 'patient',
            text: 'Thank you for reassuring me, Doctor. I feel much better now.',
            duration: 6,
          },
        ],
      },
    ],
  },

  /* =========================================================
     21. ENDOMETRIOSIS
  ========================================================= */

  'endometriosis': {
    scenes: [
      {
        title: 'Endometriosis Treatment',
        subtitle: 'Relief from chronic pelvic pain',
        icon: '🧬',
        ...C.fuchsia,
        dialogue: [
          {
            speaker: 'patient',
            text: 'Doctor, I experience severe pain during my periods, and it is affecting my daily life.',
            duration: 10,
          },
          {
            speaker: 'doctor',
            text: 'Endometriosis is one possible cause. How long have you been experiencing this pain?',
            duration: 10,
          },
          {
            speaker: 'patient',
            text: 'For several years, and it has been getting worse. I also experience pain during intercourse.',
            duration: 10,
          },
          {
            speaker: 'doctor',
            text: 'Those symptoms can be associated with endometriosis. We will perform a thorough evaluation, including appropriate imaging.',
            duration: 12,
          },
        ],
      },
      {
        title: 'Diagnosis & Management',
        subtitle: 'Medications, counselling, or surgery',
        icon: '💊',
        ...C.blue,
        dialogue: [
          {
            speaker: 'doctor',
            text: 'Your evaluation suggests endometriosis. We can begin with hormonal treatment to manage the pain and symptoms.',
            duration: 10,
          },
          {
            speaker: 'patient',
            text: 'Will I need surgery?',
            duration: 5,
          },
          {
            speaker: 'doctor',
            text: 'Not necessarily. If medication does not provide adequate relief, we can discuss whether laparoscopic surgery would be appropriate.',
            duration: 12,
          },
        ],
      },
      {
        title: 'Pain Relief & Hope',
        subtitle: 'Better quality of life and fertility',
        icon: '🌼',
        ...C.green,
        dialogue: [
          {
            speaker: 'patient',
            text: 'My pain is much more manageable now, and I am able to get back to my normal activities.',
            duration: 8,
          },
          {
            speaker: 'doctor',
            text: 'I am glad to hear that. We will continue your treatment plan and monitor your symptoms and overall progress.',
            duration: 10,
          },
        ],
      },
    ],
  },
};

export function getServiceVideo(serviceId: string): ServiceVideo | null {
  return SERVICE_VIDEOS[serviceId] ?? null;
}