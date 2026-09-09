/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    text: '#17241f',
    tint: '#16796a',
    background: '#f6f8f5',
    foreground: '#17241f',
    card: '#ffffff',
    cardForeground: '#17241f',
    primary: '#16796a',
    primaryForeground: '#f8f4e9',
    secondary: '#e8f0ea',
    secondaryForeground: '#1f5147',
    muted: '#edf2ed',
    mutedForeground: '#6b7d75',
    accent: '#e9d9ad',
    accentForeground: '#59491d',
    destructive: '#ba5b51',
    destructiveForeground: '#ffffff',
    border: '#dce6df',
    input: '#dce6df',
    ink: '#17241f',
    hero: '#113f38',
    heroMuted: '#a7c4b6',
    gold: '#d6b56a',
    cream: '#f8f4e9',
    softGold: '#f4edda',
    softTeal: '#dcece4',
    shadow: '#092d28',
  },
  dark: {
    text: '#edf4ef',
    tint: '#7bc5a8',
    background: '#0c1916',
    foreground: '#edf4ef',
    card: '#142722',
    cardForeground: '#edf4ef',
    primary: '#7bc5a8',
    primaryForeground: '#0c1916',
    secondary: '#1d3830',
    secondaryForeground: '#cde9da',
    muted: '#1a3029',
    mutedForeground: '#96ada3',
    accent: '#5c4b28',
    accentForeground: '#f3dfaa',
    destructive: '#d77b70',
    destructiveForeground: '#20100e',
    border: '#29453a',
    input: '#29453a',
    ink: '#edf4ef',
    hero: '#0a2924',
    heroMuted: '#9fc4b1',
    gold: '#dfc17a',
    cream: '#f8f4e9',
    softGold: '#3a321e',
    softTeal: '#193a31',
    shadow: '#000000',
  },
  radius: 22,
};

export default colors;
