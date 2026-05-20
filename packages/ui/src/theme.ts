// Mission Control Cinematic Theme Tokens

export const theme = {
  colors: {
    // Core Backgrounds
    background: '#050A10', // Deep Space / Dark HSL(220, 50%, 4%)
    card: '#0A141E', // Glassy Dark HSL(220, 50%, 8%)
    popover: '#0A141E',
    
    // Accents & Actions
    primary: '#00FF41', // Bioluminescent Neon Green
    primaryForeground: '#002E0A',
    
    secondary: '#172233', // Subtle Dark Blueish
    secondaryForeground: '#E6EBF5',
    
    accent: '#00AAFF', // Neon Blue
    accentForeground: '#001A29',
    
    muted: '#172233',
    mutedForeground: '#99A6B8',
    
    destructive: '#FF3333',
    destructiveForeground: '#FFF5F5',
    
    border: '#1A2433',
    input: '#1A2433',
    ring: '#00FF41',
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  effects: {
    glassmorphism: {
      backgroundColor: 'rgba(10, 20, 30, 0.6)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    glow: {
      primary: '0 0 15px rgba(0, 255, 65, 0.5)',
      accent: '0 0 15px rgba(0, 170, 255, 0.5)',
    }
  }
};
