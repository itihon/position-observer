import replace from '@rollup/plugin-replace';

export default {
  plugins: [
    replace({ 
      values: { '#': '__' }, 
      preventAssignment: true,
      delimiters: ['', ''],
    }), 
  ],
};