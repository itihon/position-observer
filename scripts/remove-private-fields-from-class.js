#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'fs';

const [,, srcPath, dstPath] = process.argv;

if (!(srcPath && dstPath)) {
  console.error('Usage: command src/path dst/path');
  process.exit(1);
}

if (existsSync(srcPath)) {
  const code = readFileSync(srcPath).toString("utf-8");

  try {
    writeFileSync(dstPath, code.replaceAll('#', '__'));
  }
  catch (e) {
    console.error(e);
    process.exit(1);
  }
}
else {
  console.error(`The file "${srcPath}" does not exist.`);
  process.exit(1);
}


