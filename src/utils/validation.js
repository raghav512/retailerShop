// ==================== Validation Utilities ====================
// Pure JavaScript validation without external libraries
// Designed for Indian farmer profile forms

// ==================== REGEX PATTERNS ====================

export const ValidationPatterns = {
  // Name validation - only letters and spaces (no dots, apostrophes)
  name: /^[a-zA-Z\s]+$/,

  // Village validation - only letters and spaces
  village: /^[a-zA-Z\s]+$/,

  // Indian mobile number - 10 digits starting with 6-9
  mobileNumber: /^[6-9]\d{9}$/,

  // Email validation
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  // Aadhar number - 12 digits
  aadhar: /^\d{12}$/,

  // PAN number - 5 letters, 4 digits, 1 letter
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,

  // Pincode - 6 digits
  pincode: /^\d{6}$/,

  // Bank account number - 9-18 digits
  bankAccount: /^\d{9,18}$/,

  // IFSC code - 4 letters, 7 alphanumeric
  ifsc: /^[A-Z]{4}[0-9A-Z]{7}$/,
};

// ==================== VALIDATION MESSAGES ====================

export const ValidationMessages = {
  name: {
    required: 'Name is required',
    invalid: 'Name can only contain letters and spaces',
    minLength: 'Name must be at least 2 characters',
    maxLength: 'Name must not exceed 50 characters',
  },
  mobileNumber: {
    required: 'Mobile number is required',
    invalid: 'Please enter a valid 10-digit mobile number starting with 6-9',
    length: 'Mobile number must be exactly 10 digits',
  },
  email: {
    required: 'Email is required',
    invalid: 'Please enter a valid email address',
  },
  aadhar: {
    required: 'Aadhar number is required',
    invalid: 'Aadhar must be exactly 12 digits',
  },
  pan: {
    required: 'PAN is required',
    invalid: 'PAN must be in format: ABCDE1234F',
  },
  pincode: {
    required: 'Pincode is required',
    invalid: 'Pincode must be exactly 6 digits',
  },
  bankAccount: {
    required: 'Bank account number is required',
    invalid: 'Bank account number must be 9-18 digits',
  },
  ifsc: {
    required: 'IFSC code is required',
    invalid: 'IFSC must be in format: ABCD0123456',
  },
  village: {
    required: 'Village is required',
    invalid: 'Village can only contain letters and spaces',
    minLength: 'Village must be at least 2 characters',
    maxLength: 'Village must not exceed 100 characters',
  },
  address: {
    required: 'Address is required',
    minLength: 'Address must be at least 5 characters',
    maxLength: 'Address must not exceed 200 characters',
  },
  state: {
    required: 'State is required',
  },
  district: {
    required: 'District is required',
  },
};

// ==================== CORE VALIDATION FUNCTION ====================

export const validateField = (fieldType, value, options = {}) => {
  const { required = true, minLength, maxLength } = options;

  // Check if field is required and empty
  if (required && (!value || value.trim() === '')) {
    return {
      isValid: false,
      message:
        ValidationMessages[fieldType]?.required || 'This field is required',
    };
  }

  // If not required and empty, return valid
  if (!required && (!value || value.trim() === '')) {
    return { isValid: true, message: '' };
  }

  const trimmedValue = value.trim();

  // Length validations
  if (minLength && trimmedValue.length < minLength) {
    return {
      isValid: false,
      message:
        ValidationMessages[fieldType]?.minLength ||
        `Minimum ${minLength} characters required`,
    };
  }

  if (maxLength && trimmedValue.length > maxLength) {
    return {
      isValid: false,
      message:
        ValidationMessages[fieldType]?.maxLength ||
        `Maximum ${maxLength} characters allowed`,
    };
  }

  // Pattern validation
  const pattern = ValidationPatterns[fieldType];
  if (pattern && !pattern.test(trimmedValue)) {
    return {
      isValid: false,
      message: ValidationMessages[fieldType]?.invalid || 'Invalid format',
    };
  }

  return { isValid: true, message: '' };
};

// ==================== SPECIFIC FIELD VALIDATORS ====================

