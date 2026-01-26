const fs = require('fs');
const path = require('path');

let fixed = 0;

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

// Fix = ; to = {}
walk('app', (file) => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  // Pattern: Record<...> =; -> Record<...> = {}
  newContent = newContent.replace(/Record<[^>]+>\s*=\s*;/g, (match) => {
    return match.replace('=;', '= {};').replace('= ;', '= {};');
  });
  
  // Pattern: : any =; -> : any = {}
  newContent = newContent.replace(/:\s*any\s*=\s*;/g, ': any = {};');
  
  // Pattern: lastName =; -> lastName = ''
  newContent = newContent.replace(/lastName\s*=\s*;/g, "lastName = '';");
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log('Fixed:', file);
    fixed++;
  }
});

console.log(`\nTotal files fixed: ${fixed}`);
