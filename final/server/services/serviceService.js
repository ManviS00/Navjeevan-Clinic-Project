import serviceRepository from "../repository/serviceRepository.js";

export const CANONICAL_SERVICE_NAMES = [
  "General Gynaecology",
  "Obstetrics",
  "Pregnancy Care",
  "Antenatal Care",
  "High-Risk Pregnancy",
  "Menstrual Disorders",
  "PCOS / PCOD Treatment",
  "Infertility Consultation",
  "Menopause Management",
  "Family Planning",
  "Contraception",
  "HPV Vaccination",
  "Cervical Cancer Screening",
  "Breast Health Check-up",
  "Adolescent Health",
  "Normal Delivery",
  "Cesarean Section",
  "Laparoscopic Surgery",
  "Fibroid Treatment",
  "Ovarian Cyst Treatment",
  "Endometriosis Treatment",
];

const canonicalSet = new Set(CANONICAL_SERVICE_NAMES.map((name) => name.toLowerCase().trim()));

const sortCanonical = (services) => services.sort((a, b) => {
  const ai = CANONICAL_SERVICE_NAMES.findIndex((name) => name.toLowerCase() === String(a.name).toLowerCase());
  const bi = CANONICAL_SERVICE_NAMES.findIndex((name) => name.toLowerCase() === String(b.name).toLowerCase());
  return ai - bi;
});

// Create any missing public services without overwriting existing admin-configured
// prices, durations, or consultation settings. This makes an existing database
// self-healing while keeping the Home page catalog at exactly 21 services.
const ensureCanonicalServices = async () => {
  const existing = await serviceRepository.getAllServices();
  const existingNames = new Set(existing.map((service) => String(service.name).toLowerCase().trim()));
  const defaults = CANONICAL_SERVICE_NAMES.map((name) => ({
    name,
    description: ({
        "General Gynaecology": "Consultation for common gynaecological problems, infections, pain, discharge, menstrual issues, and routine check-ups.",
        "Obstetrics": "Complete care during pregnancy from conception to delivery — maternal and fetal well-being at every step.",
        "Pregnancy Care": "Regular antenatal check-ups, investigations, and fetal growth monitoring throughout your pregnancy.",
        "Antenatal Care": "Scheduled pregnancy visits with counselling, supplements, vaccination, and investigations.",
        "High-Risk Pregnancy": "Management of pregnancies complicated by hypertension, diabetes, thyroid disorders, twins, or previous pregnancy losses.",
        "Menstrual Disorders": "Evaluation and treatment of irregular, painful, or heavy menstrual bleeding.",
        "PCOS / PCOD Treatment": "Diagnosis and individualised treatment including lifestyle advice and medications.",
        "Infertility Consultation": "Evaluation of couples unable to conceive, with investigations and treatment planning.",
        "Menopause Management": "Treatment of menopausal symptoms and preventive care for bone and heart health.",
        "Family Planning": "Counselling on spacing methods and permanent contraception.",
        "Contraception": "Advice and provision of oral pills, IUCD, injectables, and other contraceptive methods.",
        "HPV Vaccination": "Vaccination to protect against HPV infection and cervical cancer.",
        "Cervical Cancer Screening": "Pap smear and screening for early detection of cervical cancer and precancerous changes.",
        "Breast Health Check-up": "Clinical breast examination and evaluation of breast symptoms.",
        "Adolescent Health": "Consultation for puberty, menstrual problems, PCOS, nutrition, and reproductive health in teenagers.",
        "Normal Delivery": "Comprehensive care for vaginal childbirth at affiliated hospitals.",
        "Cesarean Section": "Surgical delivery when medically indicated at affiliated hospitals.",
        "Laparoscopic Surgery": "Minimally invasive surgery for selected gynaecological conditions at affiliated hospitals.",
        "Fibroid Treatment": "Medical and surgical management of uterine fibroids.",
        "Ovarian Cyst Treatment": "Evaluation and treatment of ovarian cysts with medicines or surgery when indicated.",
        "Endometriosis Treatment": "Diagnosis and management with medications, counselling, or surgery.",
      }[name] || `Consultation and care for ${name.toLowerCase()}.`),
    consultationFee: 800,
    duration: 20,
    consultationType: { clinic: true, video: false },
    isActive: true,
  }));

  for (const service of defaults) {
    if (!existingNames.has(service.name.toLowerCase())) {
      await serviceRepository.createService(service);
    }
  }

  return serviceRepository.getAllServices();
};

const filterCanonical = (services) =>
  sortCanonical(services.filter((service) => canonicalSet.has(String(service.name).toLowerCase().trim())));

// Create a new service (Admin)
const createService = async (serviceData) => {
  const { name, consultationFee, duration } = serviceData;
  if (!name || consultationFee === undefined || duration === undefined) {
    throw new Error("Name, consultation fee, and duration are required.");
  }
  if (!name.trim()) throw new Error("Service name cannot be empty.");
  if (consultationFee < 0) throw new Error("Consultation fee cannot be negative.");
  if (duration < 5) throw new Error("Duration must be at least 5 minutes.");

  const existingService = await serviceRepository.getServiceByName(name.trim());
  if (existingService) throw new Error("Service with this name already exists.");

  return await serviceRepository.createService({ ...serviceData, name: name.trim() });
};

const getActiveServices = async () => {
  const services = await ensureCanonicalServices();
  return filterCanonical(services).filter((service) => service.isActive !== false);
};

const getAllServices = async () => {
  const services = await ensureCanonicalServices();
  return filterCanonical(services);
};

const getServiceById = async (id) => {
  const service = await serviceRepository.getServiceById(id);
  if (!service) throw new Error("Service not found.");
  return service;
};

const updateService = async (id, updatedData) => {
  const service = await serviceRepository.getServiceById(id);
  if (!service) throw new Error("Service not found.");
  if (updatedData.name) {
    const existingService = await serviceRepository.getServiceByName(updatedData.name.trim());
    if (existingService && existingService._id.toString() !== id) throw new Error("Service name already exists.");
    updatedData.name = updatedData.name.trim();
  }
  if (updatedData.name !== undefined && !updatedData.name.trim()) throw new Error("Service name cannot be empty.");
  if (updatedData.consultationFee !== undefined && updatedData.consultationFee < 0) throw new Error("Consultation fee cannot be negative.");
  if (updatedData.duration !== undefined && updatedData.duration < 5) throw new Error("Duration must be at least 5 minutes.");
  return await serviceRepository.updateService(id, updatedData);
};

const deleteService = async (id) => {
  const service = await serviceRepository.getServiceById(id);
  if (!service) throw new Error("Service not found.");
  if (!service.isActive) throw new Error("Service is already inactive.");
  return await serviceRepository.deleteService(id);
};

export default {
  createService,
  getActiveServices,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  ensureCanonicalServices,
};
