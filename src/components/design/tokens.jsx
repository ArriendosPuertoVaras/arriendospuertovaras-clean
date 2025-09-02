/**
 * Design tokens for Arriendos Puerto Varas
 * Centralized design system tokens for consistent UI
 */

export const colors = {
  // Brand colors
  primary: {
    yellow: '#FCC332',
    yellowHover: '#F5B82E',
    yellowPressed: '#E6A429',
  },
  
  // Neumorphic colors
  neutral: {
    bg: '#e0e0e0',
    light: '#ffffff',
    dark: '#bebebe',
    text: '#333333',
    textLight: '#666666',
    textMuted: '#999999',
  },
  
  // Semantic colors
  semantic: {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
  
  // Gradients
  gradients: {
    heroOverlay: 'linear-gradient(180deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.05) 100%)',
    cardHover: 'linear-gradient(145deg, #e6e6e6, #dadada)',
  }
};

export const spacing = {
  // Standard spacing scale
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '2.5rem', // 40px
  '3xl': '3rem',   // 48px
  '4xl': '4rem',   // 64px
  
  // Component specific
  cardPadding: '1.5rem',    // 24px
  sectionPadding: '4rem',   // 64px
  buttonPadding: '0.75rem 1.5rem', // 12px 24px
};

export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  full: '9999px',
  
  // Component specific
  card: '20px',
  button: '12px',
  input: '8px',
};

export const shadows = {
  // Neumorphic shadows
  neumorphic: {
    outset: '6px 6px 12px #bebebe, -6px -6px 12px #ffffff',
    outsetHover: '8px 8px 16px #bebebe, -8px -8px 16px #ffffff',
    inset: 'inset 6px 6px 12px #bebebe, inset -6px -6px 12px #ffffff',
    insetPressed: 'inset 3px 3px 6px #bebebe, inset -3px -3px 6px #ffffff',
  },
  
  // Standard shadows
  standard: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  }
};

export const typography = {
  // Font families
  fontFamily: {
    primary: "'Inter', sans-serif",
    mono: "'Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace",
  },
  
  // Font sizes
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
  },
  
  // Font weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  // Line heights
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  }
};

export const transitions = {
  // Duration
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  
  // Easing
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // Common transitions
  all: 'all 200ms ease-in-out',
  transform: 'transform 200ms ease-in-out',
  opacity: 'opacity 200ms ease-in-out',
  colors: 'background-color 200ms ease-in-out, color 200ms ease-in-out',
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const zIndex = {
  hide: '-1',
  auto: 'auto',
  base: '0',
  docked: '10',
  dropdown: '1000',
  sticky: '1100',
  banner: '1200',
  overlay: '1300',
  modal: '1400',
  popover: '1500',
  skipLink: '1600',
  toast: '1700',
  tooltip: '1800',
};

// Component-specific token combinations
export const components = {
  card: {
    padding: spacing.cardPadding,
    borderRadius: borderRadius.card,
    shadow: shadows.neumorphic.outset,
    hoverShadow: shadows.neumorphic.outsetHover,
    background: colors.neutral.bg,
  },
  
  button: {
    primary: {
      background: colors.primary.yellow,
      color: colors.neutral.text,
      padding: spacing.buttonPadding,
      borderRadius: borderRadius.button,
      shadow: shadows.neumorphic.outset,
      hoverShadow: shadows.neumorphic.outsetHover,
      transition: transitions.all,
    },
    
    secondary: {
      background: colors.neutral.bg,
      color: colors.neutral.text,
      padding: spacing.buttonPadding,
      borderRadius: borderRadius.button,
      shadow: shadows.neumorphic.outset,
      hoverShadow: shadows.neumorphic.outsetHover,
      transition: transitions.all,
    }
  },
  
  input: {
    background: colors.neutral.bg,
    borderRadius: borderRadius.input,
    shadow: shadows.neumorphic.inset,
    padding: `${spacing.sm} ${spacing.md}`,
    color: colors.neutral.text,
    transition: transitions.all,
  }
};

export default {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
  transitions,
  breakpoints,
  zIndex,
  components,
};