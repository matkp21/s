import { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      borderColor: {
        border: '#e5e7eb', // Define the 'border-border' class color
      },
    },
  },
  plugins: [],
};

export default config;