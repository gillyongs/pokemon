const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/test/**/*.js');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace status: { ... } with ailment: { ... } in mock objects
  content = content.replace(/status:\s*\{/g, 'ailment: {');

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
  }
}
