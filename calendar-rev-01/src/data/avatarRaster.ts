export type RasterKey='male-clean'|'female-clean'|'hair-short'|'hair-bob'|'shirt-blue'|'sweater-peach'|'shorts-cream'|'trousers-charcoal'|'sneakers-white'|'boots-brown'|'eyes-open';
export interface RasterAsset {image:string;width:number;height:number;crop:[number,number,number,number]}
// Filled from each image's real canvas and opaque bounds; original PNGs are unmodified.
export const RASTER_ASSETS={
  "male-clean": {
    "image": "/world/avatar-v3/male-clean.png",
    "width": 1024,
    "height": 1536,
    "crop": [
      161,
      49,
      697,
      1430
    ]
  },
  "female-clean": {
    "image": "/world/avatar-v3/female-clean.png",
    "width": 1024,
    "height": 1536,
    "crop": [
      167,
      38,
      687,
      1461
    ]
  },
  "hair-short": {
    "image": "/world/avatar-v3/hair-short.png",
    "width": 1376,
    "height": 1143,
    "crop": [
      99,
      108,
      1201,
      820
    ]
  },
  "hair-bob": {
    "image": "/world/avatar-v3/hair-bob.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      238,
      70,
      1061,
      831
    ]
  },
  "shirt-blue": {
    "image": "/world/avatar-v3/shirt-blue.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      209,
      104,
      1118,
      823
    ]
  },
  "sweater-peach": {
    "image": "/world/avatar-v3/sweater-peach.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      120,
      142,
      1295,
      726
    ]
  },
  "shorts-cream": {
    "image": "/world/avatar-v3/shorts-cream.png",
    "width": 1536,
    "height": 1024,
    "crop": [
      155,
      125,
      1222,
      770
    ]
  },
  "trousers-charcoal": {
    "image": "/world/avatar-v3/trousers-charcoal.png",
    "width": 1278,
    "height": 1230,
    "crop": [
      283,
      128,
      713,
      995
    ]
  },
  "sneakers-white": {
    "image": "/world/avatar-v3/sneakers-white.png",
    "width": 1774,
    "height": 887,
    "crop": [
      269,
      208,
      1236,
      511
    ]
  },
  "boots-brown": {
    "image": "/world/avatar-v3/boots-brown.png",
    "width": 1774,
    "height": 887,
    "crop": [
      368,
      280,
      1038,
      413
    ]
  },
  "eyes-open": {
    "image": "/world/avatar-v3/eyes-open.png",
    "width": 1774,
    "height": 887,
    "crop": [
      268,
      213,
      1238,
      549
    ]
  }
} as Record<RasterKey,RasterAsset>;
