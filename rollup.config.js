import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import copy from 'rollup-plugin-copy'

const importResplace = 
  process.env.BUILD === 'deploy' 
    ? { 
      'import PositionObserver from \'../../lib/index.js\';': 
        'import PositionObserver from \'@itihon/position-observer\';'
    } 
    : undefined;

export default {
  plugins: [
    replace({ 
      values: { '#': '__', ...importResplace }, 
      preventAssignment: true,
      delimiters: ['', ''],
    }), 
    nodeResolve(), 
    copy({
      targets: [
        { src: 'demo/input-position-observer.js', dest: 'demo/assets/' },
      ],
    }),
  ],
};