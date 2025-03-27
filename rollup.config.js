import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';

export default {
  plugins: [
    replace({ 
      values: { '#': '__' }, 
      preventAssignment: true,
      delimiters: ['', ''],
    }), 
    nodeResolve(), 
  ],
};