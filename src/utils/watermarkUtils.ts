// 워터마크 유형 정의
export type WatermarkType = 'zeroWidth' | 'specialSpace' | 'emojiVariant';

// 워터마크 정보 인터페이스
export interface WatermarkInfo {
  type: WatermarkType;
  unicode: string;
  char: string;
  position: number;
  description: string;
}

// 워터마크 감지 결과 인터페이스
export interface DetectionResult {
  hasWatermarks: boolean;
  totalCount: number;
  watermarks: {
    zeroWidth: WatermarkInfo[];
    specialSpace: WatermarkInfo[];
    emojiVariant: WatermarkInfo[];
  };
  highlightedText: string;
  detectionRate?: number; // GPT 작성 확률 (백분율)
  
  // 추가 분석 정보
  statistics: {
    totalCharCount: number;     // 총 문자 수
    watermarkCount: number;     // 워터마크 수
    emojiCount: number;         // 이모지 수
    gptScore: number;           // GPT 점수(%)
  };
  
  watermarkTypes: {
    unicodeWatermarks: number;  // 유니코드 워터마크 수
    htmlEntities: number;       // HTML 엔티티 수
    specialPatterns: number;    // 특수 패턴 수
  };
  
  textAnalysis: {
    wordFrequency: { [word: string]: number };  // 단어 빈도 분석
    sentencePatterns: { [pattern: string]: number };  // 문장 시작 패턴
  };
}

// 제로 너비 문자 목록
const ZERO_WIDTH_CHARS = [
  { char: '\u200B', name: '제로 너비 공백 (ZERO WIDTH SPACE)', unicode: 'U+200B' },
  { char: '\u200C', name: '제로 너비 비결합자 (ZERO WIDTH NON-JOINER)', unicode: 'U+200C' },
  { char: '\u200D', name: '제로 너비 결합자 (ZERO WIDTH JOINER)', unicode: 'U+200D' },
  { char: '\u2060', name: '단어 결합자 (WORD JOINER)', unicode: 'U+2060' },
  { char: '\u2061', name: '함수 적용 (FUNCTION APPLICATION)', unicode: 'U+2061' },
  { char: '\u2062', name: '보이지 않는 곱하기 (INVISIBLE TIMES)', unicode: 'U+2062' },
  { char: '\u2063', name: '보이지 않는 구분자 (INVISIBLE SEPARATOR)', unicode: 'U+2063' },
  { char: '\u2064', name: '보이지 않는 더하기 (INVISIBLE PLUS)', unicode: 'U+2064' },
  { char: '\uFEFF', name: '바이트 순서 표시 (ZERO WIDTH NO-BREAK SPACE)', unicode: 'U+FEFF' }
];

// 특수 공백 문자 목록
const SPECIAL_SPACE_CHARS = [
  { char: '\u00A0', name: '줄바꿈 없는 공백 (NO-BREAK SPACE)', unicode: 'U+00A0' },
  { char: '\u2000', name: '앤 공백 (EN QUAD)', unicode: 'U+2000' },
  { char: '\u2001', name: '엠 공백 (EM QUAD)', unicode: 'U+2001' },
  { char: '\u2002', name: '앤 공간 (EN SPACE)', unicode: 'U+2002' },
  { char: '\u2003', name: '엠 공간 (EM SPACE)', unicode: 'U+2003' },
  { char: '\u2004', name: '3분의 1 엠 공간 (THREE-PER-EM SPACE)', unicode: 'U+2004' },
  { char: '\u2005', name: '4분의 1 엠 공간 (FOUR-PER-EM SPACE)', unicode: 'U+2005' },
  { char: '\u2006', name: '6분의 1 엠 공간 (SIX-PER-EM SPACE)', unicode: 'U+2006' },
  { char: '\u2007', name: '숫자 공간 (FIGURE SPACE)', unicode: 'U+2007' },
  { char: '\u2008', name: '구두점 공간 (PUNCTUATION SPACE)', unicode: 'U+2008' },
  { char: '\u2009', name: '얇은 공간 (THIN SPACE)', unicode: 'U+2009' },
  { char: '\u200A', name: '머리카락 공간 (HAIR SPACE)', unicode: 'U+200A' },
  { char: '\u202F', name: '좁은 줄바꿈 없는 공백 (NARROW NO-BREAK SPACE)', unicode: 'U+202F' },
  { char: '\u205F', name: '중간 수학 공간 (MEDIUM MATHEMATICAL SPACE)', unicode: 'U+205F' },
  { char: '\u3000', name: '표의문자 공간 (IDEOGRAPHIC SPACE)', unicode: 'U+3000' }
];

