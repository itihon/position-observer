import replace from '@rollup/plugin-replace';
import css from "rollup-plugin-import-css";

export default {
  plugins: [
    css(),
    replace({ 
      values: { '#': '__' }, // to make class private fields available for mocking
      preventAssignment: true,
      delimiters: ['', ''],
      include: ['lib/index.js'],
      exclude: ['*.css'],
    }), 
  ],
};