const OTP_ROLE_MAP = {
  farmer: 'Farmer',
  staff: 'Staff',
  retailer: 'Retailer',
  fpo: 'Retailer', // 🔹 Map old FPO to new Retailer
};

export const normalizeOtpRoleId = role => {
  const normalizedRole = role?.toString().trim().toLowerCase();
  return OTP_ROLE_MAP[normalizedRole] || '';
};

export const toOtpApiRole = role => {
  const normalizedRole = normalizeOtpRoleId(role);
  return normalizedRole || role?.toString().trim() || '';
};