// 이모지 변형 선택자 목록
const EMOJI_VARIANT_CHARS = [
  { char: '\uFE0E', name: '텍스트 표현 선택자 (VARIATION SELECTOR-15)', unicode: 'U+FE0E' },
  { char: '\uFE0F', name: '이모지 표현 선택자 (VARIATION SELECTOR-16)', unicode: 'U+FE0F' }
];

// 이모지 정규식 패턴
const EMOJI_PATTERN = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;

// HTML 엔티티 정규식 패턴
const HTML_ENTITY_PATTERN = /&[a-zA-Z0-9#]+;/g;

// 한국어 불용어 목록
const KOREAN_STOPWORDS = new Set([
  '이', '그', '저', '것', '이것', '그것', '저것', '이런', '그런', '저런',
  '이렇게', '그렇게', '저렇게', '이와', '그와', '저와', '및', '에', '에서',
  '의', '을', '를', '이다', '있다', '하다', '이고', '하고', '한', '할', '하여',
  '한다', '함', '과', '와', '으로', '로', '에게', '뿐', '다', '도', '만', '에서',
  '이', '가', '은', '는', '들', '좀', '잘', '걍', '과', '고', '도', '되', '되다',
  '된', '될', '됨', '됩니다', '두', '둘', '든', '듯', '듯이', '때', '또', '라',
  '랑', '로', '로써', '를', '만', '많', '말', '매', '며', '면', '면서', '무',
  '무슨', '에', '에게', '에서', '여', '역시', '와', '요', '으로', '으로써', '응',
  '의', '이', '이다', '이라', '이런', '이렇게', '인', '일', '임', '있', '있다',
  '자', '잘', '저', '적', '전', '정도', '제', '주', '줄', '중', '즉', '지',
  '지만', '진', '쪽', '처럼', '척', '치', '카', '통', '파', '편', '하', '하고',
  '하는', '하다', '하지', '한', '해', '했', '향', '헉', '혹', '혹은', '후'
]);

// 영어 불용어 목록
const ENGLISH_STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'to', 'of', 'for', 'with', 'by', 'about', 'against', 'between', 'into',
  'through', 'during', 'before', 'after', 'above', 'below', 'from', 'up', 'down',
  'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once',
  'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each',
  'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
  'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just',
  'don', 'should', 'now', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
  'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself',
  'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their',
  'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these',
  'those', 'am', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing'
]);

/**
 * 텍스트에서 워터마크를 감지하는 함수
 * @param text 검사할 텍스트
 * @returns 감지 결과 객체
 */
