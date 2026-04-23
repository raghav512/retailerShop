// =========================================================
//  Retail Management System — Role-Based Color Palettes
//  Farmer: Golden Mustard | Distributor: Steel Blue | Staff: Warm Gold
// =========================================================

// ─── FARMER PALETTE (Olive Green #8eab53) ─────────────
export const FARMER_COLORS = {
  primary: '#2B4D21E5', // Deeper green — headers, icons (white text readable)
  primaryDark: '#2B4D21E5', // Darkest — status bar
  primaryLight: '#4A7C35', // Light green — lighter header variant
  secondary: '#C8E6C9', // Light shade green — secondary accents, selected cards
  tint: '#f7fae8', // Very light green — page background
  tintMid: '#e6f0cd', // Mid tint — card borders/dividers
  tintCard: '#f0f5df', // Light green — card backgrounds
  accent: '#4b5e2a', // Deep green — dark accents
  background: '#f7fae8', // Page bg
  surface: '#FFFFFF', // Card / modal bg
  textPrimary: '#1d2611', // Near-black — main text
  textSecondary: '#5c7035', // Muted green — secondary text
  textOnPrimary: '#FFFFFF', // White — on primary bg
  textSubOnPrimary: '#e2f0c9', // Soft green — header subtitle
  tabActive: '#8eab53', // Tab active icon/label
  tabInactive: '#aec785', // Tab inactive icon/label
  tabBar: '#FFFFFF', // Tab bar bg
  statusBar: '#4f602b', // StatusBar color
};

export const RETAILER_COLORS = {
  primary: '#C85A17', // Deeper orange — headers, icons (white text readable)
  primaryDark: '#A04A13', // Darkest — status bar
  primaryLight: '#E67E22', // Brand orange — tab active, accents
  secondary: '#FADEC9', // Light shade orange — secondary accents, selected cards
  tint: '#FFF8F0', // Very light orange — page background
  tintMid: '#FFE5CC', // Mid tint — card borders/dividers
  tintCard: '#FFF0E0', // Light orange — card backgrounds
  accent: '#8B4513', // Deep brown-orange — dark accents
  background: '#FFF8F0', // Page bg
  surface: '#FFFFFF', // Card / modal bg
  textPrimary: '#2C1810', // Near-black — main text
  textSecondary: '#8B5A3C', // Muted orange — secondary text
  textOnPrimary: '#FFFFFF', // White — on primary bg
  textSubOnPrimary: '#FFE5CC', // Soft orange — header subtitle
  tabActive: '#E67E22', // Tab active icon/label
  tabInactive: '#F5A76B', // Tab inactive icon/label
  tabBar: '#FFFFFF', // Tab bar bg
  statusBar: '#A04A13', // StatusBar color
  primaryDisabled: '#F5C99B', // Light shade for disabled state
};
// ─── FPO PALETTE (Deep Indigo) ────────────────────
export const FPO_COLORS = {
  primary: '#4338CA', // Rich indigo — headers, primary actions
  primaryDark: '#312E81', // Deep indigo — status bar, dark accents
  primaryLight: '#6366F1', // Bright indigo — lighter header, highlights
  secondary: '#C7D2FE', // Soft lavender — secondary accents
  tint: '#F5F7FF', // Ultra light indigo — page background
  tintMid: '#E0E7FF', // Light lavender — card borders/dividers
  tintCard: '#EEF2FF', // Pale indigo — card backgrounds
  accent: '#1E1B4B', // Midnight indigo — deep accents
  background: '#F5F7FF', // Page bg
  surface: '#FFFFFF', // Card / modal bg
  surfaceElevated: '#FEFEFF', // Elevated cards
  textPrimary: '#1E1B4B', // Deep indigo — main text
  textSecondary: '#6366F1', // Muted indigo — secondary text
  textTertiary: '#94A3B8', // Slate gray — tertiary text
  textOnPrimary: '#FFFFFF', // White — on primary bg
  textSubOnPrimary: '#E0E7FF', // Soft lavender — header subtitle
  tabActive: '#4338CA', // Tab active icon/label
  tabInactive: '#A5B4FC', // Tab inactive icon/label
  tabBar: '#FFFFFF', // Tab bar bg
  statusBar: '#312E81', // StatusBar color
  border: '#E0E7FF', // Subtle borders
  borderLight: '#EEF2FF', // Ultra light borders
  shadow: '#4338CA', // Shadow tint
};

// ─── STAFF PALETTE (Warm Gold #d8c96c) ───────────────────
export const STAFF_COLORS = {
  primary: '#FFC100', // Deeper warm gold — headers (white text readable)
  primaryDark: '#FFC100', // Darkest — status bar
  primaryLight: '#FFD54F', // Light warm gold — lighter header variant
  tint: '#FFFDF0', // Very light gold — page background
  tintMid: '#F5E88A', // Mid tint — card borders/dividers
  tintCard: '#FFFBCC', // Light gold — card backgrounds
  accent: '#6B5A00', // Deep brown-gold — dark accents
  background: '#FFFDF0', // Page bg
  surface: '#FFFFFF', // Card / modal bg
  textPrimary: '#1A1A00', // Near-black — main text
  textSecondary: '#6B5F00', // Muted gold — secondary text
  textOnPrimary: '#FFFFFF', // White — on primary bg
  textSubOnPrimary: '#FFF8CC', // Soft gold white — header subtitle
  tabActive: '#d8c96c', // Tab active icon/label
  tabInactive: '#C4B870', // Tab inactive icon/label
  tabBar: '#FFFFFF', // Tab bar bg
  statusBar: '#9E8D2E', // StatusBar color
};

// ─── SHARED / SEMANTIC COLORS ─────────────────────────────
export const COLORS = {
  error: '#EF4444',
  errorLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  success: '#10B981',
  successLight: '#D1FAE5',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.5)',
};

// ─── LEGACY EXPORTS (backward compat) ────────────────────
export const colorPrimary = FARMER_COLORS.primary;
export const colorSecondary = FARMER_COLORS.primaryLight;
export const colorLightBlack = '#353839';
export const Button = FARMER_COLORS.primary;
