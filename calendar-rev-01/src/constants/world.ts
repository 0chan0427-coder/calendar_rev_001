import type { WorldItem } from '../types/world';

export const WORLD_WELCOME_POINTS = 3000;
export const WORLD_DAILY_POINTS = {
  attendance: 100,
  chat: 100,
  visit: 100,
};

export const WORLD_RANKING_BONUS = [1000, 700, 500, 300];

export const WORLD_ITEMS: WorldItem[] = [
  { id: 'wallpaper-ivory', name: '아이보리 벽지', type: 'wallpaper', image: '🧱', price: 0, description: '포근하고 깔끔한 기본 벽지' },
  { id: 'wallpaper-check', name: '체크무늬 벽지', type: 'wallpaper', image: '▦', price: 1000, description: '2000년대 미니홈피 감성의 체크 패턴' },
  { id: 'wallpaper-flower', name: '꽃무늬 벽지', type: 'wallpaper', image: '🌸', price: 1500 },
  { id: 'floor-wood', name: '따뜻한 나무 바닥', type: 'floor', image: '🪵', price: 0 },
  { id: 'floor-check', name: '체크 러그 바닥', type: 'floor', image: '▧', price: 1000 },
  { id: 'sofa-basic', name: '포근한 소파', type: 'furniture', image: '🛋️', price: 0, description: '처음부터 제공되는 기본 소파' },
  { id: 'table', name: '작은 테이블', type: 'furniture', image: '🪵', price: 0, description: '처음부터 제공되는 기본 테이블' },
  { id: 'chair', name: '기본 의자', type: 'furniture', image: '🪑', price: 0, description: '처음부터 제공되는 기본 의자' },
  { id: 'plant', name: '작은 화분', type: 'props', image: '🪴', price: 0, description: '처음부터 제공되는 기본 화분' },
  { id: 'lamp', name: '스탠드 조명', type: 'furniture', image: '💡', price: 0, description: '처음부터 제공되는 기본 조명' },
  { id: 'sofa-check', name: '체크 소파', type: 'furniture', image: '🛋️', price: 2000 },
  { id: 'cactus', name: '작은 선인장', type: 'props', image: '🌵', price: 500 },
  { id: 'cherry-pot', name: '벚꽃 화분', type: 'props', image: '🌸', price: 1000 },
  { id: 'cat-white', name: '하얀 고양이', type: 'animal', image: '🐱', price: 1000 },
  { id: 'cat-ribbon', name: '빨간 리본 고양이', type: 'animal', image: '🎀🐱', price: 2000 },
  { id: 'dog-brown', name: '갈색 강아지', type: 'animal', image: '🐶', price: 1500 },
  { id: 'dog-sunglasses', name: '선글라스 강아지', type: 'animal', image: '😎🐶', price: 2500 },
  { id: 'rabbit', name: '토끼', type: 'animal', image: '🐰', price: 1500 },
  { id: 'panda', name: '판다', type: 'animal', image: '🐼', price: 2000 },
  { id: 'fox', name: '여우', type: 'animal', image: '🦊', price: 2000 },
  { id: 'tiger', name: '호랑이', type: 'animal', image: '🐯', price: 2500 },
  { id: 'elephant', name: '코끼리', type: 'animal', image: '🐘', price: 3000 },
  { id: 'crocodile', name: '악어', type: 'animal', image: '🐊', price: 2500 },
  { id: 'eagle', name: '독수리', type: 'animal', image: '🦅', price: 3000 },
  { id: 'whale', name: '고래', type: 'animal', image: '🐋', price: 3000 },
  { id: 'dragon-red', name: '붉은 용', type: 'animal', image: '🐉', price: 5000 },
  { id: 'dragon-gold', name: '황금 용', type: 'animal', image: '🐉✨', price: 7000 },
  { id: 'unicorn', name: '유니콘', type: 'animal', image: '🦄', price: 5000 },
  { id: 'piano', name: '작은 피아노', type: 'furniture', image: '🎹', price: 5000 },
  { id: 'christmas-room', name: '크리스마스 방', type: 'theme', image: '🎄', price: 10000 },
  { id: 'special-garden', name: '특별한 정원', type: 'theme', image: '🌳✨', price: 15000 },
];

export const WORLD_EARNING_ROWS = [
  ['첫 앱 접속', '+100P', '하루 1회'],
  ['첫 자유채팅', '+100P', '하루 1회'],
  ['다른 멤버 미니홈피 방문', '+100P', '멤버별 하루 1회'],
  ['주간 랭킹 1위', '+1,000P', '주 1회'],
  ['주간 랭킹 2위', '+700P', '주 1회'],
  ['주간 랭킹 3위', '+500P', '주 1회'],
  ['주간 랭킹 4위 이하', '+300P', '주 1회'],
] as const;