export const detectWatermarks = (text: string): DetectionResult => {
  if (!text) {
    return {
      hasWatermarks: false,
      totalCount: 0,
      watermarks: {
        zeroWidth: [],
        specialSpace: [],
        emojiVariant: []
      },
      highlightedText: '',
      statistics: {
        totalCharCount: 0,
        watermarkCount: 0,
        emojiCount: 0,
        gptScore: 0
      },
      watermarkTypes: {
        unicodeWatermarks: 0,
        htmlEntities: 0,
        specialPatterns: 0
      },
      textAnalysis: {
        wordFrequency: {},
        sentencePatterns: {}
      }
    };
  }

  // 워터마크 정보를 저장할 배열
  const watermarks = {
    zeroWidth: [] as WatermarkInfo[],
    specialSpace: [] as WatermarkInfo[],
    emojiVariant: [] as WatermarkInfo[]
  };
  
  // 이모지 수 계산
  const emojiMatches = text.match(EMOJI_PATTERN) || [];
  const emojiCount = emojiMatches.length;
  
  // HTML 엔티티 수 계산
  const htmlEntityMatches = text.match(HTML_ENTITY_PATTERN) || [];
  const htmlEntityCount = htmlEntityMatches.length;
  
  // 1단계: 모든 워터마크 위치 찾기
  
  // 제로 너비 문자 감지
  ZERO_WIDTH_CHARS.forEach(({ char, name, unicode }) => {
    let position = -1;
    while ((position = text.indexOf(char, position + 1)) !== -1) {
      watermarks.zeroWidth.push({
        type: 'zeroWidth',
        unicode,
        char,
        position,
        description: name
      });
    }
  });

  // 특수 공백 문자 감지
  SPECIAL_SPACE_CHARS.forEach(({ char, name, unicode }) => {
    let position = -1;
    while ((position = text.indexOf(char, position + 1)) !== -1) {
      watermarks.specialSpace.push({
        type: 'specialSpace',
        unicode,
        char,
        position,
        description: name
      });
    }
  });

  // 이모지 변형 선택자 감지
  EMOJI_VARIANT_CHARS.forEach(({ char, name, unicode }) => {
    let position = -1;
    while ((position = text.indexOf(char, position + 1)) !== -1) {
      watermarks.emojiVariant.push({
        type: 'emojiVariant',
        unicode,
        char,
        position,
        description: name
      });
    }
  });
  
  // 2단계: 모든 워터마크 위치를 하나의 배열로 합치고 위치 순으로 정렬
  const allWatermarks = [
    ...watermarks.zeroWidth,
    ...watermarks.specialSpace,
    ...watermarks.emojiVariant
  ].sort((a, b) => a.position - b.position);
  
  // 3단계: 정렬된 워터마크 위치를 기반으로 텍스트에 하이라이트 추가
  let highlightedText = '';
  let lastPosition = 0;
  
  allWatermarks.forEach((watermark) => {
    // 이전 위치부터 현재 워터마크 위치까지의 텍스트 추가
    highlightedText += text.substring(lastPosition, watermark.position);
    
    // 워터마크에 하이라이트 추가
    highlightedText += `<span class="watermark-highlight" title="${watermark.description} (${watermark.unicode})">${watermark.char}</span>`;
    
    // 다음 시작 위치 업데이트 (워터마크 다음 위치)
    lastPosition = watermark.position + 1;
  });
  
  // 마지막 워터마크 이후의 텍스트 추가
  highlightedText += text.substring(lastPosition);

  const totalCount = 
    watermarks.zeroWidth.length + 
    watermarks.specialSpace.length + 
    watermarks.emojiVariant.length;
    
  // 개선된 단어 빈도 분석 알고리즘
  const wordFrequency = analyzeWordFrequency(text);
  
  // 문장 시작 패턴 분석
  const sentencePatterns = analyzeSentencePatterns(text);
  
  // GPT 점수 계산 (워터마크 수와 텍스트 길이를 기반으로)
  const gptScore = totalCount > 0 
    ? Math.min(Math.round((totalCount / (text.length * 0.01)) * 100), 98)
    : 0;

  return {
    hasWatermarks: totalCount > 0,
    totalCount,
    watermarks,
    highlightedText,
    statistics: {
      totalCharCount: text.length,
      watermarkCount: totalCount,
      emojiCount,
      gptScore
    },
    watermarkTypes: {
      unicodeWatermarks: watermarks.zeroWidth.length + watermarks.emojiVariant.length,
      htmlEntities: htmlEntityCount,
      specialPatterns: watermarks.specialSpace.length
    },
    textAnalysis: {
      wordFrequency,
      sentencePatterns
    }
  };
};

/**
 * 개선된 단어 빈도 분석 알고리즘
 * @param text 분석할 텍스트
 * @returns 단어 빈도 분석 결과
 */
function analyzeWordFrequency(text: string): { [word: string]: number } {
  // 1. 텍스트 전처리 및 단어 추출
  // 한글, 영문, 숫자를 포함하는 단어 추출 (개선된 정규식)
  const rawWords = text.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
  
  // 2. 단어 필터링 및 정제
  const filteredWords = rawWords.filter(word => {
    // 2글자 이상이고 불용어가 아닌 경우만 포함
    return word.length >= 2 && 
           !KOREAN_STOPWORDS.has(word) && 
           !ENGLISH_STOPWORDS.has(word);
  });
  
  // 3. 단어 빈도 계산
  const wordCounts: { [word: string]: number } = {};
  filteredWords.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });
  
  // 4. 단어 중요도 계산 (TF 기반)
  const wordScores: { [word: string]: number } = {};
  const totalWords = filteredWords.length;
  
  Object.entries(wordCounts).forEach(([word, count]) => {
    // 단어 길이에 따른 가중치 (긴 단어가 더 중요할 수 있음)
    const lengthWeight = Math.min(1.0, word.length / 10);
    
    // 빈도에 따른 가중치 (로그 스케일 적용)
    const frequencyWeight = Math.log(count + 1) / Math.log(totalWords + 1);
    
    // 최종 점수 계산
    const score = count * (1 + lengthWeight * frequencyWeight);
    wordScores[word] = score;
  });
  
  // 5. 상위 10개 단어 선택
  const sortedWords = Object.entries(wordCounts)
    .sort((a, b) => {
      // 먼저 빈도로 정렬
      const countDiff = b[1] - a[1];
      if (countDiff !== 0) return countDiff;
      
      // 빈도가 같으면 단어 길이로 정렬 (긴 단어 우선)
      return b[0].length - a[0].length;
    })
    .slice(0, 10);
  
  // 6. 결과 반환
  const result: { [word: string]: number } = {};
  sortedWords.forEach(([word, count]) => {
    result[word] = count;
  });
  
  return result;
}

