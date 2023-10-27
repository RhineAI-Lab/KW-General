import { createTheme } from '@mui/material/styles';


export const material2Theme = createTheme({
  status: {
    danger: '#e53e3e',
  },
  palette: {
    primary: {
      main: '#f5692c',
      darker: '#f5692c',
    },
    black: {
      main: '#000000',
      darker: '#000000',
      contrastText: '#ffffff',
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
    black: Palette['primary'];
  }

  interface PaletteOptions {
    neutral: PaletteOptions['primary'];
    black: PaletteOptions['primary'];
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

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    black: true;
  }
}
