// Copies the built frontend (frontend/dist) into backend/public so the Express
// server can serve the SPA from inside its own deployed tree. Run as part of
// `npm run build` after the frontend has been built. No-op-safe: if the
// frontend build is missing it exits with a clear error so the deploy fails
// loudly rather than shipping an API with no site.
const fs = require('node:fs');
const path = require('node:path');

const src = path.resolve(__dirname, '..', '..', 'frontend', 'dist');
const dest = path.resolve(__dirname, '..', 'public');

if (!fs.existsSync(src)) {
  console.error(
    `[copy-frontend] Frontend build not found at ${src}.\n` +
      `Build the frontend first (this repo's backend "build" script does this).`,
  );
  process.exit(1);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });
console.log(`[copy-frontend] Copied ${src} -> ${dest}`);
