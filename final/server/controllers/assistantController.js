import ChatConversation from "../models/ChatConversation.js";
import ChatMessage from "../models/ChatMessage.js";
import Doctor from "../models/Doctor.js";
import Service from "../models/Service.js";

async function generateAI(messages, mode="text") {
  const key = String(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "").trim();

  let doctor = null;
  let services = [];
  try {
    [doctor, services] = await Promise.all([
      Doctor.findOne({ isDeleted: false, status: true }).select("fullName qualification specialization experience consultationFee bio"),
      Service.find({ isActive: true }).select("name consultationFee duration consultationType").sort({ name: 1 }),
    ]);
  } catch (dbError) {
    console.error("Assistant clinic-context lookup failed:", dbError?.message || dbError);
    // General questions can still be answered even if MongoDB is temporarily unavailable.
  }

  const clinicContext = [
    "Current Navjeevan Clinic database information:",
    `Doctor: ${doctor?.fullName || "No active doctor configured"}. Qualification: ${doctor?.qualification || ""}. Specialization: ${doctor?.specialization || ""}. Experience: ${doctor?.experience ?? ""} years.`,
    "Clinic hours: Monday-Saturday; Sunday is closed.",
    `Active services: ${services.map(s => `${s.name} (₹${s.consultationFee}, ${s.duration} min, clinic=${s.consultationType?.clinic ? "yes" : "no"}, video=${s.consultationType?.video ? "yes" : "no"})`).join("; ") || "No services configured"}.`,
    "Never invent a service, fee, doctor, appointment slot, or clinic policy. If the database does not contain the answer, say that the patient should contact the clinic.",
  ].join("\n");

  const lastUserMessage = [...messages].reverse().find(m => m?.role === "user")?.content?.trim() || "";

  // A useful local fallback means the voice assistant never spins forever when
  // Gemini is unavailable, misconfigured, rate-limited, or temporarily down.
  const fallback = getSafeFallback(lastUserMessage, { doctor, services });
  if (!key) return fallback;

  const model = String(process.env.GEMINI_MODEL || "gemini-2.5-flash").trim();
  const prompt = [
    "You are Aayushi AI, the virtual assistant for Navjeevan Clinic, a women's health clinic in India.",
    "Be concise, empathetic and safe. You provide general health information, not diagnosis or emergency care.",
    "Never claim to be a doctor. Do not prescribe prescription medicines or provide dangerous instructions.",
    "For emergency/severe symptoms, advise immediate in-person medical care.",
    clinicContext,
    `Conversation mode: ${mode}.`,
    ...messages.slice(-12).map(m => `${m.role === "assistant" ? "Assistant" : "User"}: ${String(m.content || "").slice(0, 4000)}`),
    "Assistant:"
  ].join("\n");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: "You are Aayushi AI for Navjeevan Clinic. Follow the clinic context and safety rules exactly." }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 500 },
      }),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("Gemini API error:", response.status, data?.error?.message || data);
      return fallback;
    }
    const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim();
    return text || fallback;
  } catch (error) {
    console.error("Gemini request failed:", error?.name === "AbortError" ? "timeout" : error?.message || error);
    return fallback;
  } finally {
    clearTimeout(timeout);
  }
}

