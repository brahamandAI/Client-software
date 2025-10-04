const fs = require('fs');
const path = require('path');

function analyzePerformance() {
  console.log('🚀 Performance Analysis Report\n');
  
  // Count files
  const countFiles = (dir, extensions) => {
    let count = 0;
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        count += countFiles(filePath, extensions);
      } else if (extensions.some(ext => file.endsWith(ext))) {
        count++;
      }
    });
    
    return count;
  };
  
  // Analyze project structure
  const tsxFiles = countFiles('app', ['.tsx']);
  const tsFiles = countFiles('app', ['.ts']);
  const totalFiles = tsxFiles + tsFiles;
  
  console.log('📊 File Count Analysis:');
  console.log(`   TSX Files: ${tsxFiles}`);
  console.log(`   TS Files: ${tsFiles}`);
  console.log(`   Total: ${totalFiles}\n`);
  
  // Check for large files
  const findLargeFiles = (dir, extensions) => {
    const largeFiles = [];
    
    const checkDir = (currentDir) => {
      const files = fs.readdirSync(currentDir);
      
      files.forEach(file => {
        const filePath = path.join(currentDir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          checkDir(filePath);
        } else if (extensions.some(ext => file.endsWith(ext))) {
          const size = stat.size;
          if (size > 10000) { // Files larger than 10KB
            largeFiles.push({
              path: filePath,
              size: size,
              sizeKB: Math.round(size / 1024)
            });
          }
        }
      });
    };
    
    checkDir(dir);
    return largeFiles;
  };
  
  const largeFiles = findLargeFiles('app', ['.tsx', '.ts']);
  
  console.log('📁 Large Files (>10KB):');
  if (largeFiles.length === 0) {
    console.log('   ✅ No large files found');
  } else {
    largeFiles.forEach(file => {
      console.log(`   ⚠️  ${file.path} (${file.sizeKB}KB)`);
    });
  }
  
  console.log('\n🔧 Performance Recommendations:');
  console.log('   1. Use dynamic imports for heavy components');
  console.log('   2. Implement code splitting');
  console.log('   3. Optimize images with Next.js Image component');
  console.log('   4. Use React.memo for expensive components');
  console.log('   5. Implement lazy loading for charts and heavy libraries');
  console.log('   6. Consider reducing the number of pages');
  console.log('   7. Use SWR or React Query for data fetching optimization');
  
  console.log('\n⚡ Quick Wins:');
  console.log('   - Enable SWC minification (already added)');
  console.log('   - Remove console.log in production (already added)');
  console.log('   - Use dynamic imports for charts (already added)');
  console.log('   - Optimize TypeScript target (already updated)');
}

analyzePerformance();
