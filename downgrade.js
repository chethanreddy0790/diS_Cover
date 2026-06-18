const { execSync } = require('child_process');

console.log('Downgrading Firebase...');
try {
  execSync('npm install firebase@10.13.2 --save', { stdio: 'inherit' });
  console.log('Firebase downgraded successfully!');
} catch (e) {
  console.error('Failed to downgrade Firebase:', e);
}