/**
 * 문장 시작 패턴 분석
 * @param text 분석할 텍스트
 * @returns 문장 시작 패턴 분석 결과
 */
function analyzeSentencePatterns(text: string): { [pattern: string]: number } {
  // 문장 구분자로 더 정확하게 분리 (한국어 문장 종결 부호 포함)
  const sentences = text.split(/[.!?。！？]+\s*/);
  const patterns: { [pattern: string]: number } = {};
  
  sentences.forEach(sentence => {
    const trimmed = sentence.trim();
    if (trimmed && trimmed.length > 5) { // 의미 있는 문장만 분석 (5글자 이상)
      // 문장의 첫 3단어 또는 더 적은 단어를 패턴으로 사용
      const words = trimmed.split(/\s+/);
      if (words.length > 0) {
        const pattern = words.slice(0, Math.min(3, words.length)).join(' ');
        patterns[pattern] = (patterns[pattern] || 0) + 1;
      }
    }
  });
  
  // 상위 5개 패턴만 유지
  const sortedPatterns = Object.entries(patterns)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  const result: { [pattern: string]: number } = {};
  sortedPatterns.forEach(([pattern, count]) => {
    result[pattern] = count;
  });
  
  return result;
}

/**
 * 텍스트에서 워터마크를 제거하는 함수
 * @param text 워터마크를 제거할 텍스트
 * @returns 워터마크가 제거된 텍스트
 */
export const removeWatermarks = (text: string): string => {
  if (!text) return '';
  
  let cleanedText = text;
  
  // 제로 너비 문자 제거
  ZERO_WIDTH_CHARS.forEach(({ char }) => {
    cleanedText = cleanedText.split(char).join('');
  });
  
  // 특수 공백 문자를 일반 공백으로 변환
  SPECIAL_SPACE_CHARS.forEach(({ char }) => {
    cleanedText = cleanedText.split(char).join(' ');
  });
  
  // 이모지 변형 선택자 제거
  EMOJI_VARIANT_CHARS.forEach(({ char }) => {
    cleanedText = cleanedText.split(char).join('');
  });
  
  return cleanedText;
};

/**
 * 워터마크 위치를 시각적으로 표시하는 함수
 * @param text 원본 텍스트
 * @param watermarks 감지된 워터마크 목록
 * @returns 워터마크가 강조 표시된 HTML 텍스트
 */
const highlightWatermarks = (
  text: string,
  watermarks: WatermarkInfo[]
): string => {
  // 워터마크가 없으면 원본 텍스트 반환
  if (watermarks.length === 0) {
    return text;
  }
  
  // 워터마크 위치를 기준으로 정렬
  const sortedWatermarks = [...watermarks].sort((a, b) => a.position - b.position);
  
  let result = '';
  let lastPosition = 0;
  
  // 각 워터마크 위치에 하이라이트 추가
  sortedWatermarks.forEach((watermark) => {
    // 이전 위치부터 현재 워터마크 위치까지의 텍스트 추가
    result += text.substring(lastPosition, watermark.position);
    
    // 워터마크에 하이라이트 추가
    result += `<span class="watermark-highlight" title="${watermark.description} (${watermark.unicode})">${watermark.char}</span>`;
    
    // 다음 시작 위치 업데이트 (워터마크 다음 위치)
    lastPosition = watermark.position + 1;
  });
  
  // 마지막 워터마크 이후의 텍스트 추가
  result += text.substring(lastPosition);
  
  return result;
};

