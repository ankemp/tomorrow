const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const gitHash = execSync('git rev-parse HEAD').toString().trim();
const filePath = path.join(
  __dirname,
  '../apps/tomorrow/src/environments/version.prod.ts',
);
const content = `export const version = '${gitHash}';\n`;

fs.writeFileSync(filePath, content);
console.log(`Updated version.prod.ts with git hash: ${gitHash}`);
