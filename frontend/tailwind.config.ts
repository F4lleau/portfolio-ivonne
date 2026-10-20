export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: Object.fromEntries(
        ['background', 'foreground', 'card', 'primary', 'accent', 'muted', 'border', 'ring'].map(
          (x) => [x, `hsl(var(--${x}) / <alpha-value>)`],
        ),
      ),
      fontFamily: {
        display: ['Inter', 'Arial', 'sans-serif'],
        sans: ['Inter', 'Arial', 'sans-serif'],
        mono: ['Consolas', 'monospace'],
      },
      boxShadow: { elegant: 'var(--shadow-elegant)', glow: 'var(--shadow-glow)' },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-subtle': 'var(--gradient-subtle)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        float: { '50%': { transform: 'translateY(-6px)' } },
      },
      animation: { 'fade-up': 'fade-up .5s ease both', float: 'float 6s ease-in-out infinite' },
    },
  },
  plugins: [],
};
