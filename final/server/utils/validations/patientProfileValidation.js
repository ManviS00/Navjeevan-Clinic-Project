// Validate Date of Birth 
export const validateDateOfBirth = (dateOfBirth) => { 
    if (!dateOfBirth) { 
        return { 
            isValid: false, 
            message: "Date of birth is required.", 
        }; } 
        
    const dob = new Date(dateOfBirth); 
    
    if (isNaN(dob.getTime())) { 
        return { 
            isValid: false, 
            message: "Invalid date of birth.",
         }; 
        } 
        return { 
            isValid: true, 
        }; 
}; 

// Validate Height 
export const validateHeight = (height) => { 
    if (height === undefined || height === null) {
         return { isValid: false, message: "Height is required.", }; 
    } 
    if (typeof height !== "number") { 
        return { isValid: false, message: "Height must be a number.", }; 
    } 
    if (height < 30 || height > 250) { 
        return { isValid: false, message: "Height must be between 30 cm and 250 cm.", }; 
    } 
    return { isValid: true, }; 
}; 

// Validate Weight 
export const validateWeight = (weight) => { 
    if (weight === undefined || weight === null) { 
        return { isValid: false, message: "Weight is required.", }; 
    } 
    if (typeof weight !== "number") { 
        return { isValid: false, message: "Weight must be a number.", };
    } 
    if (weight < 2 || weight > 300) { 
        return { isValid: false, message: "Weight must be between 2 kg and 300 kg.", }; 
    } return { isValid: true, }; 
}; 

// Validate Address
export const validateAddress = (address) => {
  if (!address || typeof address !== "object") {
    return {
      isValid: false,
      message: "Address is invalid.",
    };
  }

  if (
    address.city !== undefined &&
    typeof address.city !== "string"
  ) {
    return {
      isValid: false,
      message: "City is invalid.",
    };
  }

  if (
    address.state !== undefined &&
    typeof address.state !== "string"
  ) {
    return {
      isValid: false,
      message: "State is invalid.",
    };
  }

  if (
    address.country !== undefined &&
    typeof address.country !== "string"
  ) {
    return {
      isValid: false,
      message: "Country is invalid.",
    };
  }

  if (address.pincode !== undefined) {
    const pinValidation = validatePincode(address.pincode);

    if (!pinValidation.isValid) {
      return pinValidation;
    }
  }

  return {
    isValid: true,
  };
};

// Validate Pincode 
export const validatePincode = (pincode) => { 
    if (!pincode) { 
        return { isValid: false, message: "Pincode is required.", }; 
    } 
    const pinRegex = /^[0-9]{6}$/; 
    if (!pinRegex.test(String(pincode))) { 
        return { isValid: false, message: "Pincode must contain exactly 6 digits.", }; 
    } return { isValid: true, };
 };