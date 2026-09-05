import type { Config } from 'tailwindcss'

/**
 * The design system is locked. Every value below comes from
 * `design_handoff/tokens.css`. Do not add, remove, or adjust a value here —
 * if something seems to need a new one, it needs a different composition of
 * the existing ones instead. See CLAUDE.md.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brown · structure
        cream: '#F4F1E2',
        paper: '#FBF9F0',
        sand: '#E3DBCB',
        hairline: '#DCD4C2',
        taupe: '#897D6D',
        warmgray: '#6B5F55',
        brown: '#513229',
        espresso: '#3B2620',
        // Blue · hero, search, tools
        blue: {
          mist: '#EAF4FC',
          field: '#D8EBF9',
          steel: '#A8C4DA',
          deep: '#3A5B75',
          ink: '#24425A',
        },
        // Butter · about, quizzes, flags
        butter: {
          pale: '#FDF2D8',
          field: '#FCE6B7',
          deep: '#F3D79C',
          rule: '#EBD3A2',
          bronze: '#96773A',
          text: '#6A4E12',
        },
        // Sage · editorial, neighborhoods
        sage: {
          pale: '#E4E6CE',
          field: '#D4D7B5',
          chip: '#CFD3AE',
          mid: '#A9AE7F',
          olive: '#6B6C38',
          deep: '#4A4B25',
        },
        // Inks · hints only, never a field
        wine: {
          DEFAULT: '#7A1F2E',
          pressed: '#5A1522',
        },
        pine: '#33452F',
        petrol: '#205A66',
        // On dark brown
        onbrown: {
          DEFAULT: '#F4F1E2',
          body: '#DACFC4',
          label: '#C4B9AC',
          fine: '#A8998C',
          rule: '#6A5347',
        },
      },
      fontFamily: {
        mark: ['var(--font-unbounded)', 'Unbounded', 'sans-serif'],
        display: ['var(--font-rozha)', 'Rozha One', 'serif'],
        serif: ['var(--font-kalnia)', 'Kalnia', 'serif'],
        sans: ['var(--font-figtree)', 'Figtree', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        display: '-0.055em',
        utility: '-0.045em',
        label: '0.18em',
        badge: '0.14em',
        kicker: '0.16em',
        attribution: '0.2em',
      },
      borderRadius: {
        photo: '2px',
        badge: '6px',
        input: '10px',
        button: '12px',
        field: '14px',
        block: '20px',
      },
      spacing: {
        gutter: '40px',
        'gutter-tablet': '32px',
        'gutter-mobile': '20px',
      },
      fontSize: {
        // Type scale from tokens.css — desktop values; the responsive steps
        // live alongside each use with the tablet/mobile variants.
        hero: ['66px', { lineHeight: '0.94' }],
        'hero-tablet': ['52px', { lineHeight: '0.94' }],
        'hero-mobile': ['40px', { lineHeight: '0.94' }],
        section: ['54px', { lineHeight: '1' }],
        'section-tablet': ['44px', { lineHeight: '1' }],
        'section-mobile': ['34px', { lineHeight: '1' }],
        sub: ['40px', { lineHeight: '1' }],
        'sub-tablet': ['34px', { lineHeight: '1' }],
        'sub-mobile': ['28px', { lineHeight: '1' }],
      },
      transitionDuration: {
        hover: '150ms',
        photo: '300ms',
      },
      maxWidth: {
        intro: '400px',
        about: '470px',
        standfirst: '460px',
        'quiz-intro': '380px',
        quote: '860px',
        search: '500px',
        measure: '68ch',
      },
      screens: {
        // The three approved breakpoints: desktop ≥1200px as specified,
        // tablet ≤1024px, mobile ≤640px. Both are max-width variants so the
        // desktop values in the spec are what a class states plainly.
        tablet: { max: '1024px' },
        mobile: { max: '640px' },
        // The nav row stops fitting on one line below ~900px, well before the
        // mobile breakpoint. It collapses to the mark plus the hamburger there
        // rather than wrapping into a ragged second row.
        navstack: { max: '900px' },
      },
    },
  },
  plugins: [],
}

export default config