/**
 * 워터마크 정보를 사람이 읽기 쉬운 형식으로 변환
 * @param info 워터마크 정보
 * @returns 사람이 읽기 쉬운 설명
 */
export const formatWatermarkInfo = (info: WatermarkInfo): string => {
  return `${info.description} (${info.unicode}) - 위치: ${info.position}`;
};

/**
 * 원본 텍스트에서 워터마크 위치를 찾아 하이라이트한 HTML을 생성
 * @param originalText 원본 텍스트
 * @returns 워터마크가 하이라이트된 HTML
 */
export const generateDiffHtml = (originalText: string): string => {
  // 워터마크 감지
  const result = detectWatermarks(originalText);
  
  if (!result.hasWatermarks) {
    return originalText; // 워터마크가 없으면 원본 텍스트 반환
  }
  
  // 모든 워터마크 위치를 하나의 배열로 합치고 위치 순으로 정렬
  const allWatermarks = [
    ...result.watermarks.zeroWidth,
    ...result.watermarks.specialSpace,
    ...result.watermarks.emojiVariant
  ].sort((a, b) => a.position - b.position);
  
  // 워터마크 위치에 하이라이트 추가
  let diffHtml = '';
  let lastPosition = 0;
  
  allWatermarks.forEach((watermark) => {
    // 이전 위치부터 현재 워터마크 위치까지의 텍스트 추가
    diffHtml += originalText.substring(lastPosition, watermark.position);
    
    // 워터마크에 하이라이트 추가
    diffHtml += `<span class="removed-watermark" title="${i18next.t('watermark.removedWatermark')}: ${watermark.description} (${watermark.unicode})">${watermark.char}</span>`;
    
    // 다음 시작 위치 업데이트 (워터마크 다음 위치)
    lastPosition = watermark.position + 1;
  });
  
  // 마지막 워터마크 이후의 텍스트 추가
  diffHtml += originalText.substring(lastPosition);
  
  return diffHtml;
};

import i18next from 'i18next';

/**
 * 워터마크 유형에 따른 이름 반환
 * @param type 워터마크 유형
 * @returns 이름
 */
export const getWatermarkTypeName = (type: WatermarkType): string => {
  switch (type) {
    case 'zeroWidth':
      return i18next.t('watermark.zeroWidth');
    case 'specialSpace':
      return i18next.t('watermark.specialSpace');
    case 'emojiVariant':
      return i18next.t('watermark.emojiVariant');
    default:
      return i18next.t('watermark.unknownType');
  }
};

/**
 * 테스트용 워터마크가 포함된 텍스트 생성
 * @param text 원본 텍스트
 * @returns 워터마크가 추가된 텍스트
 */
export const generateWatermarkedText = (text: string): string => {
  if (!text) return '';
  
  // 텍스트를 문자 배열로 변환
  const chars = text.split('');
  
  // 워터마크로 사용할 수 있는 모든 유니코드 문자 배열
  const allWatermarkChars = [
    ...ZERO_WIDTH_CHARS.map(item => item.char),
    ...SPECIAL_SPACE_CHARS.map(item => item.char),
    ...EMOJI_VARIANT_CHARS.map(item => item.char)
  ];
  
  // 텍스트 길이에 따라 추가할 워터마크 수 결정 (약 5-10%)
  const watermarkCount = Math.floor(text.length * (Math.random() * 0.05 + 0.05));
  
  // 워터마크를 삽입할 위치 랜덤하게 선택 (중복 없이)
  const positions = new Set<number>();
  while (positions.size < watermarkCount) {
    // 문장 시작과 끝을 피해서 워터마크 삽입 (가독성을 위해)
    const position = Math.floor(Math.random() * (text.length - 4)) + 2;
    positions.add(position);
  }
  
  // 선택된 위치에 워터마크 삽입
  const sortedPositions = Array.from(positions).sort((a, b) => b - a); // 역순으로 정렬하여 인덱스 변화 방지
  sortedPositions.forEach(position => {
    // 랜덤한 워터마크 문자 선택
    const watermarkChar = allWatermarkChars[Math.floor(Math.random() * allWatermarkChars.length)];
    
    // 선택된 위치에 워터마크 삽입
    chars.splice(position, 0, watermarkChar);
  });
  
  return chars.join('');
};
