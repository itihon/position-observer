import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import copy from 'rollup-plugin-copy'

const env = process.env.BUILD;

const importResplace = 
  env === 'deploy' 
    ? { 
      'import PositionObserver from \'../../lib/index.js\';': 
        'import PositionObserver from \'@itihon/position-observer\';',
      'import PositionObserver from \'../../lib/debug.js\';':
        'import PositionObserver from \'@itihon/position-observer/debug\';',
    } 
    : undefined;

const replaceLocalImport = (contents/*, fileName*/) => 
  env === 'deploy' 
  ? contents.toString().replace(...Object.entries(importResplace)[0])
  : contents;

const rename = (name, extension/*, fullPath*/) => `example.${name}.${extension}`;

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
        { 
          src: 'demo/src/input-position-observer.js', 
          dest: 'demo/bundle/',
          transform: replaceLocalImport,
          rename,
        },
      ],
    }),
  ],
};