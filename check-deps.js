const { execSync } = require('child_process');
const fs = require('fs');

try {
  const output = execSync('npm ls @firebase/app @firebase/auth @firebase/component', { encoding: 'utf-8' });
  fs.writeFileSync('npm-ls-output.txt', output);
  console.log('Saved to npm-ls-output.txt');
} catch (e) {
  fs.writeFileSync('npm-ls-output.txt', e.stdout || e.message);
}
