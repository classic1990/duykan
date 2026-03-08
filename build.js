#!/usr/bin/env node

// DUYDODEE Build Process
// สำหรับสร้างไฟล์ production จาก source code

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting DUYDODEE Build Process...');

// สร้างโฟลเดอร์ build
const buildDir = path.join(__dirname, 'public', 'build');
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
}

// คัดลอก CSS files
const cssSourceDir = path.join(__dirname, 'src', 'styles');
const cssTargetDir = path.join(buildDir, 'css');

if (!fs.existsSync(cssTargetDir)) {
    fs.mkdirSync(cssTargetDir, { recursive: true });
}

const cssFiles = ['main.css', 'admin.css', 'components.css'];
cssFiles.forEach(file => {
    const source = path.join(cssSourceDir, file);
    const target = path.join(cssTargetDir, file);
    
    if (fs.existsSync(source)) {
        fs.copyFileSync(source, target);
        console.log(`✅ Copied ${file}`);
    } else {
        console.log(`⚠️  ${file} not found`);
    }
});

// คัดลอก JS files
const jsSourceDir = path.join(__dirname, 'src', 'scripts');
const jsTargetDir = path.join(buildDir, 'js');

if (!fs.existsSync(jsTargetDir)) {
    fs.mkdirSync(jsTargetDir, { recursive: true });
}

const jsFiles = ['main.js', 'admin.js', 'utils.js'];
jsFiles.forEach(file => {
    const source = path.join(jsSourceDir, file);
    const target = path.join(jsTargetDir, file);
    
    if (fs.existsSync(source)) {
        fs.copyFileSync(source, target);
        console.log(`✅ Copied ${file}`);
    } else {
        console.log(`⚠️  ${file} not found`);
    }
});

// คัดลอก assets
const assetsSourceDir = path.join(__dirname, 'src', 'assets');
const assetsTargetDir = path.join(buildDir, 'assets');

if (fs.existsSync(assetsSourceDir)) {
    if (!fs.existsSync(assetsTargetDir)) {
        fs.mkdirSync(assetsTargetDir, { recursive: true });
    }
    
    // คัดลอก images
    const imagesSource = path.join(assetsSourceDir, 'images');
    const imagesTarget = path.join(assetsTargetDir, 'images');
    
    if (fs.existsSync(imagesSource)) {
        if (!fs.existsSync(imagesTarget)) {
            fs.mkdirSync(imagesTarget, { recursive: true });
        }
        
        const images = fs.readdirSync(imagesSource);
        images.forEach(image => {
            const source = path.join(imagesSource, image);
            const target = path.join(imagesTarget, image);
            fs.copyFileSync(source, target);
            console.log(`✅ Copied image: ${image}`);
        });
    }
    
    // คัดลอก fonts
    const fontsSource = path.join(assetsSourceDir, 'fonts');
    const fontsTarget = path.join(assetsTargetDir, 'fonts');
    
    if (fs.existsSync(fontsSource)) {
        if (!fs.existsSync(fontsTarget)) {
            fs.mkdirSync(fontsTarget, { recursive: true });
        }
        
        const fonts = fs.readdirSync(fontsSource);
        fonts.forEach(font => {
            const source = path.join(fontsSource, font);
            const target = path.join(fontsTarget, font);
            fs.copyFileSync(source, target);
            console.log(`✅ Copied font: ${font}`);
        });
    }
}

// สร้าง manifest file
const manifest = {
    version: '2.0.0',
    buildTime: new Date().toISOString(),
    files: {
        css: cssFiles,
        js: jsFiles,
        assets: ['images', 'fonts']
    }
};

fs.writeFileSync(
    path.join(buildDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
);

console.log('✅ Build completed successfully!');
console.log('📁 Build files are in: public/build/');
console.log('🎉 DUYDODEE is ready for production!');
