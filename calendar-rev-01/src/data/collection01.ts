import type {WearSlot} from './wardrobe';
export type Box=[number,number,number,number];
export interface CollectionItem {id:string;slot:WearSlot;name:string;price:number;kind:string;box:Box;image:string;width:number;height:number;crop:Box;feet?:[Box,Box]}
// One entry per original design. Source PNGs are unmodified; crops describe their alpha bounds.
export const COLLECTION_01:CollectionItem[]=[
  {
    "id": "hair-wave",
    "slot": "hair",
    "name": "밤색 웨이브 단발",
    "price": 2500,
    "kind": "hair",
    "box": [
      155,
      -5,
      710,
      650
    ],
    "image": "/world/wardrobe-01/hair-wave.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      192,
      40,
      1149,
      872
    ]
  },
  {
    "id": "hair-sidepart",
    "slot": "hair",
    "name": "블랙 사이드 파트",
    "price": 2500,
    "kind": "hair",
    "box": [
      180,
      -12,
      660,
      450
    ],
    "image": "/world/wardrobe-01/hair-sidepart.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      229,
      24,
      1074,
      943
    ]
  },
  {
    "id": "hair-curls",
    "slot": "hair",
    "name": "코코아 곱슬 숏컷",
    "price": 2500,
    "kind": "hair",
    "box": [
      165,
      -15,
      690,
      490
    ],
    "image": "/world/wardrobe-01/hair-curls.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      140,
      45,
      1244,
      895
    ]
  },
  {
    "id": "hair-long",
    "slot": "hair",
    "name": "초콜릿 긴 생머리",
    "price": 3000,
    "kind": "hair",
    "box": [
      155,
      -10,
      710,
      850
    ],
    "image": "/world/wardrobe-01/hair-long.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      264,
      15,
      1007,
      964
    ]
  },
  {
    "id": "hair-twintail",
    "slot": "hair",
    "name": "리본 양갈래 헤어",
    "price": 3000,
    "kind": "hair",
    "box": [
      105,
      -15,
      810,
      750
    ],
    "image": "/world/wardrobe-01/hair-twintail.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      87,
      27,
      1362,
      971
    ]
  },
  {
    "id": "hair-pony",
    "slot": "hair",
    "name": "내추럴 포니테일",
    "price": 3000,
    "kind": "hair",
    "box": [
      155,
      -10,
      760,
      700
    ],
    "image": "/world/wardrobe-01/hair-pony.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      223,
      29,
      1131,
      964
    ]
  },
  {
    "id": "top-cable",
    "slot": "top",
    "name": "아이보리 케이블 니트",
    "price": 2000,
    "kind": "top",
    "box": [
      145,
      600,
      734,
      430
    ],
    "image": "/world/wardrobe-01/top-cable.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      57,
      165,
      1423,
      763
    ]
  },
  {
    "id": "top-stripe",
    "slot": "top",
    "name": "네이비 스트라이프 티",
    "price": 1800,
    "kind": "top",
    "box": [
      200,
      603,
      624,
      380
    ],
    "image": "/world/wardrobe-01/top-stripe.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      103,
      171,
      1331,
      687
    ]
  },
  {
    "id": "top-hoodie",
    "slot": "top",
    "name": "라벤더 후드티",
    "price": 2200,
    "kind": "top",
    "box": [
      140,
      590,
      744,
      450
    ],
    "image": "/world/wardrobe-01/top-hoodie.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      114,
      143,
      1308,
      798
    ]
  },
  {
    "id": "top-blouse",
    "slot": "top",
    "name": "화이트 퍼프 블라우스",
    "price": 2200,
    "kind": "top",
    "box": [
      185,
      603,
      654,
      385
    ],
    "image": "/world/wardrobe-01/top-blouse.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      113,
      157,
      1311,
      713
    ]
  },
  {
    "id": "top-vest",
    "slot": "top",
    "name": "네이비 셔츠 조끼",
    "price": 2500,
    "kind": "top",
    "box": [
      148,
      603,
      728,
      430
    ],
    "image": "/world/wardrobe-01/top-vest.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      84,
      144,
      1369,
      752
    ]
  },
  {
    "id": "top-rugby",
    "slot": "top",
    "name": "그린 럭비 셔츠",
    "price": 2200,
    "kind": "top",
    "box": [
      148,
      603,
      728,
      430
    ],
    "image": "/world/wardrobe-01/top-rugby.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      97,
      140,
      1340,
      759
    ]
  },
  {
    "id": "outer-cardigan",
    "slot": "outer",
    "name": "크림 오픈 가디건",
    "price": 3000,
    "kind": "outer",
    "box": [
      145,
      595,
      734,
      465
    ],
    "image": "/world/wardrobe-01/outer-cardigan.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      108,
      140,
      1318,
      733
    ]
  },
  {
    "id": "outer-denim",
    "slot": "outer",
    "name": "빈티지 데님 재킷",
    "price": 3500,
    "kind": "outer",
    "box": [
      145,
      595,
      734,
      450
    ],
    "image": "/world/wardrobe-01/outer-denim.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      71,
      126,
      1394,
      800
    ]
  },
  {
    "id": "outer-wizard",
    "slot": "outer",
    "name": "별빛 마법사 망토",
    "price": 8000,
    "kind": "outer",
    "box": [
      150,
      590,
      724,
      665
    ],
    "image": "/world/wardrobe-01/outer-wizard.png",
    "width": 1312,
    "height": 1199,
    "crop": [
      38,
      69,
      1235,
      1058
    ]
  },
  {
    "id": "outer-detective",
    "slot": "outer",
    "name": "클래식 탐정 트렌치",
    "price": 8000,
    "kind": "outer",
    "box": [
      140,
      595,
      744,
      610
    ],
    "image": "/world/wardrobe-01/outer-detective.png",
    "width": 1199,
    "height": 1312,
    "crop": [
      22,
      70,
      1156,
      1101
    ]
  },
  {
    "id": "bottom-denim",
    "slot": "bottom",
    "name": "라이트 스트레이트 진",
    "price": 2200,
    "kind": "pants",
    "box": [
      300,
      919,
      424,
      486
    ],
    "image": "/world/wardrobe-01/bottom-denim.png",
    "width": 1278,
    "height": 1230,
    "crop": [
      263,
      128,
      751,
      988
    ]
  },
  {
    "id": "bottom-jogger",
    "slot": "bottom",
    "name": "그레이 조거팬츠",
    "price": 2000,
    "kind": "pants",
    "box": [
      300,
      919,
      424,
      486
    ],
    "image": "/world/wardrobe-01/bottom-jogger.png",
    "width": 1278,
    "height": 1230,
    "crop": [
      307,
      136,
      665,
      972
    ]
  },
  {
    "id": "bottom-tweed",
    "slot": "bottom",
    "name": "탐정 체크 슬랙스",
    "price": 3000,
    "kind": "pants",
    "box": [
      300,
      919,
      424,
      486
    ],
    "image": "/world/wardrobe-01/bottom-tweed.png",
    "width": 1278,
    "height": 1230,
    "crop": [
      269,
      126,
      738,
      991
    ]
  },
  {
    "id": "bottom-pleat",
    "slot": "bottom",
    "name": "네이비 플리츠 스커트",
    "price": 2200,
    "kind": "skirt",
    "box": [
      302,
      919,
      420,
      260
    ],
    "image": "/world/wardrobe-01/bottom-pleat.png",
    "width": 1381,
    "height": 1139,
    "crop": [
      82,
      138,
      1216,
      872
    ]
  },
  {
    "id": "bottom-skirt",
    "slot": "bottom",
    "name": "데님 A라인 스커트",
    "price": 2200,
    "kind": "skirt",
    "box": [
      302,
      919,
      420,
      260
    ],
    "image": "/world/wardrobe-01/bottom-skirt.png",
    "width": 1368,
    "height": 1149,
    "crop": [
      91,
      164,
      1187,
      839
    ]
  },
  {
    "id": "bottom-khaki",
    "slot": "bottom",
    "name": "카키 카고 반바지",
    "price": 2000,
    "kind": "shorts",
    "box": [
      307,
      919,
      410,
      220
    ],
    "image": "/world/wardrobe-01/bottom-khaki.png",
    "width": 1355,
    "height": 1161,
    "crop": [
      94,
      162,
      1168,
      824
    ]
  },
  {
    "id": "bottom-sport",
    "slot": "bottom",
    "name": "블랙 트랙 반바지",
    "price": 1800,
    "kind": "shorts",
    "box": [
      307,
      919,
      410,
      220
    ],
    "image": "/world/wardrobe-01/bottom-sport.png",
    "width": 1278,
    "height": 1230,
    "crop": [
      94,
      223,
      1090,
      748
    ]
  },
  {
    "id": "bottom-pajama",
    "slot": "bottom",
    "name": "포근 체크 파자마",
    "price": 2000,
    "kind": "pants",
    "box": [
      300,
      919,
      424,
      486
    ],
    "image": "/world/wardrobe-01/bottom-pajama.png",
    "width": 1278,
    "height": 1230,
    "crop": [
      265,
      130,
      747,
      989
    ]
  },
  {
    "id": "shoes-oxford",
    "slot": "shoes",
    "name": "브라운 옥스퍼드",
    "price": 2200,
    "kind": "shoe",
    "box": [
      270,
      1350,
      484,
      153
    ],
    "image": "/world/wardrobe-01/shoes-oxford.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      191,
      287,
      1153,
      512
    ],
    "feet": [
      [
        191,
        287,
        532,
        512
      ],
      [
        809,
        287,
        535,
        512
      ]
    ]
  },
  {
    "id": "shoes-maryjane",
    "slot": "shoes",
    "name": "블랙 메리제인",
    "price": 2200,
    "kind": "shoe",
    "box": [
      270,
      1338,
      484,
      165
    ],
    "image": "/world/wardrobe-01/shoes-maryjane.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      187,
      190,
      1162,
      675
    ],
    "feet": [
      [
        187,
        190,
        480,
        675
      ],
      [
        869,
        190,
        480,
        674
      ]
    ]
  },
  {
    "id": "shoes-canvas",
    "slot": "shoes",
    "name": "레드 캔버스 운동화",
    "price": 2000,
    "kind": "shoe",
    "box": [
      270,
      1350,
      484,
      153
    ],
    "image": "/world/wardrobe-01/shoes-canvas.png",
    "width": 1278,
    "height": 1230,
    "crop": [
      91,
      425,
      1097,
      570
    ],
    "feet": [
      [
        91,
        425,
        519,
        570
      ],
      [
        669,
        425,
        519,
        570
      ]
    ]
  },
  {
    "id": "shoes-slippers",
    "slot": "shoes",
    "name": "복숭아 털 슬리퍼",
    "price": 1800,
    "kind": "shoe",
    "box": [
      270,
      1370,
      484,
      133
    ],
    "image": "/world/wardrobe-01/shoes-slippers.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      52,
      205,
      1432,
      635
    ],
    "feet": [
      [
        52,
        205,
        676,
        635
      ],
      [
        808,
        205,
        676,
        635
      ]
    ]
  },
  {
    "id": "shoes-wizard",
    "slot": "shoes",
    "name": "플럼 마법사 부츠",
    "price": 3500,
    "kind": "boot",
    "box": [
      268,
      1307,
      488,
      195
    ],
    "image": "/world/wardrobe-01/shoes-wizard.png",
    "width": 1477,
    "height": 1065,
    "crop": [
      129,
      251,
      1219,
      615
    ],
    "feet": [
      [
        129,
        251,
        545,
        615
      ],
      [
        803,
        251,
        545,
        615
      ]
    ]
  },
  {
    "id": "shoes-rain",
    "slot": "shoes",
    "name": "레몬 레인부츠",
    "price": 2500,
    "kind": "boot",
    "box": [
      268,
      1260,
      488,
      243
    ],
    "image": "/world/wardrobe-01/shoes-rain.png",
    "width": 1402,
    "height": 1122,
    "crop": [
      108,
      215,
      1186,
      734
    ],
    "feet": [
      [
        108,
        215,
        548,
        734
      ],
      [
        746,
        215,
        548,
        734
      ]
    ]
  },
  {
    "id": "hat-wizard",
    "slot": "hat",
    "name": "별빛 마법사 모자",
    "price": 4000,
    "kind": "hat",
    "box": [
      120,
      -110,
      784,
      420
    ],
    "image": "/world/wardrobe-01/hat-wizard.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      67,
      88,
      1402,
      794
    ]
  },
  {
    "id": "hat-detective",
    "slot": "hat",
    "name": "클래식 탐정 모자",
    "price": 3000,
    "kind": "hat",
    "box": [
      170,
      -25,
      684,
      300
    ],
    "image": "/world/wardrobe-01/hat-detective.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      150,
      64,
      1236,
      862
    ]
  },
  {
    "id": "hat-beret",
    "slot": "hat",
    "name": "크림 베레모",
    "price": 2000,
    "kind": "hat",
    "box": [
      165,
      -30,
      694,
      280
    ],
    "image": "/world/wardrobe-01/hat-beret.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      69,
      107,
      1417,
      801
    ]
  },
  {
    "id": "hat-cap",
    "slot": "hat",
    "name": "올리브 볼캡",
    "price": 2000,
    "kind": "hat",
    "box": [
      165,
      -25,
      694,
      310
    ],
    "image": "/world/wardrobe-01/hat-cap.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      246,
      98,
      1042,
      805
    ]
  },
  {
    "id": "hat-cat",
    "slot": "hat",
    "name": "블랙 고양이 귀 머리띠",
    "price": 2200,
    "kind": "headband",
    "box": [
      185,
      -65,
      654,
      300
    ],
    "image": "/world/wardrobe-01/hat-cat.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      117,
      103,
      1302,
      816
    ]
  },
  {
    "id": "hat-straw",
    "slot": "hat",
    "name": "리본 밀짚모자",
    "price": 2500,
    "kind": "hat",
    "box": [
      110,
      -35,
      804,
      330
    ],
    "image": "/world/wardrobe-01/hat-straw.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      24,
      177,
      1489,
      607
    ]
  },
  {
    "id": "acc-scarf",
    "slot": "accessory",
    "name": "레드 니트 머플러",
    "price": 1800,
    "kind": "accessory",
    "box": [
      407,
      600,
      210,
      230
    ],
    "image": "/world/wardrobe-01/acc-scarf.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      348,
      68,
      852,
      899
    ]
  },
  {
    "id": "acc-bow",
    "slot": "accessory",
    "name": "세이지 리본 타이",
    "price": 1500,
    "kind": "accessory",
    "box": [
      425,
      628,
      174,
      100
    ],
    "image": "/world/wardrobe-01/acc-bow.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      155,
      172,
      1227,
      718
    ]
  },
  {
    "id": "acc-moon",
    "slot": "accessory",
    "name": "초승달 펜던트",
    "price": 2000,
    "kind": "accessory",
    "box": [
      439,
      623,
      146,
      210
    ],
    "image": "/world/wardrobe-01/acc-moon.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      322,
      51,
      891,
      923
    ]
  },
  {
    "id": "acc-star",
    "slot": "accessory",
    "name": "마법사 별 브로치",
    "price": 1800,
    "kind": "accessory",
    "box": [
      570,
      680,
      105,
      115
    ],
    "image": "/world/wardrobe-01/acc-star.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      442,
      149,
      650,
      686
    ]
  }
];
export const collectionItem=(id?:string)=>COLLECTION_01.find(item=>item.id===id);
