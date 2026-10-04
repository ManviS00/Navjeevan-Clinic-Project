import dotenv from "dotenv";
dotenv.config();
import connectDB from "../config/db.js";
import Service from "../models/Service.js";
import mongoose from "mongoose";

// Canonical public service catalog. These names mirror client/src/data/services.ts,
// which powers the Home page. Existing matching services keep their current fee,
// duration and consultation settings; missing catalog entries are created with
// safe defaults so the same catalog is available for booking and admin views.
const services = [
  ["General Gynaecology", "Consultation for common gynaecological problems, infections, pain, discharge, menstrual issues, and routine check-ups."],
  ["Obstetrics", "Complete care during pregnancy from conception to delivery — maternal and fetal well-being at every step."],
  ["Pregnancy Care", "Regular antenatal check-ups, investigations, and fetal growth monitoring throughout your pregnancy."],
  ["Antenatal Care", "Scheduled pregnancy visits with counselling, supplements, vaccination, and investigations."],
  ["High-Risk Pregnancy", "Management of pregnancies complicated by hypertension, diabetes, thyroid disorders, twins, or previous pregnancy losses."],
  ["Menstrual Disorders", "Evaluation and treatment of irregular, painful, or heavy menstrual bleeding."],
  ["PCOS / PCOD Treatment", "Diagnosis and individualised treatment including lifestyle advice and medications."],
  ["Infertility Consultation", "Evaluation of couples unable to conceive, with investigations and treatment planning."],
  ["Menopause Management", "Treatment of menopausal symptoms and preventive care for bone and heart health."],
  ["Family Planning", "Counselling on spacing methods and permanent contraception."],
  ["Contraception", "Advice and provision of oral pills, IUCD, injectables, and other contraceptive methods."],
  ["HPV Vaccination", "Vaccination to protect against HPV infection and cervical cancer."],
  ["Cervical Cancer Screening", "Pap smear and screening for early detection of cervical cancer and precancerous changes."],
  ["Breast Health Check-up", "Clinical breast examination and evaluation of breast symptoms."],
  ["Adolescent Health", "Consultation for puberty, menstrual problems, PCOS, nutrition, and reproductive health in teenagers."],
  ["Normal Delivery", "Comprehensive care for vaginal childbirth at affiliated hospitals."],
  ["Cesarean Section", "Surgical delivery when medically indicated at affiliated hospitals."],
  ["Laparoscopic Surgery", "Minimally invasive surgery for selected gynaecological conditions at affiliated hospitals."],
  ["Fibroid Treatment", "Medical and surgical management of uterine fibroids."],
  ["Ovarian Cyst Treatment", "Evaluation and treatment of ovarian cysts with medicines or surgery when indicated."],
  ["Endometriosis Treatment", "Diagnosis and management with medications, counselling, or surgery."],
].map(([name, description]) => ({
  name,
  description,
  consultationFee: 800,
  duration: 20,
  // Patients should be able to choose either a clinic visit or a video
  // consultation for every service by default; admins can still turn a
  // mode off per-service from the admin dashboard if needed.
  consultationType: { clinic: true, video: true },
  isActive: true,
}));

const run = async () => {
  await connectDB();
  let created = 0;
  let updated = 0;

  for (const service of services) {
    const exists = await Service.findOne({ name: service.name });

    if (exists) {
      // Keep admin-configured values, but make sure canonical services remain
      // active and offer both clinic and video consultation by default so
      // patients always see both options when booking.
      let changed = false;
      if (exists.isActive === false) {
        exists.isActive = true;
        changed = true;
      }
      if (!exists.consultationType) {
        exists.consultationType = { clinic: true, video: true };
        changed = true;
      } else {
        if (exists.consultationType.clinic === undefined) {
          exists.consultationType.clinic = true;
          changed = true;
        }
        if (!exists.consultationType.video) {
          exists.consultationType.video = true;
          changed = true;
        }
      }
      if (changed) {
        await exists.save();
        updated += 1;
      }
      continue;
    }

    await Service.create(service);
    created += 1;
  }

  console.log(`Service catalog seed complete. Created: ${created}, Updated: ${updated}, Existing: ${services.length - created - updated}.`);
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error("Seeding failed:", error.message);
  process.exit(1);
});
