const fs = require('fs');
const path = require('path');

// Track all changes
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

// Fix broken patterns
walk('app', (file) => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  // Fix broken optional chaining patterns from code
  // Pattern: {?.substring(0, 1)} -> remove
  newContent = newContent.replace(/\{\?\.substring\(0,\s*1\)\}/g, '');
  
  // Pattern: {?.[0]} -> remove
  newContent = newContent.replace(/\{\?\.\[0\]\}/g, '');
  
  // Pattern: {[0]} (bare) -> remove
  newContent = newContent.replace(/\{\[0\]\}/g, '');
  
  // Pattern: {} (empty curly braces in JSX) -> remove
  newContent = newContent.replace(/\s*\{\}/g, '');
  
  // Pattern: username:, (with colon and comma, invalid) -> username,
  newContent = newContent.replace(/username:\s*,/g, 'username,');
  newContent = newContent.replace(/username:\s*:/g, 'username:');
  
  // Pattern: ! || (missing variable) -> remove empty check
  newContent = newContent.replace(/!\s*\|\|/g, '||');
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    changes.push(file);
    console.log('Fixed:', file);
  }
});

// Also fix components
walk('components', (file) => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  newContent = newContent.replace(/\{\?\.substring\(0,\s*1\)\}/g, '');
  newContent = newContent.replace(/\{\?\.\[0\]\}/g, '');
  newContent = newContent.replace(/\{\[0\]\}/g, '');
  newContent = newContent.replace(/\s*\{\}/g, '');
  newContent = newContent.replace(/username:\s*,/g, 'username,');
  newContent = newContent.replace(/!\s*\|\|/g, '||');
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    changes.push(file);
    console.log('Fixed:', file);
  }
});

console.log(`\nTotal files fixed: ${changes.length}`);
