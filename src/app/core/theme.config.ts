import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';









export const AppTheme = definePreset(Aura, {
  primitive: {
    borderRadius: {
      none: '0',
      xs: '2px',
      sm: '4px',
      md: '6px',
      lg: '8px',
      xl: '12px',
    },
  },

  semantic: {
    primary: {
      50:  '{indigo.50}',
      100: '{indigo.100}',
      200: '{indigo.200}',
      300: '{indigo.300}',
      400: '{indigo.400}',
      500: '{indigo.500}',
      600: '{indigo.600}',
      700: '{indigo.700}',
      800: '{indigo.800}',
      900: '{indigo.900}',
      950: '{indigo.950}',
    },
    colorScheme: {
      light: {
        primary: {
          color:         '{primary.600}',
          contrastColor: '#ffffff',
          hoverColor:    '{primary.700}',
          activeColor:   '{primary.800}',
        },
        highlight: {
          background:   '{primary.50}',
          focusBackground: '{primary.100}',
          color:        '{primary.700}',
          focusColor:   '{primary.800}',
        },
        surface: {
          0:   '#ffffff',
          50:  '{slate.50}',
          100: '{slate.100}',
          200: '{slate.200}',
          300: '{slate.300}',
          400: '{slate.400}',
          500: '{slate.500}',
          600: '{slate.600}',
          700: '{slate.700}',
          800: '{slate.800}',
          900: '{slate.900}',
          950: '{slate.950}',
        },
      },
      dark: {
        primary: {
          color:         '{primary.400}',
          contrastColor: '{surface.900}',
          hoverColor:    '{primary.300}',
          activeColor:   '{primary.200}',
        },
        highlight: {
          background:   'color-mix(in srgb, {primary.400}, transparent 84%)',
          focusBackground: 'color-mix(in srgb, {primary.400}, transparent 76%)',
          color:        'rgba(255,255,255,.87)',
          focusColor:   'rgba(255,255,255,.87)',
        },
        surface: {
          0:   '#ffffff',
          50:  '{zinc.50}',
          100: '{zinc.100}',
          200: '{zinc.200}',
          300: '{zinc.300}',
          400: '{zinc.400}',
          500: '{zinc.500}',
          600: '{zinc.600}',
          700: '{zinc.700}',
          800: '{zinc.800}',
          900: '{zinc.900}',
          950: '{zinc.950}',
        },
      },
    },
  },
});


export const primeNGConfig = {
  theme: {
    preset: AppTheme,
    options: {

      darkModeSelector: '.app-dark',
      cssLayer: {
        name: 'primeng',
        order: 'primeng, app-styles',
      },
    },
  },
  ripple: true,
};
