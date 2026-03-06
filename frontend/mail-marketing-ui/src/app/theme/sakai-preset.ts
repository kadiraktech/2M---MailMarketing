import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const SakaiPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#f4f7ff',
      100: '#e7efff',
      200: '#c8d8ff',
      300: '#a8c1ff',
      400: '#7f9dff',
      500: '#5c7cfa',
      600: '#4c69d8',
      700: '#3f58b7',
      800: '#344795',
      900: '#2b3a7a',
      950: '#1c2551'
    }
  }
});
