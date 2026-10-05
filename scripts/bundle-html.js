import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const htmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(htmlPath)) {
  console.error('dist/index.html not found. Run vite build first.');
  process.exit(1);
}

let html = fs.readFileSync(htmlPath, 'utf8');

// Find CSS files in dist/assets
const cssMatches = html.match(/<link rel="stylesheet"[^>]+href="(\.?\/?assets\/[^"]+\.css)"[^>]*>/g);
if (cssMatches) {
  for (const match of cssMatches) {
    const hrefMatch = match.match(/href="\.?\/?assets\/([^"]+\.css)"/);
    if (hrefMatch) {
      const cssFileName = hrefMatch[1];
      const cssFilePath = path.join(distDir, 'assets', cssFileName);
      if (fs.existsSync(cssFilePath)) {
        const cssContent = fs.readFileSync(cssFilePath, 'utf8');
        html = html.replace(match, `<style>\n${cssContent}\n</style>`);
        console.log(`Inlined CSS: ${cssFileName}`);
      }
    }
  }
}

// Find JS module scripts in dist/assets
const jsMatches = html.match(/<script type="module"[^>]+src="(\.?\/?assets\/[^"]+\.js)"[^>]*><\/script>/g);
if (jsMatches) {
  for (const match of jsMatches) {
    const srcMatch = match.match(/src="\.?\/?assets\/([^"]+\.js)"/);
    if (srcMatch) {
      const jsFileName = srcMatch[1];
      const jsFilePath = path.join(distDir, 'assets', jsFileName);
      if (fs.existsSync(jsFilePath)) {
        const jsContent = fs.readFileSync(jsFilePath, 'utf8');
        // Replace </script> inside JS content to avoid breaking HTML parser
        const safeJs = jsContent.replace(/<\/script>/gi, '<\\/script>');
        html = html.replace(match, `<script type="module">\n${safeJs}\n</script>`);
        console.log(`Inlined JS: ${jsFileName}`);
      }
    }
  }
}

// Save standalone HTML
const standalonePath = path.resolve('code-werkstatt-standalone.html');
fs.writeFileSync(standalonePath, html, 'utf8');
console.log(`Created standalone HTML: ${standalonePath} (${(fs.statSync(standalonePath).size / 1024).toFixed(1)} KB)`);

// Copy manager.html
fs.copyFileSync(htmlPath, path.join(distDir, 'manager.html'));

// Ensure clean SPA routing and headers for Cloudflare Pages and standard static hosts
fs.writeFileSync(path.join(distDir, '_redirects'), '/*    /index.html   200\n', 'utf8');
if (fs.existsSync('public/_headers')) {
  fs.copyFileSync('public/_headers', path.join(distDir, '_headers'));
}
console.log('Created _redirects, _headers, and manager.html.');