// Local knowledge base used only when Gemini is unavailable (no API key,
// rate-limited, timed out, or erroring). Each topic has several distinct
// phrasings so the assistant doesn't sound like it's repeating a script when
// several different questions land in the same topic during one conversation.
// This is deliberately much broader than a single "PCOS or nothing" check so
// most common women's-health questions get a real, topic-specific answer
// instead of falling through to the generic message every time.
const TOPIC_LIBRARY = [
  {
    name: "pcos",
    test: /\bpcos\b|\bpcod\b|polycystic ovary/,
    answers: [
      "PCOS (polycystic ovary syndrome) is a common hormonal condition that can affect ovulation and menstrual cycles. Typical features include irregular periods, acne, extra facial or body hair, and sometimes difficulty conceiving. Many people with PCOS also notice weight changes or insulin resistance, though symptoms vary a lot from person to person.",
      "With PCOS, the ovaries can develop many small follicles and hormone levels (like androgens and insulin) shift, which is why periods often become irregular and skin/hair changes can appear. It's usually diagnosed through history, examination, and sometimes blood tests or an ultrasound — not from symptoms alone.",
      "PCOS management is very individual: some people focus on lifestyle changes (diet, activity, sleep), others need medication to regulate cycles, manage acne/hair growth, or support fertility. There's no single fix that works for everyone — treatment is tailored to your goals, whether that's symptom relief, cycle regularity, or planning a pregnancy.",
    ],
  },
  {
    name: "periods",
    test: /\bperiod\b|\bmenstru|\bcycle\b.*(irregular|late|missed|heavy)|spotting/,
    answers: [
      "A typical menstrual cycle runs anywhere from about 21 to 35 days, with bleeding lasting 2–7 days — there's a real range of what's normal. Occasional variation is common, but cycles that are consistently very irregular, unusually heavy, or accompanied by severe pain are worth getting checked.",
      "Irregular or missed periods can come from many causes — stress, significant weight change, thyroid issues, PCOS, perimenopause, or sometimes pregnancy. Tracking your cycle for a couple of months (which you can do right here in your dashboard) makes it much easier for a doctor to spot a pattern.",
      "Heavy or very painful periods aren't something you have to just tolerate — there are effective treatments ranging from lifestyle and pain management to hormonal options or addressing an underlying cause like fibroids. If it's affecting your daily life, that's a good reason to book a consultation.",
    ],
  },
  {
    name: "fertility",
    test: /fertil|trying to conceive|ovulat|infertil|getting pregnant/,
    answers: [
      "Fertility is influenced by cycle regularity, ovulation timing, age, and overall health for both partners. Tracking ovulation (cervical mucus, basal body temperature, or ovulation predictor kits) can help identify your most fertile window if you're trying to conceive.",
      "If you've been trying to conceive for 12 months (or 6 months if you're over 35) without success, it's a reasonable time for a fertility evaluation — this usually starts with a history and some basic tests before deciding on next steps.",
      "Conditions like PCOS, endometriosis, thyroid disorders, or blocked fallopian tubes can affect fertility, but many of these are manageable. An evaluation helps pinpoint what's going on rather than guessing.",
    ],
  },
  {
    name: "pregnancy",
    test: /pregnan|trimester|prenatal|antenatal|expecting a baby/,
    answers: [
      "Pregnancy is generally tracked across three trimesters — the first (weeks 1–12) is when major organs form, the second (13–26) is often the most comfortable, and the third (27–40) is about growth and preparing for delivery. Regular antenatal check-ups matter throughout.",
      "Early pregnancy care usually includes confirming the pregnancy, dating it accurately, starting folic acid/prenatal vitamins, and screening for any risk factors. Your dashboard's pregnancy tracker can help you log weight, symptoms, and medications along the way.",
      "Warning signs at any stage of pregnancy — heavy bleeding, severe abdominal pain, reduced fetal movement, severe headache, or vision changes — should never wait for a scheduled visit. Those need prompt in-person medical attention.",
    ],
  },
  {
    name: "endometriosis",
    test: /endometrio/,
    answers: [
      "Endometriosis happens when tissue similar to the uterine lining grows outside the uterus, which can cause pelvic pain (especially around periods), pain during intercourse, and sometimes fertility difficulties. Severity of symptoms doesn't always match severity of disease.",
      "Endometriosis is typically suspected from symptoms and examination, and confirmed with imaging or, in some cases, laparoscopy. Treatment ranges from pain management and hormonal therapy to surgery, depending on symptoms and whether you're trying to conceive.",
    ],
  },
  {
    name: "fibroids",
    test: /fibroid/,
    answers: [
      "Fibroids are non-cancerous growths in or around the uterus. Many cause no symptoms at all, but depending on size and location they can cause heavy periods, pelvic pressure, or pain. Not every fibroid needs treatment — it depends on your symptoms.",
      "Fibroid treatment options range from monitoring and medication to reduce bleeding, to minimally invasive or surgical removal for larger or symptomatic fibroids. The right approach depends on size, location, your symptoms, and whether you want to preserve fertility.",
    ],
  },
  {
    name: "menopause",
    test: /menopaus|perimenopaus|hot flash/,
    answers: [
      "Menopause is diagnosed after 12 months without a period, usually happening between 45–55. The transition (perimenopause) often brings irregular cycles, hot flashes, sleep changes, and mood shifts before periods stop completely.",
      "Managing menopausal symptoms can include lifestyle changes, non-hormonal medications, or hormone therapy depending on your symptoms and health history — plus attention to bone and heart health, which becomes more important after menopause.",
    ],
  },
  {
    name: "contraception",
    test: /contracept|birth control|family planning|iucd|\bpill\b/,
    answers: [
      "There are several contraception options — pills, IUCDs/IUDs, injectables, implants, barrier methods, and permanent options — each with different effectiveness, side-effect profiles, and reversibility. What suits you best depends on your health, plans for future pregnancy, and preference.",
      "If you're deciding between contraceptive methods, it helps to think about how reversible you want it to be, whether you can remember a daily pill, and any health conditions that might rule certain hormonal options in or out. A consultation can walk through what fits your situation.",
    ],
  },
  {
    name: "breast",
    test: /breast (health|lump|pain|check)/,
    answers: [
      "Most breast lumps are not cancerous, but any new lump, unusual pain, nipple discharge, or skin/shape change should be checked by a doctor rather than assumed to be harmless. A clinical breast exam is quick and can guide whether further imaging is needed.",
    ],
  },
  {
    name: "cervical-screening",
    test: /pap smear|cervical (cancer|screening)|hpv/,
    answers: [
      "Cervical cancer screening (Pap smear, sometimes combined with HPV testing) looks for early cell changes long before they'd cause symptoms — that's exactly why routine screening matters even if you feel completely fine. HPV vaccination is a separate, preventive step that's most effective before exposure to the virus.",
    ],
  },
  {
    name: "adolescent",
    test: /teenage?r|adolescent|puberty|first period/,
    answers: [
      "Adolescent gynaecological visits often cover puberty changes, irregular periods (which are common in the first couple of years after periods start), PCOS screening, and general reproductive health education in an age-appropriate way.",
    ],
  },
  {
    name: "booking",
    test: /book|appointment|slot|schedule|consult(ation)?\b.*(book|available)|video consult/,
    answers: null, // handled dynamically below using live service/doctor data
  },
  {
    name: "greeting",
    test: /^\s*(hi|hello|hey|namaste|good (morning|afternoon|evening))\b/,
    answers: [
      "Hi! I'm Ziva. You can ask me about periods, PCOS, pregnancy, fertility, menopause, or general women's wellness, or ask me about booking an appointment at Navjeevan Clinic.",
    ],
  },
];

