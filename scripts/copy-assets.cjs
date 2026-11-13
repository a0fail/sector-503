const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
for (const entry of fs.readdirSync(path.join(root, 'public'))) {
  if (entry === 'index.html' || entry.startsWith('.')) continue;
  fs.cpSync(path.join(root, 'public', entry), path.join(root, 'dist', entry), {
    recursive: true,
    filter: (source) => !path.basename(source).startsWith('.'),
  });
}
console.log('Static assets copied to dist');
