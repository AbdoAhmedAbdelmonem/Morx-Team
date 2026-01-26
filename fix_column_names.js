const fs = require('fs');
const path = require('path');

const changes = [];

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walk(filePath, callback);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      callback(filePath);
    }
  });
}

// Fix API routes - the database column is first_name not username
walk('app/api', (file) => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  // In .select() queries, replace username with first_name
  // Pattern: .select('...username...')
  newContent = newContent.replace(/\.select\(['"](.*?)username(.*?)['"]\)/g, (match, p1, p2) => {
    return `.select('${p1}first_name${p2}')`;
  });
  
  // Fix property access - c.username -> c.first_name
  newContent = newContent.replace(/([a-z_]+)\.username/g, '$1.first_name');
  
  // Fix destructuring - { username } -> { first_name }
  // But be careful not to break things
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    changes.push(file);
    console.log('Fixed:', file);
  }
});

console.log(`\nTotal API files fixed: ${changes.length}`);
