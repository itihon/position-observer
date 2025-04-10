import { nodeResolve } from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy'

const env = process.env.BUILD;

const importReplace = 
  env === 'deploy' 
    ? { 
      'import PositionObserver from \'../../dist/esm/index.js\';': 
        'import PositionObserver from \'@itihon/position-observer\';',
      'import PositionObserver from \'../../dist/debug/esm/index.js\';':
        'import PositionObserver from \'@itihon/position-observer/debug\';',
    } 
    : undefined;

const replaceLocalImport = (contents/*, fileName*/) => 
  env === 'deploy' 
  ? contents.toString().replace(...Object.entries(importReplace)[0])
  : contents;

const rename = (name, extension/*, fullPath*/) => `example.${name}.${extension}`;

export default {
  plugins: [
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