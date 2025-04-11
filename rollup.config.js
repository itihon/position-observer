import { nodeResolve } from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy'

const rename = (name, extension/*, fullPath*/) => `example.${name}.${extension}`;

export default {
  plugins: [
    nodeResolve(), 
    copy({
      targets: [
        { 
          src: 'demo/src/input-position-observer.js', 
          dest: 'demo/bundle/',
          rename,
        },
      ],
    }),
  ],
};