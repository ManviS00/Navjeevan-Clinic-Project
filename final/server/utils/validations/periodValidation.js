// One Year Validation
export const validatePeriodDateRange = (startDate) => {
  const today = new Date();

  const selected = new Date(startDate);

  if (selected > today) {
    return {
      isValid: false,
      message: "Future dates are not allowed.",
    };
  }

  const oneYearAgo = new Date();

  oneYearAgo.setFullYear(today.getFullYear() - 1);

  if (selected < oneYearAgo) {
    return {
      isValid: false,
      message: "Period can only be logged within the last one year.",
    };
  }

  return {
    isValid: true,
  };
};

// Period Length
export const validatePeriodLength = (days) => {
  if (days < 2 || days > 10) {
    return {
      isValid: false,
      message: "Period length must be between 2 and 10 days.",
    };
  }

  return {
    isValid: true,
  };
};

// Cycle Length
export const validateCycleLength = (days) => {
  if (days < 21 || days > 45) {
    return {
      isValid: false,
      message: "Cycle length must be between 21 and 45 days.",
    };
  }

  return {
    isValid: true,
  };
};

// 21 Day Gap Validation
export const validateMinimumGap = (
  previousStartDate,
  currentStartDate
) => {
  if (!previousStartDate) {
    return {
      isValid: true,
    };
  }

  const previous = new Date(previousStartDate);
  const current = new Date(currentStartDate);

  const difference =
    (current - previous) / (1000 * 60 * 60 * 24);

  if (difference < 21) {
    return {
      isValid: false,
      message:
        "There must be at least 21 days between two period start dates.",
    };
  }

  return {
    isValid: true,
  };
};

// Calculate End Date
export const calculateEndDate = (
  startDate,
  periodLength
) => {
  const end = new Date(startDate);

  end.setDate(end.getDate() + periodLength - 1);

  return end;
};

// Next Expected Period
export const calculateNextPeriod = (
  startDate,
  cycleLength
) => {
  const next = new Date(startDate);

  next.setDate(next.getDate() + cycleLength);

  return next;
};

// Ovulation Date
export const calculateOvulationDate = (
  nextPeriodDate
) => {
  const ovulation = new Date(nextPeriodDate);

  ovulation.setDate(ovulation.getDate() - 14);

  return ovulation;
};

// Fertile Window
export const calculateFertileWindow = (
  ovulationDate
) => {
  const fertileStart = new Date(ovulationDate);

  fertileStart.setDate(fertileStart.getDate() - 5);

  const fertileEnd = new Date(ovulationDate);

  fertileEnd.setDate(fertileEnd.getDate() + 1);

  return {
    fertileWindowStart: fertileStart,
    fertileWindowEnd: fertileEnd,
  };
};

// Current Cycle Day
export const calculateCycleDay = (
  startDate,
  currentDate = new Date()
) => {
  const diff =
    (currentDate - new Date(startDate)) /
    (1000 * 60 * 60 * 24);

  return Math.floor(diff) + 1;
};