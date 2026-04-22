const fs = require('fs');
const path = require('path');

const srcDir = 'c:/My Projects/Railway/frontend/src';
const API_BASE_URL_IMPORT = "import API_BASE_URL from '../apiConfig';";
const API_BASE_URL_IMPORT_NESTED = "import API_BASE_URL from '../../apiConfig';"; // for components

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach( f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(srcDir, (filePath) => {
  if (!filePath.endsWith('.jsx') && !filePath.endsWith('.js')) return;
  if (filePath.endsWith('apiConfig.js')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('http://localhost:5000')) {
    console.log('Updating:', filePath);
    
    // Replace URL
    content = content.replace(/http:\/\/localhost:5000/g, '${API_BASE_URL}');
    
    // Add import if not present
    if (!content.includes('import API_BASE_URL')) {
      const isComponent = filePath.includes('components');
      const importLine = isComponent ? API_BASE_URL_IMPORT : API_BASE_URL_IMPORT; // Wait, my apiConfig is in src/
      
      // Calculate relative path to apiConfig.js
      const relativePath = path.relative(path.dirname(filePath), path.join(srcDir, 'apiConfig')).replace(/\\/g, '/');
      const dynamicImport = `import API_BASE_URL from '${relativePath.startsWith('.') ? relativePath : './' + relativePath}';`;
      
      content = dynamicImport + '\n' + content;
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
