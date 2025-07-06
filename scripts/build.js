const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Building SDK...');

// 清理dist目录
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}

try {
  // 编译TypeScript
  console.log('📦 Compiling TypeScript...');
  execSync('npx tsc', { stdio: 'inherit' });
  
  // 复制package.json到dist目录
  console.log('📋 Copying package.json...');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // 创建发布用的package.json
  const distPackageJson = {
    ...packageJson,
    main: 'index.js',
    types: 'index.d.ts',
    scripts: undefined,
    devDependencies: undefined,
  };
  
  fs.writeFileSync('dist/package.json', JSON.stringify(distPackageJson, null, 2));
  
  // 复制README.md
  console.log('📄 Copying README.md...');
  fs.copyFileSync('README.md', 'dist/README.md');
  
  console.log('✅ Build completed successfully!');
  console.log('📁 Files generated in ./dist directory');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
