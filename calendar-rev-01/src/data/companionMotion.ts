/** Native source masks: only the free-standing tail moves; paws and body stay anchored. */
export const COMPANION_TAIL_RIGS:Record<string,{path:string;origin:[number,number];duration:number}>={
 'cat-ivory':{path:'M970 645H1312V1199H930V1095Q1010 1020 960 930Q940 840 970 780Z',origin:[965,1090],duration:7.2},
 'cat-ginger':{path:'M970 645H1312V1199H930V1095Q1010 1020 960 930Q940 840 970 780Z',origin:[965,1090],duration:7.2},
 dog:{path:'M950 740H1227V1282H930V1120Q1020 1000 950 900Z',origin:[995,1100],duration:5.6},
};
export function companionIdleKind(id:string){return /whale/.test(id)?'float':'breathe';}

export interface CompanionPartRig {id:string;path:string;origin:[number,number];duration:number;angle?:number;transform?:string}
/** New artwork registers only the appendages that can move without exposing the body. */
export const COMPANION_PART_RIGS:Record<string,CompanionPartRig[]>={
  "panda": [],
  "fox": [
    {
      "id": "tail",
      "path": "M860 520H1312V1199H800V1030Q870 900 830 780L860 700Z",
      "origin": [
        820,
        1040
      ],
      "duration": 7.5,
      "angle": 1.7
    }
  ],
  "tiger": [
    {
      "id": "tail",
      "path": "M980 610H1312V1199H980V1120Q1060 1000 1080 850L1000 800Q1000 730 980 710Z",
      "origin": [
        1030,
        1100
      ],
      "duration": 8.2,
      "angle": 1.7
    }
  ],
  "elephant": [
    {
      "id": "tail-tuft",
      "path": "M1110 770H1312V990H1070V860Q1100 850 1110 770Z",
      "origin": [
        1075,
        850
      ],
      "duration": 8.8,
      "angle": 1.8
    }
  ],
  "crocodile": [
    {
      "id": "tail",
      "path": "M1130 280H1536V1024H1100V850Q1160 750 1130 650Z",
      "origin": [
        1120,
        830
      ],
      "duration": 8.5,
      "angle": 1.2
    }
  ],
  "eagle": [
    {
      "id": "feathers",
      "path": "M1015 825H1312V1140H985V1040Z",
      "origin": [
        1010,
        1020
      ],
      "duration": 7.8,
      "angle": 1
    }
  ],
  "whale": [
    {
      "id": "flukes",
      "path": "M1080 0H1700V570H1250Q1180 440 1080 310Z",
      "origin": [
        1260,
        500
      ],
      "duration": 7,
      "angle": 1.2
    }
  ],
  "unicorn": [
    {
      "id": "tail",
      "path": "M930 580H1312V1199H1050V990Q1000 850 930 760Z",
      "origin": [
        930,
        690
      ],
      "duration": 8.4,
      "angle": 1.4
    },
    {
      "id": "mane",
      "path": "M700 470L840 450V760H710Q760 630 700 570Z",
      "origin": [
        720,
        530
      ],
      "duration": 9.4,
      "angle": 0.6
    }
  ],
  "rabbit": [
    {
      "id": "ear",
      "path": "M770 420L930 150H1227V380L850 550Z",
      "origin": [
        815,
        505
      ],
      "duration": 9,
      "angle": 0.7
    }
  ],
  "dragon-red": [
    {
      "id": "tail",
      "path": "M1000 480H1312V1199H980V1110Q1120 1040 1140 900L1150 800L1100 720L1040 650Z",
      "origin": [
        1000,
        1120
      ],
      "duration": 8.4,
      "angle": 1.2
    }
  ],
  "dragon-gold": [
    {
      "id": "tail",
      "path": "M1000 480H1312V1199H980V1110Q1120 1040 1140 900L1150 800L1100 720L1040 650Z",
      "origin": [
        1001.4893784421714,
        1121.685169842585
      ],
      "duration": 8.4,
      "angle": 1.2,
      "transform": "matrix(1.004720692368214 0 0 1.004142502071251 -3.231313926042482 -2.954432477216237)"
    }
  ],
  "dragon-blue": [
    {
      "id": "tail",
      "path": "M1000 480H1312V1199H980V1110Q1120 1040 1140 900L1150 800L1100 720L1040 650Z",
      "origin": [
        1000.2446892210859,
        1121.7481358740679
      ],
      "duration": 8.4,
      "angle": 1.2,
      "transform": "matrix(1.002360346184107 0 0 1.0033140016570008 -2.1156569630212445 -1.9635459817729917)"
    }
  ],
  "dragon-green": [
    {
      "id": "tail",
      "path": "M1000 480H1312V1199H980V1110Q1120 1040 1140 900L1150 800L1100 720L1040 650Z",
      "origin": [
        1000.7411487018096,
        1121.7481358740679
      ],
      "duration": 8.4,
      "angle": 1.2,
      "transform": "matrix(1.003933910306845 0 0 1.0033140016570008 -3.1927616050354004 -1.9635459817729917)"
    }
  ],
  "dragon-black": [
    {
      "id": "tail",
      "path": "M1000 480H1312V1199H980V1110Q1120 1040 1140 900L1150 800L1100 720L1040 650Z",
      "origin": [
        999.9929189614477,
        1121.7481358740679
      ],
      "duration": 8.4,
      "angle": 1.2,
      "transform": "matrix(1.003147128245476 0 0 1.0033140016570008 -3.154209284028326 -1.9635459817729917)"
    }
  ],
  "dragon-glowing": [
    {
      "id": "tail",
      "path": "M1000 480H1312V1199H980V1110Q1120 1040 1140 900L1150 800L1100 720L1040 650Z",
      "origin": [
        1000.9929189614477,
        1121.811101905551
      ],
      "duration": 8.4,
      "angle": 1.2,
      "transform": "matrix(1.003147128245476 0 0 1.0024855012427507 -2.154209284028326 -0.9726594863297429)"
    }
  ],
  "dragon-crown": [
    {
      "id": "tail",
      "path": "M1000 480H1312V1199H980V1110Q1120 1040 1140 900L1150 800L1100 720L1040 650Z",
      "origin": [
        999.7411487018096,
        1122.685169842585
      ],
      "duration": 8.4,
      "angle": 1.2,
      "transform": "matrix(1.003933910306845 0 0 1.004142502071251 -4.1927616050354 -1.954432477216237)"
    }
  ],
  "dragon-baby": [],
  "adult-cat-ivory": [
    {
      "id": "tail",
      "path": "M860 600H1233V1276H790V1110Q860 1150 865 1050Z",
      "origin": [
        860,
        1120
      ],
      "duration": 8.8,
      "angle": 1
    }
  ],
  "adult-cat-ginger": [
    {
      "id": "tail",
      "path": "M860 600H1233V1276H790V1110Q860 1150 865 1050Z",
      "origin": [
        860,
        1120
      ],
      "duration": 8.8,
      "angle": 1
    }
  ],
  "adult-dog": [
    {
      "id": "tail",
      "path": "M900 930H1199V1312H970V1190Q935 1130 880 1120Z",
      "origin": [
        900,
        1110
      ],
      "duration": 7.5,
      "angle": 1
    }
  ],
  "adult-rabbit": [],
  "adult-panda": [],
  "adult-fox": [
    {
      "id": "tail",
      "path": "M900 470H1383V1137H900V800L850 600Z",
      "origin": [
        875,
        590
      ],
      "duration": 9,
      "angle": 1
    }
  ],
  "adult-tiger": [
    {
      "id": "tail",
      "path": "M1290 440H1536V820H1300L1240 700Z",
      "origin": [
        1280,
        690
      ],
      "duration": 10,
      "angle": 0.9
    }
  ],
  "adult-elephant": [
    {
      "id": "tail-tuft",
      "path": "M1290 530H1374V1040H1290L1260 850Z",
      "origin": [
        1290,
        730
      ],
      "duration": 10.5,
      "angle": 0.8
    }
  ],
  "adult-crocodile": [
    {
      "id": "tail",
      "path": "M1220 500H1536V950H1250L1180 690Z",
      "origin": [
        1210,
        660
      ],
      "duration": 11,
      "angle": 0.6
    }
  ],
  "adult-eagle": [
    {
      "id": "feathers",
      "path": "M860 950L1224 1030V1285H840L780 1100Z",
      "origin": [
        850,
        1040
      ],
      "duration": 9,
      "angle": 0.6
    }
  ],
  "adult-whale": [
    {
      "id": "flukes",
      "path": "M1340 0H1774V350L1460 450L1370 340Z",
      "origin": [
        1440,
        370
      ],
      "duration": 10,
      "angle": 0.65
    }
  ],
  "adult-unicorn": [
    {
      "id": "tail",
      "path": "M1000 530H1312V1199H1050L1010 850L940 650Z",
      "origin": [
        980,
        600
      ],
      "duration": 9.5,
      "angle": 0.7
    }
  ],
  "adult-dragon-red": [
    {
      "id": "tail-tip",
      "path": "M1340 320H1536V940H1300L1250 820Q1410 720 1340 620Z",
      "origin": [
        1330,
        810
      ],
      "duration": 11,
      "angle": 0.6
    }
  ],
  "adult-dragon-gold": [
    {
      "id": "tail-tip",
      "path": "M1340 320H1536V940H1300L1250 820Q1410 720 1340 620Z",
      "origin": [
        1330,
        810
      ],
      "duration": 11,
      "angle": 0.6
    }
  ],
  "adult-dragon-blue": [
    {
      "id": "tail-tip",
      "path": "M1340 320H1536V940H1300L1250 820Q1410 720 1340 620Z",
      "origin": [
        1330,
        810
      ],
      "duration": 11,
      "angle": 0.6
    }
  ],
  "adult-dragon-green": [
    {
      "id": "tail-tip",
      "path": "M1340 320H1536V940H1300L1250 820Q1410 720 1340 620Z",
      "origin": [
        1330,
        810
      ],
      "duration": 11,
      "angle": 0.6
    }
  ],
  "adult-dragon-black": [
    {
      "id": "tail-tip",
      "path": "M1340 320H1536V940H1300L1250 820Q1410 720 1340 620Z",
      "origin": [
        1330,
        810
      ],
      "duration": 11,
      "angle": 0.6
    }
  ],
  "adult-dragon-glowing": [
    {
      "id": "tail-tip",
      "path": "M1340 320H1536V940H1300L1250 820Q1410 720 1340 620Z",
      "origin": [
        1330,
        810
      ],
      "duration": 11,
      "angle": 0.6
    }
  ],
  "adult-dragon-crown": [
    {
      "id": "tail-tip",
      "path": "M1340 320H1536V940H1300L1250 820Q1410 720 1340 620Z",
      "origin": [
        1330,
        810
      ],
      "duration": 11,
      "angle": 0.6
    }
  ]
};
export function companionParts(key:string):CompanionPartRig[]{
 if(COMPANION_PART_RIGS[key])return COMPANION_PART_RIGS[key];
 const tail=COMPANION_TAIL_RIGS[key];return tail?[{id:'tail',...tail}]:[];
}
