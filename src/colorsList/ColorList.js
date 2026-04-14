// =========================================================
//  Beej Se Bazar — Role-Based Color Palettes
//  Farmer: Golden Mustard | FPO: Steel Blue | Staff: Warm Gold
// =========================================================

// ─── FARMER PALETTE (Olive Green #8eab53) ─────────────
export const FARMER_COLORS = {
  primary:            '#6a7e3f',   // Deeper green — headers, icons (white text readable)
  primaryDark:        '#4f602b',   // Darkest — status bar
  primaryLight:       '#8eab53',   // Brand green — tab active, accents
  tint:               '#f7fae8',   // Very light green — page background
  tintMid:            '#e6f0cd',   // Mid tint — card borders/dividers
  tintCard:           '#f0f5df',   // Light green — card backgrounds
  accent:             '#4b5e2a',   // Deep green — dark accents
  background:         '#f7fae8',   // Page bg
  surface:            '#FFFFFF',   // Card / modal bg
  textPrimary:        '#1d2611',   // Near-black — main text
  textSecondary:      '#5c7035',   // Muted green — secondary text
  textOnPrimary:      '#FFFFFF',   // White — on primary bg
  textSubOnPrimary:   '#e2f0c9',   // Soft green — header subtitle
  tabActive:          '#8eab53',   // Tab active icon/label
  tabInactive:        '#aec785',   // Tab inactive icon/label
  tabBar:             '#FFFFFF',   // Tab bar bg
  statusBar:          '#4f602b',   // StatusBar color
};

// ─── FPO PALETTE (Steel Blue #a6c6d5) ────────────────────
export const FPO_COLORS = {
  primary:            '#4E8FA8',   // Deeper steel blue — headers (white text readable)
  primaryDark:        '#3D7A93',   // Darkest — status bar
  primaryLight:       '#a6c6d5',   // Brand steel blue — tab active, accents
  tint:               '#EEF5F8',   // Very light blue — page background
  tintMid:            '#C6DFE8',   // Mid tint — card borders/dividers
  tintCard:           '#E5F2F7',   // Light blue — card backgrounds
  accent:             '#1A5F78',   // Deep teal — dark accents
  background:         '#EEF5F8',   // Page bg
  surface:            '#FFFFFF',   // Card / modal bg
  textPrimary:        '#0A2A35',   // Near-black — main text
  textSecondary:      '#4A7A8E',   // Muted steel — secondary text
  textOnPrimary:      '#FFFFFF',   // White — on primary bg
  textSubOnPrimary:   '#D4EAF2',   // Soft blue white — header subtitle
  tabActive:          '#4E8FA8',   // Tab active icon/label
  tabInactive:        '#8AB5C8',   // Tab inactive icon/label
  tabBar:             '#FFFFFF',   // Tab bar bg
  statusBar:          '#3D7A93',   // StatusBar color
};

// ─── STAFF PALETTE (Warm Gold #d8c96c) ───────────────────
export const STAFF_COLORS = {
  primary:            '#BBA93C',   // Deeper warm gold — headers (white text readable)
  primaryDark:        '#9E8D2E',   // Darkest — status bar
  primaryLight:       '#d8c96c',   // Brand warm gold — tab active, accents
  tint:               '#FFFDF0',   // Very light gold — page background
  tintMid:            '#F5E88A',   // Mid tint — card borders/dividers
  tintCard:           '#FFFBCC',   // Light gold — card backgrounds
  accent:             '#6B5A00',   // Deep brown-gold — dark accents
  background:         '#FFFDF0',   // Page bg
  surface:            '#FFFFFF',   // Card / modal bg
  textPrimary:        '#1A1A00',   // Near-black — main text
  textSecondary:      '#6B5F00',   // Muted gold — secondary text
  textOnPrimary:      '#FFFFFF',   // White — on primary bg
  textSubOnPrimary:   '#FFF8CC',   // Soft gold white — header subtitle
  tabActive:          '#d8c96c',   // Tab active icon/label
  tabInactive:        '#C4B870',   // Tab inactive icon/label
  tabBar:             '#FFFFFF',   // Tab bar bg
  statusBar:          '#9E8D2E',   // StatusBar color
};

// ─── SHARED / SEMANTIC COLORS ─────────────────────────────
export const COLORS = {
  error:         '#EF4444',
  errorLight:    '#FEE2E2',
  warning:       '#F59E0B',
  warningLight:  '#FEF3C7',
  success:       '#10B981',
  successLight:  '#D1FAE5',
  textMuted:     '#6B7280',
  border:        '#E5E7EB',
  white:         '#FFFFFF',
  black:         '#000000',
  overlay:       'rgba(0,0,0,0.5)',
};

// ─── LEGACY EXPORTS (backward compat) ────────────────────
export const colorPrimary   = FARMER_COLORS.primary;
export const colorSecondary = FARMER_COLORS.primaryLight;
export const colorLightBlack = '#353839';
export const Button         = FARMER_COLORS.primary;
