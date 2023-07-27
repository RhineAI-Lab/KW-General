import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  status: {
    danger: '#e53e3e',
  },
  palette: {
    primary: {
      main: '#f5692c',
      darker: '#f5692c',
    },
    neutral: {
      main: '#64748B',
      contrastText: '#fff',
    },
  },
});

// #A5FF3D 点缀

declare module '@mui/material/styles' {
  interface Theme {
    status: {
      danger: React.CSSProperties['color'];
    };
  }
  
  interface Palette {
    neutral: Palette['primary'];
  }
  
  interface PaletteOptions {
    neutral: PaletteOptions['primary'];
  }
  
  interface PaletteColor {
    darker?: string;
  }
  
  interface SimplePaletteColorOptions {
    darker?: string;
  }
  
  interface ThemeOptions {
    status: {
      danger: React.CSSProperties['color'];
    };
  }
}
