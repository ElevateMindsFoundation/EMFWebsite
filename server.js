// Entry point for deployment environments configured to run server.js from repository root
const fs = require('fs');
const path = require('path');

if (fs.existsSync(path.join(__dirname, 'backend', 'dist', 'index.js'))) {
  require('./backend/dist/index.js');
} else if (fs.existsSync(path.join(__dirname, 'dist', 'index.js'))) {
  require('./dist/index.js');
} else {
  console.error('Could not locate compiled dist/index.js. Ensure build script has completed.');
  process.exit(1);
}
