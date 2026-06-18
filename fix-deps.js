const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const nodeModulesPath = path.join(__dirname, 'node_modules');
const lockFilePath = path.join(__dirname, 'package-lock.json');

console.log('Deleting node_modules...');
if (fs.existsSync(nodeModulesPath)) {
  fs.rmSync(nodeModulesPath, { recursive: true, force: true });
}

console.log('Deleting package-lock.json...');
if (fs.existsSync(lockFilePath)) {
  fs.unlinkSync(lockFilePath);
}

console.log('Running npm install...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('Dependencies installed successfully!');
} catch (e) {
  console.error('Failed to run npm install:', e);
}