// Deterministic-but-varied pick: rotates through a topic's answers based on
// the question text itself, so re-asking the same thing later in a session
// doesn't always land on the exact same sentence, while identical questions
// still get a consistent answer within a single call.
function pickVariant(answers, seed) {
  if (answers.length === 1) return answers[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return answers[hash % answers.length];
}

function getSafeFallback(question = "", { doctor, services = [] } = {}) {
  const q = question.toLowerCase().trim();
  const doctorName = doctor?.fullName || "our doctor";

  // Personal/emotional check-in: this must run before topic matching so a
  // patient saying "I am not feeling well" gets a human, conversational
  // response instead of a generic clinic FAQ. We intentionally ask a short
  // follow-up instead of pretending to diagnose from one sentence.
  const emergency = /\b(chest pain|difficulty breathing|cannot breathe|faint(?:ed|ing)?|unconscious|severe bleeding|heavy bleeding|severe abdominal pain|suicid|harm myself)\b/;
  if (emergency.test(q)) {
    return "I'm really sorry you're feeling this way. Because the symptoms you mentioned could be serious, please seek urgent in-person medical care now or contact your local emergency service. If you can, tell someone nearby and don't stay alone while getting help.";
  }
  const personalCheckIn = /\b(not feeling well|not well|feel(?:ing)? (?:unwell|weak|sick|bad|low|down|tired|exhausted|dizzy|anxious|worried|stressed|sad|upset)|i am unwell|i'm unwell|i am sick|i'm sick|something is wrong)\b/;
  if (personalCheckIn.test(q)) {
    return "I'm sorry you're not feeling well. I'm here with you, and you don't have to phrase it like a medical question. Can you tell me a little more about what you're feeling right now—for example, pain, weakness, fever, dizziness, nausea, anxiety, sadness, or something else—and when it started? I can help with general guidance and tell you when it would be safer to see a doctor urgently.";
  }

  for (const topic of TOPIC_LIBRARY) {
    if (!topic.test.test(q)) continue;

    if (topic.name === "booking") {
      const serviceNames = services.slice(0, 6).map((s) => s.name).join(", ") || "our consultation services";
      const videoOffered = services.some((s) => s.consultationType?.video);
      return `You can book an appointment with ${doctorName} directly from the Bookings section of your dashboard. We currently offer ${serviceNames}${services.length > 6 ? ", and more" : ""}.${videoOffered ? " Both clinic-visit and video-consultation options are available depending on the service you choose." : ""} Clinic hours are Monday–Saturday; we're closed on Sundays.`;
    }

    return pickVariant(topic.answers, q || topic.name);
  }

  // Nothing matched a known topic — reflect the question back so the reply
  // doesn't feel like a completely canned, unrelated message, and still
  // point toward what the assistant *can* help with.
  const trimmedQuestion = question.trim();
  if (trimmedQuestion) {
    return `I don't have a specific answer for "${trimmedQuestion.length > 80 ? trimmedQuestion.slice(0, 80) + "…" : trimmedQuestion}" in my offline notes right now. I can help with periods, PCOS, pregnancy, fertility, endometriosis, fibroids, menopause, contraception, breast health, cervical screening, or booking an appointment with ${doctorName}. For anything specific to your own health, please book a consultation for personalised advice.`;
  }
  return `I can help with general information about periods, PCOS, pregnancy, fertility, menopause and women's wellness, or with booking an appointment with ${doctorName}. For a personal medical concern or diagnosis, please book a consultation.`;
}

export const health = async (req, res) => {
  const key = String(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "").trim();
  res.json({
    success: true,
    configured: Boolean(key),
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    mode: key ? "gemini" : "fallback",
  });
};

export const chat = async (req,res) => {
  try {
    const messages = Array.isArray(req.body.messages) ? req.body.messages : [];
    if (!messages.length) return res.status(400).json({success:false,message:"Messages are required."});
    const text = await generateAI(messages, req.body.mode || "text");
    res.json({success:true,text});
  } catch(e) { res.status(503).json({success:false,message:e.message}); }
};

export const listConversations = async (req,res) => {
  const sessionId = String(req.query.sessionId || "");
  if (!sessionId) return res.status(400).json({success:false,message:"sessionId is required."});
  const data = await ChatConversation.find({sessionId}).sort({updatedAt:-1});
  res.json({success:true,data:data.map(c=>({id:String(c._id),session_id:c.sessionId,title:c.title,created_at:c.createdAt,updated_at:c.updatedAt}))});
};

export const createConversation = async (req,res) => {
  const {sessionId,title} = req.body;
  if (!sessionId) return res.status(400).json({success:false,message:"sessionId is required."});
  const c = await ChatConversation.create({sessionId,title:title||"New conversation"});
  res.status(201).json({success:true,data:{id:String(c._id),session_id:c.sessionId,title:c.title,created_at:c.createdAt,updated_at:c.updatedAt}});
};

export const listMessages = async (req,res) => {
  const c = await ChatConversation.findById(req.params.id);
  if (!c) return res.status(404).json({success:false,message:"Conversation not found."});
  const data = await ChatMessage.find({conversation:c._id}).sort({createdAt:1});
  res.json({success:true,data:data.map(m=>({id:String(m._id),role:m.role,content:m.content,matched_entry_id:m.matchedEntryId,created_at:m.createdAt}))});
};

export const addMessage = async (req,res) => {
  const c = await ChatConversation.findById(req.params.id);
  if (!c) return res.status(404).json({success:false,message:"Conversation not found."});
  const {role,content,matchedEntryId=null} = req.body;
  if (!["user","assistant"].includes(role) || !content?.trim()) return res.status(400).json({success:false,message:"Invalid message."});
  const m = await ChatMessage.create({conversation:c._id,role,content:content.trim(),matchedEntryId});
  c.updatedAt = new Date(); await c.save();
  res.status(201).json({success:true,data:{id:String(m._id),role:m.role,content:m.content,matched_entry_id:m.matchedEntryId,created_at:m.createdAt}});
};

export const touchConversation = async (req,res) => {
  const c=await ChatConversation.findByIdAndUpdate(req.params.id,{updatedAt:new Date()},{new:true});
  if(!c) return res.status(404).json({success:false,message:"Conversation not found."});
  res.json({success:true});
};

export const deleteConversation = async (req,res) => {
  const c=await ChatConversation.findByIdAndDelete(req.params.id);
  if(!c) return res.status(404).json({success:false,message:"Conversation not found."});
  await ChatMessage.deleteMany({conversation:req.params.id});
  res.json({success:true});
};
