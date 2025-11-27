const fs = require('fs');

try {
  console.log('📋 Copying static files...');
  
  fs.copyFileSync('netlify.toml', 'static-pages/netlify.toml');
  console.log('✅ netlify.toml copied');
  
  fs.copyFileSync('public/contact.html', 'static-pages/contact.html');
  console.log('✅ contact.html copied');
  
  console.log('🎉 All files copied successfully!');
} catch (error) {
  console.error('❌ Error copying files:', error.message);
  process.exit(1);
}