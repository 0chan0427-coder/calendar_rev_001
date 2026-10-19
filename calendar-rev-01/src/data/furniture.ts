import {FURNITURE_GEOMETRY as geometry} from './furnitureGeometry';
import type {WorldItem} from '../types/world';
export interface FurnitureDesign {key:string;name:string;ids:string[];legacyPaths:string[];sceneSize:[number,number];image:string;width:number;height:number;crop:number[];}
const rows:[string,string,string[],string[],[number,number]][]=[
  [
    "sofa",
    "크림 소파",
    [
      "sofa-basic"
    ],
    [
      "furniture/livingroom/sofa.png"
    ],
    [
      280,
      190
    ]
  ],
  [
    "sofa-check",
    "세이지 체크 소파",
    [
      "sofa-check"
    ],
    [],
    [
      280,
      190
    ]
  ],
  [
    "table",
    "원목 테이블",
    [
      "table",
      "coffee-table"
    ],
    [
      "furniture/livingroom/table.png"
    ],
    [
      220,
      135
    ]
  ],
  [
    "chair",
    "원목 의자",
    [
      "chair"
    ],
    [
      "furniture/livingroom/chair.png"
    ],
    [
      145,
      205
    ]
  ],
  [
    "plant-large",
    "초록 잎 화분",
    [
      "plant",
      "plant-large"
    ],
    [
      "furniture/livingroom/plant_large.png"
    ],
    [
      170,
      250
    ]
  ],
  [
    "cactus",
    "작은 선인장",
    [
      "cactus"
    ],
    [
      "props/interior/plant.png"
    ],
    [
      90,
      120
    ]
  ],
  [
    "bookcase",
    "원목 책장",
    [
      "bookcase"
    ],
    [
      "furniture/livingroom/bookcase.png"
    ],
    [
      230,
      270
    ]
  ],
  [
    "tv",
    "크림 TV",
    [
      "tv"
    ],
    [
      "furniture/livingroom/tv.png"
    ],
    [
      190,
      150
    ]
  ],
  [
    "piano",
    "아이보리 피아노",
    [
      "piano"
    ],
    [
      "furniture/study_pc/piano.png"
    ],
    [
      270,
      230
    ]
  ],
  [
    "computer-desk",
    "컴퓨터 책상",
    [
      "desk",
      "computer-desk"
    ],
    [
      "furniture/study_pc/computer_desk.png"
    ],
    [
      270,
      220
    ]
  ],
  [
    "bed",
    "포근한 침대",
    [
      "bed"
    ],
    [
      "furniture/bedroom/bed.png"
    ],
    [
      230,
      300
    ]
  ],
  [
    "floor-lamp",
    "패브릭 스탠드",
    [
      "lamp",
      "floor-lamp"
    ],
    [
      "furniture/seasonal/lamp.png"
    ],
    [
      120,
      280
    ]
  ],
  [
    "desk-lamp",
    "세이지 책상 조명",
    [
      "desk-lamp"
    ],
    [
      "props/desk/lamp.png"
    ],
    [
      100,
      130
    ]
  ],
  [
    "cafe-vase",
    "데이지 화병",
    [
      "cafe-vase",
      "flower-vase-cafe"
    ],
    [
      "furniture/cafe/flower_vase.png"
    ],
    [
      80,
      120
    ]
  ],
  [
    "flower-vase",
    "튤립 화병",
    [
      "flower-vase",
      "vase"
    ],
    [
      "props/decoration/flower_vase.png"
    ],
    [
      80,
      120
    ]
  ],
  [
    "pink-pouf",
    "로즈 푸프",
    [
      "pink-pouf",
      "pouf"
    ],
    [
      "furniture/gamerroom/pink_pouf.png"
    ],
    [
      140,
      120
    ]
  ],
  [
    "tea-set",
    "찻잔 세트",
    [
      "tea-set",
      "table-set"
    ],
    [
      "props/kitchen/table_set.png"
    ],
    [
      75,
      70
    ]
  ],
  [
    "spring-decor",
    "봄꽃 장식",
    [
      "spring-decor"
    ],
    [
      "props/seasonal/spring_decor.png"
    ],
    [
      100,
      130
    ]
  ],
  [
    "cherry-pot",
    "벚꽃 화분",
    [
      "cherry-pot"
    ],
    [],
    [
      170,
      220
    ]
  ]
];
export const FURNITURE_DESIGNS:FurnitureDesign[]=rows.map(([key,name,ids,legacyPaths,sceneSize])=>({key,name,ids,legacyPaths,sceneSize,image:`/world/furniture-v2/${key}.png`,...(geometry as Record<string,{width:number;height:number;crop:number[]}>)[key]}));
export function furnitureDesign(item:{id?:string;item_id?:string;image?:string|null;image_url?:string|null}):FurnitureDesign|undefined{
 const id=(item.id||item.item_id||'').replaceAll('_','-');
 const byId=FURNITURE_DESIGNS.find(d=>d.ids.includes(id));if(byId)return byId;
 const urls=[item.image_url,item.image].filter(Boolean) as string[];
 return FURNITURE_DESIGNS.find(d=>urls.some(url=>url.split('?')[0].endsWith(d.image)||d.legacyPaths.some(p=>url.split('?')[0].endsWith('/'+p))));
}
export function refreshFurnitureArt<T extends WorldItem>(item:T):T{const design=furnitureDesign(item);return design?{...item,image:design.image,image_url:design.image}:item;}
