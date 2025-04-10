import replace from '@rollup/plugin-replace';
import css from "rollup-plugin-import-css";

export default {
  plugins: [
    css(),
    replace({ 
      values: { '#': '__' }, 
      preventAssignment: true,
      delimiters: ['', ''],
    }), 
  ],
};