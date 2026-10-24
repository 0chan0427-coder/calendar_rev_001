import {companionSpriteKey} from './companionCatalog';
import type {Equipment} from './wardrobe';
export interface CompanionSpecialArt {image:string;width:number;height:number;crop:[number,number,number,number];accessory:[number,number,number];glasses?:[number,number,number,number,number]}
// Every body/coat has its own registered art and accessory anchor. Keep this object JSON-compatible.
export const COMPANION_SPECIAL_FORMS:Record<string,CompanionSpecialArt>={
  "cat-ivory": {
    "image": "/world/bond-054/baby-moon-cat.png",
    "width": 1312,
    "height": 1199,
    "crop": [
      0,
      0,
      1312,
      1199
    ],
    "accessory": [
      37,
      65,
      1
    ]
  },
  "adult-cat-ivory": {
    "image": "/world/bond-054/adult-moon-cat.png",
    "width": 1233,
    "height": 1276,
    "crop": [
      0,
      0,
      1233,
      1276
    ],
    "accessory": [
      32,
      41,
      0.8
    ]
  },
  "adult-cat-ginger": {
    "image": "/world/bond-055-01/adult-cat-ginger.png",
    "width": 1232,
    "height": 1277,
    "crop": [
      25,
      -13,
      1223,
      1286
    ],
    "accessory": [
      32,
      41,
      0.8
    ]
  },
  "adult-cat-gray": {
    "image": "/world/bond-055-01/adult-cat-gray.png",
    "width": 1233,
    "height": 1276,
    "crop": [
      81,
      -18,
      1163,
      1278
    ],
    "accessory": [
      32,
      41,
      0.8
    ]
  },
  "adult-crocodile": {
    "image": "/world/bond-055-01/adult-crocodile.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      5,
      138,
      1552,
      784
    ],
    "accessory": [
      53.66,
      48.02,
      0.797
    ]
  },
  "adult-dog": {
    "image": "/world/bond-055-01/adult-dog.png",
    "width": 1199,
    "height": 1312,
    "crop": [
      51,
      -2,
      1168,
      1322
    ],
    "accessory": [
      30.37,
      38.16,
      0.71
    ],
    "glasses": [
      34,
      10,
      9,
      4,
      -6
    ]
  },
  "adult-dragon-black": {
    "image": "/world/bond-055-01/adult-dragon-black.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      5,
      -19,
      1549,
      1060
    ],
    "accessory": [
      31.13,
      60.13,
      0.679
    ]
  },
  "adult-dragon-blue": {
    "image": "/world/bond-055-01/adult-dragon-blue.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      10,
      -18,
      1549,
      1058
    ],
    "accessory": [
      30.79,
      60.26,
      0.68
    ]
  },
  "adult-dragon-crown": {
    "image": "/world/bond-055-01/adult-dragon-crown.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      5,
      -17,
      1552,
      1056
    ],
    "accessory": [
      31.05,
      60.17,
      0.677
    ]
  },
  "adult-dragon-glowing": {
    "image": "/world/bond-055-01/adult-dragon-glowing.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      6,
      -20,
      1552,
      1063
    ],
    "accessory": [
      30.96,
      60.17,
      0.678
    ]
  },
  "adult-dragon-gold": {
    "image": "/world/bond-055-01/adult-dragon-gold.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      8,
      -19,
      1550,
      1060
    ],
    "accessory": [
      30.98,
      60.09,
      0.678
    ]
  },
  "adult-dragon-green": {
    "image": "/world/bond-055-01/adult-dragon-green.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      8,
      -16,
      1546,
      1056
    ],
    "accessory": [
      31.02,
      60.08,
      0.679
    ]
  },
  "adult-dragon-red": {
    "image": "/world/bond-055-01/adult-dragon-red.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      -4,
      -19,
      1562,
      1059
    ],
    "accessory": [
      31.43,
      60.25,
      0.673
    ]
  },
  "adult-eagle": {
    "image": "/world/bond-055-01/adult-eagle.png",
    "width": 1224,
    "height": 1285,
    "crop": [
      109,
      12,
      1111,
      1256
    ],
    "accessory": [
      40.11,
      91.54,
      0.566
    ]
  },
  "adult-elephant": {
    "image": "/world/bond-055-01/adult-elephant.png",
    "width": 1374,
    "height": 1145,
    "crop": [
      9,
      29,
      1379,
      1094
    ],
    "accessory": [
      21,
      14,
      0.6
    ]
  },
  "adult-fox": {
    "image": "/world/bond-055-01/adult-fox.png",
    "width": 1383,
    "height": 1137,
    "crop": [
      4,
      -17,
      1387,
      1162
    ],
    "accessory": [
      24.96,
      40.41,
      0.682
    ]
  },
  "adult-panda": {
    "image": "/world/bond-055-01/adult-panda.png",
    "width": 1215,
    "height": 1295,
    "crop": [
      -17,
      -17,
      1251,
      1321
    ],
    "accessory": [
      55.94,
      45.16,
      0.847
    ]
  },
  "adult-rabbit": {
    "image": "/world/bond-055-01/adult-rabbit.png",
    "width": 1216,
    "height": 1294,
    "crop": [
      112,
      -14,
      1115,
      1306
    ],
    "accessory": [
      44,
      34,
      0.55
    ]
  },
  "adult-tiger": {
    "image": "/world/bond-055-01/adult-tiger.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      95,
      -18,
      1460,
      1046
    ],
    "accessory": [
      23.04,
      40.13,
      0.671
    ]
  },
  "adult-unicorn": {
    "image": "/world/bond-055-01/adult-unicorn.png",
    "width": 1312,
    "height": 1199,
    "crop": [
      39,
      -3,
      1289,
      1200
    ],
    "accessory": [
      21.44,
      18.53,
      0.6
    ]
  },
  "adult-whale": {
    "image": "/world/bond-055-01/adult-whale.png",
    "width": 1774,
    "height": 887,
    "crop": [
      -2,
      -9,
      1795,
      911
    ],
    "accessory": [
      48.9,
      63.75,
      0.675
    ]
  },
  "cat-ginger": {
    "image": "/world/bond-055-01/cat-ginger.png",
    "width": 1312,
    "height": 1199,
    "crop": [
      135,
      -14,
      1185,
      1219
    ],
    "accessory": [
      37,
      65,
      1
    ]
  },
  "cat-gray": {
    "image": "/world/bond-055-02/cat-gray.png",
    "width": 1312,
    "height": 1199,
    "crop": [
      155,
      -13,
      1174,
      1216
    ],
    "accessory": [
      37,
      65,
      1
    ]
  },
  "crocodile": {
    "image": "/world/bond-055-02/crocodile.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      19,
      58,
      1536,
      918
    ],
    "accessory": [
      57.75,
      51.85,
      0.841
    ]
  },
  "dog": {
    "image": "/world/bond-055-02/dog.png",
    "width": 1227,
    "height": 1282,
    "crop": [
      -18,
      23,
      1264,
      1248
    ],
    "accessory": [
      40.95,
      60.96,
      0.888
    ],
    "glasses": [
      40,
      28,
      17,
      10,
      12
    ]
  },
  "dragon-baby": {
    "image": "/world/bond-055-02/dragon-baby.png",
    "width": 1312,
    "height": 1199,
    "crop": [
      64,
      -2,
      1261,
      1174
    ],
    "accessory": [
      30.06,
      64.91,
      0.807
    ]
  },
  "dragon-black": {
    "image": "/world/bond-055-02/dragon-black.png",
    "width": 1312,
    "height": 1199,
    "crop": [
      -20,
      -18,
      1352,
      1230
    ],
    "accessory": [
      29.4,
      63.42,
      0.849
    ]
  },
  "dragon-blue": {
    "image": "/world/bond-055-02/dragon-blue.png",
    "width": 1312,
    "height": 1199,
    "crop": [
      26,
      -17,
      1298,
      1228
    ],
    "accessory": [
      27.14,
      63.44,
      0.883
    ]
  },
  "dragon-crown": {
    "image": "/world/bond-055-02/dragon-crown.png",
    "width": 1312,
    "height": 1199,
    "crop": [
      10,
      -5,
      1322,
      1205
    ],
    "accessory": [
      27.74,
      63.71,
      0.869
    ]
  },
  "dragon-glowing": {
    "image": "/world/bond-055-02/dragon-glowing.png",
    "width": 1312,
    "height": 1199,
    "crop": [
      -6,
      -15,
      1333,
      1215
    ],
    "accessory": [
      28.84,
      63.98,
      0.861
    ]
  },
  "dragon-gold": {
    "image": "/world/bond-055-02/dragon-gold.png",
    "width": 1312,
    "height": 1199,
    "crop": [
      -16,
      -20,
      1346,
      1220
    ],
    "accessory": [
      29.27,
      64.07,
      0.854
    ]
  },
  "dragon-green": {
    "image": "/world/bond-055-02/dragon-green.png",
    "width": 1312,
    "height": 1199,
    "crop": [
      50,
      -15,
      1280,
      1229
    ],
    "accessory": [
      25.61,
      63.23,
      0.897
    ]
  },
  "dragon-red": {
    "image": "/world/bond-055-02/dragon-red.png",
    "width": 1312,
    "height": 1199,
    "crop": [
      31,
      -16,
      1298,
      1213
    ],
    "accessory": [
      26.85,
      64.1,
      0.881
    ]
  },
  "eagle": {
    "image": "/world/bond-055-02/eagle.png",
    "width": 1312,
    "height": 1199,
    "crop": [
      99,
      -18,
      1196,
      1232
    ],
    "accessory": [
      42.9,
      89.07,
      0.529
    ]
  },
  "elephant": {
    "image": "/world/bond-055-02/elephant.png",
    "width": 1312,
    "height": 1199,
    "crop": [
      1,
      23,
      1309,
      1173
    ],
    "accessory": [
      45.33,
      25.87,
      0.833
    ]
  },
  "fox": {
    "image": "/world/bond-055-02/fox.png",
    "width": 1312,
    "height": 1199,
    "crop": [
      145,
      -20,
      1171,
      1207
    ],
    "accessory": [
      35.45,
      60.46,
      0.872
    ]
  },
  "panda": {
    "image": "/world/bond-055-02/panda.png",
    "width": 1312,
    "height": 1199,
    "crop": [
      173,
      -10,
      994,
      1213
    ],
    "accessory": [
      50.28,
      63.68,
      0.979
    ]
  },
  "rabbit": {
    "image": "/world/bond-055-02/rabbit.png",
    "width": 1227,
    "height": 1282,
    "crop": [
      119,
      -9,
      1123,
      1290
    ],
    "accessory": [
      66,
      34,
      0.7
    ]
  },
  "tiger": {
    "image": "/world/bond-055-02/tiger.png",
    "width": 1312,
    "height": 1199,
    "crop": [
      165,
      -12,
      1165,
      1223
    ],
    "accessory": [
      37.89,
      60.84,
      0.93
    ]
  },
  "unicorn": {
    "image": "/world/bond-055-02/unicorn.png",
    "width": 1312,
    "height": 1199,
    "crop": [
      134,
      7,
      1195,
      1179
    ],
    "accessory": [
      30.14,
      22.88,
      0.619
    ]
  },
  "whale": {
    "image": "/world/bond-055-02/whale.png",
    "width": 1585,
    "height": 992,
    "crop": [
      -11,
      -4,
      1618,
      1005
    ],
    "accessory": [
      46.91,
      62.55,
      0.692
    ]
  }
};
export function companionBodyKey(itemId:string,equipment:Equipment={},image?:string|null){
 const base=companionSpriteKey(itemId,image);if(!base)return undefined;
 if(!/^(adult-)?cat-/.test(base))return base;
 const prefix=base.startsWith('adult-')?'adult-':'';
 if(equipment.coat==='cat-cheese')return prefix+'cat-ginger';
 if(equipment.coat==='cat-gray'||equipment.coat==='cat-ivory')return prefix+'cat-ivory';
 return base;
}
export function companionSpecialKey(itemId:string,equipment:Equipment={}){
 const base=companionBodyKey(itemId,equipment);if(!base)return undefined;
 return equipment.coat==='cat-gray'&&/^(adult-)?cat-/.test(base)?base.replace(/cat-[^-]+$/,'cat-gray'):base;
}
export function companionSpecialArt(itemId:string,equipment:Equipment={}){
 const key=companionSpecialKey(itemId,equipment);return key?COMPANION_SPECIAL_FORMS[key]:undefined;
}
