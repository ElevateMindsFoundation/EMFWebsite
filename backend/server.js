// Production entry point for deploy platforms that look for a top-level
// server.js instead of honoring the npm "start" script.
//
// The TypeScript API compiles to dist/index.js (see package.json "build" and
// "start"). This thin bridge boots the compiled app so `node server.js`
// behaves exactly like `npm start` (node dist/index.js). `require` resolves
// relative to THIS file, so it works regardless of the launch directory.
//
// dist/index.js must exist first — run `npm run build` (the deploy build step)
// before starting.
require('./dist/index.js');
