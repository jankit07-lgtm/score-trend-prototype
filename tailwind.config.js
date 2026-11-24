export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Roboto', 'system-ui', 'sans-serif'] },
      colors: {
        s: {
          bg: '#FFFFFF', card: '#F2F2F2', border: '#E0E0E0', chip: '#E6E6E6', nav: '#F2F2F2',
          text: '#202020', muted: '#7F7F7F', dim: '#A8A8A8',
          brand: '#139756', brandDark: '#004724', brandSoft: '#D6EDE0', brandDisabled: '#99CEB4',
          loss: '#E5484D', lossSoft: '#FBE3E4', ma: '#2F72D6',
          fqs: '#2F72D6', tms: '#8C4BCD', dves: '#C77700',
          highlight: '#FFD12E', ultra: '#5B3FD6', ultraSoft: '#ECE8FC',
        },
      },
    },
  },
};
