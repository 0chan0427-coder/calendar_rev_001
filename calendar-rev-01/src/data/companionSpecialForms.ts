import {companionSpriteKey} from './companionCatalog';
import type {Equipment} from './wardrobe';
export interface CompanionSpecialArt {image:string;width:number;height:number;crop:[number,number,number,number];accessory:[number,number,number];glasses?:[number,number,number,number,number];palette?:number}
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
  },
  "wolf": {
    "image": "/world/pets-062-01/wolf.png",
    "width": 616,
    "height": 640,
    "crop": [
      69,
      6,
      494,
      599
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 0
  },
  "adult-wolf": {
    "image": "/world/pets-062-01/adult-wolf.png",
    "width": 640,
    "height": 585,
    "crop": [
      37,
      0,
      588,
      562
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 0
  },
  "bear": {
    "image": "/world/pets-062-01/bear.png",
    "width": 640,
    "height": 585,
    "crop": [
      49,
      4,
      542,
      575
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 1
  },
  "adult-bear": {
    "image": "/world/pets-062-01/adult-bear.png",
    "width": 640,
    "height": 593,
    "crop": [
      37,
      6,
      572,
      576
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 1
  },
  "lion": {
    "image": "/world/pets-062-01/lion.png",
    "width": 640,
    "height": 617,
    "crop": [
      89,
      36,
      468,
      527
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 2
  },
  "adult-lion": {
    "image": "/world/pets-062-01/adult-lion.png",
    "width": 640,
    "height": 530,
    "crop": [
      20,
      0,
      616,
      515
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 2
  },
  "leopard": {
    "image": "/world/pets-062-01/leopard.png",
    "width": 640,
    "height": 585,
    "crop": [
      27,
      38,
      576,
      511
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 3
  },
  "adult-leopard": {
    "image": "/world/pets-062-01/adult-leopard.png",
    "width": 640,
    "height": 427,
    "crop": [
      61,
      0,
      564,
      424
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 3
  },
  "deer": {
    "image": "/world/pets-062-01/deer.png",
    "width": 615,
    "height": 640,
    "crop": [
      77,
      0,
      435,
      624
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 0
  },
  "adult-deer": {
    "image": "/world/pets-062-01/adult-deer.png",
    "width": 616,
    "height": 640,
    "crop": [
      54,
      0,
      493,
      629
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 0
  },
  "horse": {
    "image": "/world/pets-062-01/horse.png",
    "width": 603,
    "height": 640,
    "crop": [
      50,
      0,
      511,
      611
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 1
  },
  "adult-horse": {
    "image": "/world/pets-062-01/adult-horse.png",
    "width": 614,
    "height": 640,
    "crop": [
      43,
      12,
      547,
      605
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 1
  },
  "griffin": {
    "image": "/world/pets-062-01/griffin.png",
    "width": 640,
    "height": 585,
    "crop": [
      46,
      15,
      544,
      556
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 2
  },
  "adult-griffin": {
    "image": "/world/pets-062-01/adult-griffin.png",
    "width": 640,
    "height": 503,
    "crop": [
      5,
      1,
      629,
      494
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 2
  },
  "phoenix": {
    "image": "/world/pets-062-01/phoenix.png",
    "width": 640,
    "height": 427,
    "crop": [
      73,
      0,
      531,
      414
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 3
  },
  "adult-phoenix": {
    "image": "/world/pets-062-01/adult-phoenix.png",
    "width": 640,
    "height": 585,
    "crop": [
      0,
      0,
      623,
      579
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 3
  },
  "owl": {
    "image": "/world/pets-062-01/owl.png",
    "width": 612,
    "height": 640,
    "crop": [
      66,
      0,
      468,
      640
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 0
  },
  "adult-owl": {
    "image": "/world/pets-062-01/adult-owl.png",
    "width": 599,
    "height": 640,
    "crop": [
      30,
      1,
      514,
      637
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 0
  },
  "penguin": {
    "image": "/world/pets-062-01/penguin.png",
    "width": 587,
    "height": 640,
    "crop": [
      55,
      2,
      430,
      636
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 1
  },
  "adult-penguin": {
    "image": "/world/pets-062-01/adult-penguin.png",
    "width": 427,
    "height": 640,
    "crop": [
      25,
      10,
      364,
      625
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 1
  },
  "seal": {
    "image": "/world/pets-062-02/seal.png",
    "width": 640,
    "height": 427,
    "crop": [
      26,
      48,
      609,
      341
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 2
  },
  "adult-seal": {
    "image": "/world/pets-062-02/adult-seal.png",
    "width": 640,
    "height": 320,
    "crop": [
      14,
      0,
      615,
      320
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 2
  },
  "otter": {
    "image": "/world/pets-062-02/otter.png",
    "width": 640,
    "height": 427,
    "crop": [
      7,
      36,
      614,
      357
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 3
  },
  "adult-otter": {
    "image": "/world/pets-062-02/adult-otter.png",
    "width": 640,
    "height": 427,
    "crop": [
      28,
      18,
      584,
      393
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 3
  },
  "turtle": {
    "image": "/world/pets-062-02/turtle.png",
    "width": 640,
    "height": 427,
    "crop": [
      62,
      30,
      533,
      371
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 0
  },
  "adult-turtle": {
    "image": "/world/pets-062-02/adult-turtle.png",
    "width": 640,
    "height": 427,
    "crop": [
      18,
      14,
      608,
      404
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 0
  },
  "octopus": {
    "image": "/world/pets-062-02/octopus.png",
    "width": 640,
    "height": 585,
    "crop": [
      35,
      36,
      574,
      516
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 1
  },
  "adult-octopus": {
    "image": "/world/pets-062-02/adult-octopus.png",
    "width": 640,
    "height": 427,
    "crop": [
      26,
      0,
      589,
      427
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 1
  },
  "shark": {
    "image": "/world/pets-062-02/shark.png",
    "width": 640,
    "height": 427,
    "crop": [
      23,
      29,
      607,
      376
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 2
  },
  "adult-shark": {
    "image": "/world/pets-062-02/adult-shark.png",
    "width": 640,
    "height": 320,
    "crop": [
      0,
      1,
      640,
      312
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 2
  },
  "ray": {
    "image": "/world/pets-062-02/ray.png",
    "width": 640,
    "height": 427,
    "crop": [
      11,
      20,
      620,
      370
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 3
  },
  "adult-ray": {
    "image": "/world/pets-062-02/adult-ray.png",
    "width": 640,
    "height": 327,
    "crop": [
      4,
      2,
      635,
      322
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 3
  },
  "hedgehog": {
    "image": "/world/pets-062-02/hedgehog.png",
    "width": 640,
    "height": 480,
    "crop": [
      40,
      36,
      531,
      410
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 0
  },
  "adult-hedgehog": {
    "image": "/world/pets-062-02/adult-hedgehog.png",
    "width": 640,
    "height": 427,
    "crop": [
      22,
      2,
      582,
      422
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 0
  },
  "snake": {
    "image": "/world/pets-062-02/snake.png",
    "width": 640,
    "height": 427,
    "crop": [
      85,
      11,
      480,
      407
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 1
  },
  "adult-snake": {
    "image": "/world/pets-062-02/adult-snake.png",
    "width": 640,
    "height": 585,
    "crop": [
      17,
      21,
      609,
      542
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 1
  },
  "rhino": {
    "image": "/world/pets-062-02/rhino.png",
    "width": 640,
    "height": 595,
    "crop": [
      30,
      26,
      582,
      541
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 2
  },
  "adult-rhino": {
    "image": "/world/pets-062-02/adult-rhino.png",
    "width": 640,
    "height": 427,
    "crop": [
      28,
      0,
      588,
      420
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 2
  },
  "hippo": {
    "image": "/world/pets-062-02/hippo.png",
    "width": 640,
    "height": 520,
    "crop": [
      25,
      30,
      585,
      465
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 3
  },
  "adult-hippo": {
    "image": "/world/pets-062-02/adult-hippo.png",
    "width": 640,
    "height": 427,
    "crop": [
      11,
      3,
      601,
      422
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 3
  },
  "giraffe": {
    "image": "/world/pets-062-03/giraffe.png",
    "width": 459,
    "height": 640,
    "crop": [
      39,
      2,
      382,
      636
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 0
  },
  "adult-giraffe": {
    "image": "/world/pets-062-03/adult-giraffe.png",
    "width": 427,
    "height": 640,
    "crop": [
      44,
      0,
      340,
      634
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 0
  },
  "zebra": {
    "image": "/world/pets-062-03/zebra.png",
    "width": 629,
    "height": 640,
    "crop": [
      71,
      0,
      474,
      636
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 1
  },
  "adult-zebra": {
    "image": "/world/pets-062-03/adult-zebra.png",
    "width": 640,
    "height": 585,
    "crop": [
      69,
      0,
      494,
      571
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 1
  },
  "gorilla": {
    "image": "/world/pets-062-03/gorilla.png",
    "width": 608,
    "height": 640,
    "crop": [
      48,
      13,
      527,
      619
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 2
  },
  "adult-gorilla": {
    "image": "/world/pets-062-03/adult-gorilla.png",
    "width": 640,
    "height": 585,
    "crop": [
      6,
      0,
      621,
      581
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 2
  },
  "orangutan": {
    "image": "/world/pets-062-03/orangutan.png",
    "width": 640,
    "height": 605,
    "crop": [
      45,
      10,
      520,
      593
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 3
  },
  "adult-orangutan": {
    "image": "/world/pets-062-03/adult-orangutan.png",
    "width": 640,
    "height": 585,
    "crop": [
      5,
      1,
      629,
      578
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 3
  },
  "sloth": {
    "image": "/world/pets-062-03/sloth.png",
    "width": 640,
    "height": 600,
    "crop": [
      21,
      20,
      564,
      567
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 0
  },
  "adult-sloth": {
    "image": "/world/pets-062-03/adult-sloth.png",
    "width": 640,
    "height": 585,
    "crop": [
      16,
      7,
      604,
      570
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 0
  },
  "koala": {
    "image": "/world/pets-062-03/koala.png",
    "width": 640,
    "height": 616,
    "crop": [
      34,
      18,
      544,
      581
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 1
  },
  "adult-koala": {
    "image": "/world/pets-062-03/adult-koala.png",
    "width": 640,
    "height": 549,
    "crop": [
      31,
      3,
      556,
      543
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 1
  },
  "kangaroo": {
    "image": "/world/pets-062-03/kangaroo.png",
    "width": 640,
    "height": 585,
    "crop": [
      50,
      0,
      561,
      572
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 2
  },
  "adult-kangaroo": {
    "image": "/world/pets-062-03/adult-kangaroo.png",
    "width": 640,
    "height": 585,
    "crop": [
      59,
      0,
      555,
      574
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 2
  },
  "raccoon": {
    "image": "/world/pets-062-03/raccoon.png",
    "width": 640,
    "height": 480,
    "crop": [
      12,
      6,
      605,
      461
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 3
  },
  "adult-raccoon": {
    "image": "/world/pets-062-03/adult-raccoon.png",
    "width": 640,
    "height": 427,
    "crop": [
      44,
      1,
      566,
      425
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 3
  },
  "redpanda": {
    "image": "/world/pets-062-03/redpanda.png",
    "width": 640,
    "height": 427,
    "crop": [
      33,
      17,
      579,
      388
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 0
  },
  "adult-redpanda": {
    "image": "/world/pets-062-03/adult-redpanda.png",
    "width": 640,
    "height": 427,
    "crop": [
      15,
      5,
      615,
      408
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 0
  },
  "squirrel": {
    "image": "/world/pets-062-03/squirrel.png",
    "width": 640,
    "height": 513,
    "crop": [
      17,
      14,
      609,
      475
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 1
  },
  "adult-squirrel": {
    "image": "/world/pets-062-03/adult-squirrel.png",
    "width": 640,
    "height": 549,
    "crop": [
      16,
      5,
      611,
      522
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 1
  },
  "bat": {
    "image": "/world/pets-062-04/bat.png",
    "width": 640,
    "height": 427,
    "crop": [
      67,
      5,
      507,
      407
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 2
  },
  "adult-bat": {
    "image": "/world/pets-062-04/adult-bat.png",
    "width": 640,
    "height": 427,
    "crop": [
      25,
      0,
      589,
      416
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 2
  },
  "peacock": {
    "image": "/world/pets-062-04/peacock.png",
    "width": 640,
    "height": 550,
    "crop": [
      72,
      3,
      519,
      534
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 3
  },
  "adult-peacock": {
    "image": "/world/pets-062-04/adult-peacock.png",
    "width": 640,
    "height": 600,
    "crop": [
      38,
      1,
      602,
      591
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 3
  },
  "flamingo": {
    "image": "/world/pets-062-04/flamingo.png",
    "width": 569,
    "height": 640,
    "crop": [
      90,
      4,
      385,
      632
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 0
  },
  "adult-flamingo": {
    "image": "/world/pets-062-04/adult-flamingo.png",
    "width": 554,
    "height": 640,
    "crop": [
      78,
      3,
      398,
      635
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 0
  },
  "crane": {
    "image": "/world/pets-062-04/crane.png",
    "width": 602,
    "height": 640,
    "crop": [
      73,
      11,
      428,
      619
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 1
  },
  "adult-crane": {
    "image": "/world/pets-062-04/adult-crane.png",
    "width": 585,
    "height": 640,
    "crop": [
      49,
      7,
      454,
      621
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 1
  },
  "chameleon": {
    "image": "/world/pets-062-04/chameleon.png",
    "width": 640,
    "height": 427,
    "crop": [
      45,
      15,
      547,
      390
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 2
  },
  "adult-chameleon": {
    "image": "/world/pets-062-04/adult-chameleon.png",
    "width": 640,
    "height": 427,
    "crop": [
      26,
      0,
      587,
      427
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 2
  },
  "frog": {
    "image": "/world/pets-062-04/frog.png",
    "width": 640,
    "height": 585,
    "crop": [
      74,
      102,
      473,
      385
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 3
  },
  "adult-frog": {
    "image": "/world/pets-062-04/adult-frog.png",
    "width": 640,
    "height": 427,
    "crop": [
      36,
      12,
      558,
      403
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 3
  },
  "scorpion": {
    "image": "/world/pets-062-04/scorpion.png",
    "width": 640,
    "height": 546,
    "crop": [
      23,
      20,
      593,
      497
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 0
  },
  "adult-scorpion": {
    "image": "/world/pets-062-04/adult-scorpion.png",
    "width": 640,
    "height": 427,
    "crop": [
      28,
      0,
      597,
      419
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 0
  },
  "pegasus": {
    "image": "/world/pets-062-04/pegasus.png",
    "width": 616,
    "height": 640,
    "crop": [
      32,
      27,
      561,
      594
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 1
  },
  "adult-pegasus": {
    "image": "/world/pets-062-04/adult-pegasus.png",
    "width": 640,
    "height": 585,
    "crop": [
      10,
      9,
      623,
      554
    ],
    "accessory": [
      88,
      8,
      0.65
    ],
    "palette": 1
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
