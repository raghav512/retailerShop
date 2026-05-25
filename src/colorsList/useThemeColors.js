import { useSelector } from 'react-redux';
import { FARMER_COLORS, FPO_COLORS, STAFF_COLORS } from './ColorList';
import { normalizeOtpRoleId } from '../utils/otpRole';

/**
 * Custom hook to get the active Theme colors globally based on the User's Role.
 * It reads the role from Redux state and dynamically returns the correct Color Palette.
 */
export const useThemeColors = () => {
  const { userData } = useSelector(state => state.auth);

  // Safely extract the role. Fallback to 'farmer'.
  const role = userData?.role || userData?.user?.role || 'Farmer';
  const normalizedRole = normalizeOtpRoleId(role) || 'Farmer';

  switch (normalizedRole) {
    case 'Retailer':
      return FPO_COLORS;
    case 'Staff':
      return STAFF_COLORS;
    case 'Farmer':
    default:
      return FARMER_COLORS;
  }
};
