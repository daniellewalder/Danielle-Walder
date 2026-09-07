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
        /*
         * The type scale, deliberately quieter than it was.
         *
         * Size is not the primary way this site builds hierarchy — whitespace,
         * rules, column width, image scale and font choice do most of that
         * work. When every module reaches for statement scale nothing reads as
         * the statement, and the page starts to look like a template trying to
         * buy importance by the pixel.
         *
         * Mass is not the same as size across these faces: Unbounded at 36px
         * carries more weight than Rozha One at 40px, so the roles below are
         * calibrated per face at the call site rather than shared blindly.
         *
         * hero    — the one earned statement per page. Homepage only.
         * section — page titles (PageHeader).            was 54 / 44 / 34
         * sub     — section headings within a page.      was 40 / 34 / 28
         */
        hero: ['52px', { lineHeight: '0.96' }],
        'hero-tablet': ['44px', { lineHeight: '0.96' }],
        'hero-mobile': ['36px', { lineHeight: '0.98' }],
        section: ['40px', { lineHeight: '1.04' }],
        'section-tablet': ['34px', { lineHeight: '1.04' }],
        'section-mobile': ['28px', { lineHeight: '1.06' }],
        sub: ['30px', { lineHeight: '1.08' }],
        'sub-tablet': ['26px', { lineHeight: '1.08' }],
        'sub-mobile': ['24px', { lineHeight: '1.1' }],
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
        // The nav row stops fitting on one line below ~1120px — the wordmark
        // carries "real estate" and the links sit at 16px. It collapses to the
        // mark plus the hamburger there rather than wrapping into a ragged
        // second row. Raise this if the nav ever gets shorter again.
        navstack: { max: '1120px' },
        // Between the collapse point and a wide desktop the full seven-item
        // row needs tighter spacing and slightly smaller type to survive.
        navtight: { max: '1400px' },
      },
    },
  },
  plugins: [],
}

export default config
