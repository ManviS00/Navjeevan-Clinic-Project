export const validateCreatePrescription = (
  req,
  res,
  next
) => {
  const {
    appointmentId,
    diagnosis,
    medicines,
    recommendedTests,
    followUpDate,
  } = req.body;

  // Appointment
  if (!appointmentId) {
    return res.status(400).json({
      success: false,
      message: "Appointment ID is required.",
    });
  }

  // Diagnosis
  if (!diagnosis || !diagnosis.trim()) {
    return res.status(400).json({
      success: false,
      message: "Diagnosis is required.",
    });
  }

  // Medicines
  if (!Array.isArray(medicines) || medicines.length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one medicine is required.",
    });
  }

  for (const medicine of medicines) {
    if (
      !medicine.medicineName ||
      !medicine.dosage ||
      !medicine.frequency ||
      !medicine.duration
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Each medicine must include medicineName, dosage, frequency and duration.",
      });
    }
    if (!/^[0-9]+(?:\.[0-9]+)?\s*mg$/i.test(String(medicine.dosage).trim())) {
      return res.status(400).json({ success:false, message:"Medicine dosage must be a numeric amount in mg, e.g. 400 mg." });
    }
  }

  // Recommended Tests (optional)
  if (
    recommendedTests &&
    !Array.isArray(recommendedTests)
  ) {
    return res.status(400).json({
      success: false,
      message:
        "recommendedTests must be an array.",
    });
  }

  // Follow-up Date (optional)
  if (
    followUpDate &&
    isNaN(new Date(followUpDate).getTime())
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid follow-up date.",
    });
  }

  const follow = followUpDate ? new Date(followUpDate) : null;
  if (follow) {
    const min = new Date(); min.setHours(0,0,0,0); min.setDate(min.getDate()+1);
    const max = new Date(); max.setHours(0,0,0,0); max.setDate(max.getDate()+14);
    if (follow < min || follow > max) return res.status(400).json({ success:false, message:'Follow-up date must be within the next 14 days.' });
  }

  next();
};

export const validateUpdatePrescription = (
  req,
  res,
  next
) => {
  const { medicines, recommendedTests, followUpDate } =
    req.body;

  if (
    medicines &&
    (!Array.isArray(medicines) ||
      medicines.length === 0)
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Medicines must be a non-empty array.",
    });
  }

  if (medicines) {
    for (const medicine of medicines) {
      if (
        !medicine.medicineName ||
        !medicine.dosage ||
        !medicine.frequency ||
        !medicine.duration
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each medicine must include medicineName, dosage, frequency and duration.",
        });
      }
    }
  }

  if (
    recommendedTests &&
    !Array.isArray(recommendedTests)
  ) {
    return res.status(400).json({
      success: false,
      message:
        "recommendedTests must be an array.",
    });
  }

  if (
    followUpDate &&
    isNaN(new Date(followUpDate).getTime())
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid follow-up date.",
    });
  }

  if (followUpDate) {
    const follow = new Date(followUpDate);
    const min = new Date(); min.setHours(0,0,0,0); min.setDate(min.getDate()+1);
    const max = new Date(); max.setHours(0,0,0,0); max.setDate(max.getDate()+14);
    if (follow < min || follow > max) return res.status(400).json({ success:false, message:'Follow-up date must be within the next 14 days.' });
  }

  next();
};