/**
 * Validate first name
 * @param {string} firstName - First name to validate
 * @param {object} options - Validation options
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateFirstName = (firstName, options = {}) => {
  return validateField('name', firstName, {
    required: true,
    minLength: 2,
    maxLength: 50,
    ...options,
  });
};

/**
 * Validate last name
 * @param {string} lastName - Last name to validate
 * @param {object} options - Validation options
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateLastName = (lastName, options = {}) => {
  return validateField('name', lastName, {
    required: true,
    minLength: 2,
    maxLength: 50,
    ...options,
  });
};

/**
 * Validate mobile number (Indian format)
 * @param {string} mobile - Mobile number to validate
 * @param {object} options - Validation options
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateMobileNumber = (mobile, options = {}) => {
  const result = validateField('mobileNumber', mobile, {
    required: true,
    ...options,
  });

  // Additional length check for mobile
  if (result.isValid && mobile && mobile.trim().length !== 10) {
    return {
      isValid: false,
      message: ValidationMessages.mobileNumber.length,
    };
  }

  return result;
};

/**
 * Validate email
 * @param {string} email - Email to validate
 * @param {object} options - Validation options
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateEmail = (email, options = {}) => {
  return validateField('email', email, {
    required: false,
    ...options,
  });
};

/**
 * Validate village name
 * @param {string} village - Village name to validate
 * @param {object} options - Validation options
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateVillage = (village, options = {}) => {
  return validateField('village', village, {
    required: true,
    minLength: 2,
    maxLength: 100,
    ...options,
  });
};

/**
 * Validate address
 * @param {string} address - Address to validate
 * @param {object} options - Validation options
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateAddress = (address, options = {}) => {
  return validateField('address', address, {
    required: true,
    minLength: 5,
    maxLength: 200,
    ...options,
  });
};

/**
 * Validate state
 * @param {string} state - State to validate
 * @param {object} options - Validation options
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateState = (state, options = {}) => {
  return validateField('state', state, {
    required: true,
    ...options,
  });
};

/**
 * Validate district
 * @param {string} district - District to validate
 * @param {object} options - Validation options
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateDistrict = (district, options = {}) => {
  return validateField('district', district, {
    required: true,
    ...options,
  });
};

/**
 * Validate pincode
 * @param {string} pincode - Pincode to validate
 * @param {object} options - Validation options
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validatePincode = (pincode, options = {}) => {
  return validateField('pincode', pincode, {
    required: true,
    ...options,
  });
};

/**
 * Validate Aadhar number
 * @param {string} aadhar - Aadhar number to validate
 * @param {object} options - Validation options
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateAadhar = (aadhar, options = {}) => {
  return validateField('aadhar', aadhar, {
    required: true,
    ...options,
  });
};

/**
 * Validate PAN number
 * @param {string} pan - PAN number to validate
 * @param {object} options - Validation options
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validatePAN = (pan, options = {}) => {
  return validateField('pan', pan?.toUpperCase(), {
    required: false,
    ...options,
  });
};

/**
 * Validate bank account number
 * @param {string} accountNumber - Bank account number to validate
 * @param {object} options - Validation options
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateBankAccount = (accountNumber, options = {}) => {
  return validateField('bankAccount', accountNumber, {
    required: true,
    ...options,
  });
};

/**
 * Validate IFSC code
 * @param {string} ifsc - IFSC code to validate
 * @param {object} options - Validation options
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateIFSC = (ifsc, options = {}) => {
  return validateField('ifsc', ifsc?.toUpperCase(), {
    required: true,
    ...options,
  });
};

// ==================== FORM VALIDATION HELPER ====================

/**
 * Validate entire form with multiple fields
 * @param {object} formData - Form data object
 * @param {object} validationRules - Validation rules for each field
 * @returns {object} - { isFormValid: boolean, errors: object }
 */
export const validateForm = (formData, validationRules) => {
  const errors = {};
  let isFormValid = true;

  Object.keys(validationRules).forEach(fieldName => {
    const rule = validationRules[fieldName];
    const value = formData[fieldName];

    let result;

    switch (rule.type) {
      case 'firstName':
        result = validateFirstName(value, rule.options);
        break;
      case 'lastName':
        result = validateLastName(value, rule.options);
        break;
      case 'mobileNumber':
        result = validateMobileNumber(value, rule.options);
        break;
      case 'email':
        result = validateEmail(value, rule.options);
        break;
      case 'village':
        result = validateVillage(value, rule.options);
        break;
      case 'address':
        result = validateAddress(value, rule.options);
        break;
      case 'state':
        result = validateState(value, rule.options);
        break;
      case 'district':
        result = validateDistrict(value, rule.options);
        break;
      case 'pincode':
        result = validatePincode(value, rule.options);
        break;
      case 'aadhar':
        result = validateAadhar(value, rule.options);
        break;
      case 'pan':
        result = validatePAN(value, rule.options);
        break;
      case 'bankAccount':
        result = validateBankAccount(value, rule.options);
        break;
      case 'ifsc':
        result = validateIFSC(value, rule.options);
        break;
      default:
        result = validateField(rule.type, value, rule.options);
    }

    if (!result.isValid) {
      errors[fieldName] = result.message;
      isFormValid = false;
    }
  });

  return { isFormValid, errors };
};

// ==================== BATCH VALIDATION ====================

/**
 * Validate multiple fields at once
 * @param {object} fields - Fields to validate
 * @param {object} validationRules - Validation rules
 * @returns {object} - Validation results for each field
 */
export const validateBatch = (fields, validationRules) => {
  const results = {};

  Object.keys(fields).forEach(fieldName => {
    const value = fields[fieldName];
    const rule = validationRules[fieldName];

    if (rule) {
      const result = validateField(rule.type, value, rule.options);
      results[fieldName] = {
        isValid: result.isValid,
        message: result.message,
        value,
      };
    }
  });

  return results;
};

// ==================== VALIDATION RULES PRESETS ====================

/**
 * Personal Details validation rules
 */
export const PersonalDetailsValidationRules = {
  firstName: { type: 'firstName', options: {} },
  lastName: { type: 'lastName', options: {} },
  mobileNumber: { type: 'mobileNumber', options: {} },
  email: { type: 'email', options: { required: false } },
  village: { type: 'village', options: {} },
};

/**
 * Address Details validation rules
 */
export const AddressDetailsValidationRules = {
  state: { type: 'state', options: {} },
  district: { type: 'district', options: {} },
  pincode: { type: 'pincode', options: {} },
  address: { type: 'address', options: {} },
};

/**
 * Bank Details validation rules
 */
export const BankDetailsValidationRules = {
  accountNumber: { type: 'bankAccount', options: {} },
  ifsc: { type: 'ifsc', options: {} },
  accountHolder: {
    type: 'firstName',
    options: { minLength: 2, maxLength: 100 },
  },
  bankName: { type: 'firstName', options: { minLength: 2, maxLength: 100 } },
};

/**
 * Document Details validation rules
 */
export const DocumentDetailsValidationRules = {
  aadhar: { type: 'aadhar', options: {} },
  pan: { type: 'pan', options: { required: false } },
  drivingLicense: {
    type: 'firstName',
    options: { required: false, minLength: 8, maxLength: 20 },
  },
};
