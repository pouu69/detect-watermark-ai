const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SOURCE_SVG = path.join(__dirname, '../public/favicon.svg');
const OUTPUT_DIR = path.join(__dirname, '../public/favicon');
const FAVICON_ICO = path.join(__dirname, '../public/favicon.ico');
const SIZES = [16, 32, 48, 64, 128, 192, 512];

// 디렉토리가 없으면 생성
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// SVG 파일 읽기
const svgBuffer = fs.readFileSync(SOURCE_SVG);

// 각 크기별로 PNG 생성
const generatePngs = async () => {
  console.log('PNG 파일 생성 중...');
  
  for (const size of SIZES) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(OUTPUT_DIR, `favicon-${size}x${size}.png`));
    
    console.log(`${size}x${size} PNG 생성 완료`);
  }
  
  // Apple Touch Icon 생성 (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(OUTPUT_DIR, 'apple-touch-icon.png'));
  
  console.log('Apple Touch Icon 생성 완료');
  
  // 32x32 PNG를 favicon.ico로 복사 (간단한 방법)
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(FAVICON_ICO);
  
  console.log('favicon.ico 생성 완료');
};

// site.webmanifest 파일 생성
const generateWebManifest = () => {
  console.log('site.webmanifest 파일 생성 중...');
  
  const manifest = {
    name: 'GPT 워터마크 탐지기',
    short_name: 'GPT 탐지기',
    icons: [
      {
        src: '/favicon/favicon-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/favicon/favicon-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ],
    theme_color: '#4A6BFF',
    background_color: '#ffffff',
    display: 'standalone'
  };
  
  fs.writeFileSync(
    path.join(__dirname, '../public/site.webmanifest'),
    JSON.stringify(manifest, null, 2)
  );
  
  console.log('site.webmanifest 파일 생성 완료');
};

// 실행
(async () => {
  try {
    await generatePngs();
    generateWebManifest();
    console.log('모든 파비콘 생성 완료!');
  } catch (error) {
    console.error('파비콘 생성 중 오류 발생:', error);
  }
})();
