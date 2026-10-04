const validateFertilityData = (data) => {
  const errors = [];

  const {
    logDate,
    cervicalMucus,
    ovulationTest,
    symptoms,
    notes,
    pregnancyConfirmed,
  } = data;

  // Log Date
  if (logDate && isNaN(new Date(logDate).getTime())) {
    errors.push("Invalid log date");
  }

  // Cervical Mucus
  const allowedMucus = [
    "Dry",
    "Sticky",
    "Creamy",
    "Watery",
    "Egg White",
  ];

  if (
    cervicalMucus &&
    !allowedMucus.includes(cervicalMucus)
  ) {
    errors.push("Invalid cervical mucus type");
  }

  // Ovulation Test
  const allowedTests = [
    "Not Taken",
    "Negative",
    "Positive",
  ];

  if (
    ovulationTest &&
    !allowedTests.includes(ovulationTest)
  ) {
    errors.push("Invalid ovulation test result");
  }

  // Symptoms
  const allowedSymptoms = [
    "Mild Cramps",
    "Breast Tenderness",
    "Bloating",
    "Headache",
    "Fatigue",
    "Back Pain",
    "Mood Swings",
    "Increased Libido",
    "Spotting",
    "None",
    "Other",
  ];

  if (symptoms) {
    if (!Array.isArray(symptoms)) {
      errors.push("Symptoms must be an array");
    } else {
      const invalidSymptoms = symptoms.filter(
        (symptom) =>
          !allowedSymptoms.includes(symptom)
      );

      if (invalidSymptoms.length > 0) {
        errors.push("Invalid symptom value");
      }
    }
  }

  // Notes
  if (
    notes &&
    (typeof notes !== "string" ||
      notes.length > 500)
  ) {
    errors.push(
      "Notes cannot exceed 500 characters"
    );
  }

  // Pregnancy Confirmed
  if (
    pregnancyConfirmed !== undefined &&
    typeof pregnancyConfirmed !== "boolean"
  ) {
    errors.push(
      "Pregnancy confirmed must be true or false"
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default validateFertilityData;