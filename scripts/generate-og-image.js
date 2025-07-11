const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// 캔버스 크기 설정
const WIDTH = 1200;
const HEIGHT = 630;
const BACKGROUND_COLOR = '#4A6BFF';
const OUTPUT_PATH = path.join(__dirname, '../public/og-image.png');

// SVG 파일 경로
const SVG_PATH = path.join(__dirname, '../public/favicon.svg');

// 캔버스 생성
const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext('2d');

// SVG를 데이터 URL로 변환하는 함수
function svgToDataURL(svgStr) {
  const encoded = Buffer.from(svgStr).toString('base64');
  return `data:image/svg+xml;base64,${encoded}`;
}

// 배경에 워터마크 패턴을 그리는 함수
function drawWatermarkPattern(ctx, iconDataURL, width, height) {
  return loadImage(iconDataURL).then(img => {
    // 패턴 간격 설정
    const spacing = 150;
    const iconSize = 40;
    const opacity = 0.1;
    
    ctx.save();
    ctx.globalAlpha = opacity;
    
    for (let y = 0; y < height; y += spacing) {
      for (let x = 0; x < width; x += spacing) {
        // 각 위치에 약간의 랜덤 오프셋 추가
        const offsetX = Math.random() * 20 - 10;
        const offsetY = Math.random() * 20 - 10;
        ctx.drawImage(img, x + offsetX, y + offsetY, iconSize, iconSize);
      }
    }
    
    ctx.restore();
  });
}

// 메인 함수
async function generateOGImage() {
  console.log('OG 이미지 생성 중...');
  
  try {
    // 배경색 채우기
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    // SVG 파일 읽기
    const svgContent = fs.readFileSync(SVG_PATH, 'utf8');
    const iconDataURL = svgToDataURL(svgContent);
    
    // 배경에 워터마크 패턴 그리기
    await drawWatermarkPattern(ctx, iconDataURL, WIDTH, HEIGHT);
    
    // 중앙에 큰 아이콘 그리기
    const iconImage = await loadImage(iconDataURL);
    const iconSize = 200;
    ctx.drawImage(
      iconImage, 
      (WIDTH - iconSize) / 2,
      (HEIGHT - iconSize) / 2 - 50, // 약간 위로 이동
      iconSize, 
      iconSize
    );
    
    // 제목 텍스트 그리기
    ctx.font = 'bold 60px sans-serif';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GPT 워터마크 탐지기', WIDTH / 2, HEIGHT / 2 + 100);
    
    // 부제목 텍스트 그리기
    ctx.font = '30px sans-serif';
    ctx.fillText('AI 생성 콘텐츠 식별 도구', WIDTH / 2, HEIGHT / 2 + 160);
    
    // 이미지를 파일로 저장
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(OUTPUT_PATH, buffer);
    
    console.log(`OG 이미지가 성공적으로 생성되었습니다: ${OUTPUT_PATH}`);
  } catch (error) {
    console.error('OG 이미지 생성 중 오류 발생:', error);
  }
}

// 스크립트 실행
generateOGImage();
