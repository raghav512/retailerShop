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
  primary: '#653228', // Deep brown — headers, icons (white text readable)
  primaryDark: '#4A241D', // Darkest brown — status bar
  primaryLight: '#8B4A3F', // Light brown — tab active, accents
  secondary: '#E8D5D1', // Soft beige — secondary accents, selected cards
  tint: '#FAF6F5', // Very light beige — page background
  tintMid: '#E8D5D1', // Mid tint — card borders/dividers
  tintCard: '#F5EBE8', // Light beige — card backgrounds
  accent: '#A0522D', // Sienna brown — dark accents
  background: '#FAF6F5', // Page bg
  surface: '#FFFFFF', // Card / modal bg
  textPrimary: '#2C1810', // Near-black — main text
  textSecondary: '#8B4A3F', // Muted brown — secondary text
  textOnPrimary: '#FFFFFF', // White — on primary bg
  textSubOnPrimary: '#E8D5D1', // Soft beige — header subtitle
  tabActive: '#8B4A3F', // Tab active icon/label
  tabInactive: '#B8887A', // Tab inactive icon/label
  tabBar: '#FFFFFF', // Tab bar bg
  statusBar: '#4A241D', // StatusBar color
  primaryDisabled: '#D4B5AE', // Light shade for disabled state
};
// ─── FPO PALETTE (Deep Indigo) ────────────────────
export const FPO_COLORS = {
  primary: '#1A1953', // Deep navy blue — headers, primary actions
  primaryDark: '#1A1953', // Deep navy blue — status bar, dark accents
  primaryLight: '#1A1953', // Deep navy blue — lighter header, highlights
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
  tabActive: '#1A1953', // Tab active icon/label - deep navy blue
  tabInactive: '#A5B4FC', // Tab inactive icon/label
  tabBar: '#FFFFFF', // Tab bar bg
  statusBar: '#1A1953', // StatusBar color - deep navy blue
  border: '#E0E7FF', // Subtle borders
  borderLight: '#EEF2FF', // Ultra light borders
  shadow: '#1A1953', // Shadow tint - deep navy blue
};

// ─── STAFF PALETTE (#fb8b24 - Vibrant Orange) ───────────────────
export const STAFF_COLORS = {
  primary: '#fb8b24', // Vibrant orange — headers, primary actions
  primaryDark: '#d97706', // Darker orange — status bar
  primaryLight: '#fca34d', // Light orange — lighter header variant
  secondary: '#fed7aa', // Soft peach — secondary accents
  tint: '#fffbf5', // Very light cream — page background
  tintMid: '#ffedd5', // Mid tint — card borders/dividers
  tintCard: '#fff7ed', // Light peach — card backgrounds
  accent: '#ea580c', // Deep orange — dark accents
  background: '#fffbf5', // Page bg
  surface: '#FFFFFF', // Card / modal bg
  textPrimary: '#431407', // Dark brown — main text
  textSecondary: '#9a3412', // Muted orange-brown — secondary text
  textOnPrimary: '#FFFFFF', // White — on primary bg
  textSubOnPrimary: '#ffedd5', // Soft peach — header subtitle
  tabActive: '#fb8b24', // Tab active icon/label
  tabInactive: '#fdba74', // Tab inactive icon/label
  tabBar: '#FFFFFF', // Tab bar bg
  statusBar: '#d97706', // StatusBar color
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
