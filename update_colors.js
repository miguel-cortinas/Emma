const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// Function to walk through directory
function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

const themeAddition = 
  --color-dusty-50: #F7F3F0;
  --color-dusty-100: #F5EDE8;
  --color-dusty-200: #F0EAE0;
  --color-dusty-300: #EDD5C8;
  --color-dusty-400: #E8B4B8;
  --color-dusty-500: #D4A4AC;
  --color-dusty-600: #C4848A;
  --color-dusty-700: #B5767C;
  --color-dusty-800: #C9A89B;
  --color-dusty-900: #8B6A72;
  --color-gold: #D4AF7A;
  --color-peach: #C9947A;
;

walk(srcDir, (filePath) => {
  if (filePath.endsWith('.css')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add theme variables if not present
    if (!content.includes('--color-dusty-50')) {
      content = content.replace(/@theme \{/, '@theme {' + themeAddition);
    }
    
    // Update index.css roots
    content = content.replace(/--color-background: [^;]+;/, '--color-background: var(--color-dusty-900);');
    content = content.replace(/--color-foreground: [^;]+;/, '--color-foreground: var(--color-dusty-50);');
    content = content.replace(/background: rgba\(251, 207, 232, 0\.06\);/, 'background: rgba(232, 180, 184, 0.1);');
    
    fs.writeFileSync(filePath, content);
  } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace pink utilities with dusty utilities
    content = content.replace(/pink-50(?=\/|\\b|\s|")/g, 'dusty-50');
    content = content.replace(/pink-100(?=\/|\\b|\s|")/g, 'dusty-100');
    content = content.replace(/pink-200(?=\/|\\b|\s|")/g, 'dusty-200');
    content = content.replace(/pink-300(?=\/|\\b|\s|")/g, 'dusty-400');
    content = content.replace(/pink-400(?=\/|\\b|\s|")/g, 'dusty-500');
    content = content.replace(/pink-500(?=\/|\\b|\s|")/g, 'dusty-600');
    content = content.replace(/pink-900(?=\/|\\b|\s|")/g, 'dusty-700');
    content = content.replace(/pink-950(?=\/|\\b|\s|")/g, 'dusty-900');
    
    // Replace specific strings
    content = content.replace(/text-white/g, 'text-dusty-50');
    content = content.replace(/bg-\[#1a0510\]/g, 'bg-dusty-900');
    content = content.replace(/bg-\[#4a152e\]/g, 'bg-dusty-800');
    
    // Replace hardcoded RGBA strings
    content = content.replace(/rgba\(251,207,232,/g, 'rgba(232,180,184,'); // rgb of E8B4B8
    content = content.replace(/rgba\(25,5,15,/g, 'rgba(139,106,114,'); // rgb of 8B6A72
    
    // Replace IntroSplash specific colors
    content = content.replace(/rgba\(45, 10, 25,/g, 'rgba(181, 118, 124,'); // B5767C
    content = content.replace(/rgba\(25, 5, 15,/g, 'rgba(139, 106, 114,'); // 8B6A72
    
    // Replace App.tsx specific shadow that might have different spacing
    content = content.replace(/rgba\(251, 207, 232,/g, 'rgba(232, 180, 184,');
    
    fs.writeFileSync(filePath, content);
  }
});

console.log("Colors updated successfully.");
