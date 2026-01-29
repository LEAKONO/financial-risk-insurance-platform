console.log("=== Verifying Route Imports ===");

const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'src/routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));

let allGood = true;

files.forEach(file => {
  const content = fs.readFileSync(path.join(routesDir, file), 'utf8');
  
  if (content.includes('validation.middleware')) {
    console.log(`\n${file}:`);
    
    // Check import style
    if (content.includes("const validate = require") && !content.includes("const { validate } = require")) {
      console.log("  ❌ Old import style detected");
      allGood = false;
    } else if (content.includes("const { validate } = require") || content.includes("const { safeValidate } = require")) {
      console.log("  ✅ Correct import style");
    }
    
    // Check for syntax errors
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('validation.middleware') && line.includes(';const')) {
        console.log(`  ⚠️  Line ${index + 1}: Possible missing newline: ${line.substring(0, 50)}...`);
      }
    });
  }
});

if (allGood) {
  console.log("\n✅ All route imports look good!");
  process.exit(0);
} else {
  console.log("\n❌ Some imports need fixing");
  process.exit(1);
}
