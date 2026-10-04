const validatePregnancyData = (data) => {
  const errors = [];

  // Last Menstrual Period
  if (!data.lastMenstrualPeriod) {
    errors.push("Last menstrual period is required.");
  }

  // Expected Delivery Date
  if (!data.expectedDeliveryDate) {
    errors.push("Expected delivery date is required.");
  }

  // Pregnancy Week
  if (
    data.pregnancyWeek === undefined ||
    data.pregnancyWeek === null
  ) {
    errors.push("Pregnancy week is required.");
  } else if (
    data.pregnancyWeek < 1 ||
    data.pregnancyWeek > 42
  ) {
    errors.push(
      "Pregnancy week must be between 1 and 42."
    );
  }

  // Pregnancy Day
  if (
    data.pregnancyDay === undefined ||
    data.pregnancyDay === null
  ) {
    errors.push("Pregnancy day is required.");
  } else if (
    data.pregnancyDay < 1 ||
    data.pregnancyDay > 7
  ) {
    errors.push(
      "Pregnancy day must be between 1 and 7."
    );
  }

  // Current Weight
  if (
    data.currentWeight !== undefined &&
    data.currentWeight !== null
  ) {
    if (
      data.currentWeight < 20 ||
      data.currentWeight > 200
    ) {
      errors.push(
        "Weight must be between 20kg and 200kg."
      );
    }
  }

  // Hydration
  if (data.hydration?.glasses < 0) {
    errors.push(
      "Water intake cannot be negative."
    );
  }

  // Nutrition
  if (
    data.nutrition?.mealsCompleted < 0
  ) {
    errors.push(
      "Meals completed cannot be negative."
    );
  }

  // Baby Count
  if (
    data.babyDetails?.babyCount !== undefined &&
    data.babyDetails.babyCount < 1
  ) {
    errors.push(
      "Baby count must be at least 1."
    );
  }

  // Baby Name
  if (
    data.babyDetails?.babyName &&
    data.babyDetails.babyName.length > 100
  ) {
    errors.push(
      "Baby name cannot exceed 100 characters."
    );
  }

  // Symptoms
  if (
    data.symptoms &&
    !Array.isArray(data.symptoms)
  ) {
    errors.push(
      "Symptoms must be an array."
    );
  }

  // Medications
  if (
    data.medications &&
    !Array.isArray(data.medications)
  ) {
    errors.push(
      "Medications must be an array."
    );
  }

  // Timeline
  if (
    data.timeline &&
    !Array.isArray(data.timeline)
  ) {
    errors.push(
      "Timeline must be an array."
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default validatePregnancyData;