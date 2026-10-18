import type { CollectionItem, Box } from '../data/collection01';
import { collectionAsset, hairLayerMasks } from './avatarCollection';
import type { AssetResolver } from './avatarRaster';
type Point = [
    number,
    number
];
type Matrix = [
    number,
    number,
    number,
    number,
    number,
    number
];
export interface GarmentFit {
    center: number;
    scaleX: number;
    bodyPath: string;
    bands: [
        number,
        number
    ][];
    sleevePath: string;
    shoulder: Point;
    cuff: Point;
    targetCuff: Point;
    backPath: string;
}
const body = 'M440 0H1096V430Q1080 590 1120 750L1170 1100H366L416 750Q456 590 440 430Z';
const sleeve = 'M0 0H480V420Q480 590 485 660L450 1100H0Z';
const neck = (left: number, right: number, y: number, depth: number) => `M${left} 0H${right}V${y}Q${right} ${depth} 768 ${depth}Q${left} ${depth} ${left} ${y}Z`;
/** Registered source landmarks, not positions inferred from an image's bounding rectangle. */
export const GARMENT_FITS: Record<string, GarmentFit> = {
    'top-blouse': { center: 768, scaleX: .43, bodyPath: body, bands: [[157, 585], [335, 652], [870, 965]], sleevePath: sleeve, shoulder: [460, 250], cuff: [225, 690], targetCuff: [294, 862], backPath: neck(568, 970, 157, 333) },
    'top-cable': { center: 768, scaleX: .46, bodyPath: body, bands: [[165, 590], [275, 650], [790, 970]], sleevePath: sleeve, shoulder: [480, 300], cuff: [160, 840], targetCuff: [244, 962], backPath: neck(585, 950, 168, 273) },
    'top-stripe': { center: 768, scaleX: .43, bodyPath: 'M410 0H1126V500L1180 1024H356L410 500Z', bands: [[171, 590], [298, 655], [856, 969]], sleevePath: 'M0 0H460V550L440 1024H0Z', shoulder: [430, 300], cuff: [240, 638], targetCuff: [304, 846], backPath: neck(515, 1020, 175, 296) + ' M90 535Q255 578 397 702L343 732Q213 651 107 575Z M1446 535Q1281 578 1139 702L1193 732Q1323 651 1429 575Z' },
    'top-hoodie': { center: 768, scaleX: .46, bodyPath: body, bands: [[143, 565], [330, 646], [840, 975]], sleevePath: sleeve, shoulder: [480, 340], cuff: [205, 855], targetCuff: [244, 962], backPath: 'M480 0H1056V150Q1010 240 768 328Q526 240 480 150Z' },
    'top-vest': { center: 768, scaleX: .46, bodyPath: body, bands: [[144, 582], [350, 654], [780, 969]], sleevePath: sleeve, shoulder: [480, 270], cuff: [185, 810], targetCuff: [244, 962], backPath: neck(620, 915, 150, 347) },
    'top-rugby': { center: 768, scaleX: .46, bodyPath: body, bands: [[140, 585], [310, 651], [775, 970]], sleevePath: sleeve, shoulder: [470, 300], cuff: [185, 820], targetCuff: [244, 962], backPath: neck(635, 900, 147, 307) },
    'outer-cardigan': { center: 768, scaleX: .48, bodyPath: body, bands: [[140, 583], [320, 662], [870, 1000]], sleevePath: sleeve, shoulder: [490, 300], cuff: [200, 800], targetCuff: [244, 962], backPath: neck(640, 895, 214, 232) },
    'outer-denim': { center: 768, scaleX: .48, bodyPath: body, bands: [[126, 580], [330, 659], [775, 988]], sleevePath: sleeve, shoulder: [480, 270], cuff: [180, 830], targetCuff: [244, 962], backPath: neck(640, 895, 230, 244) },
    'outer-detective': { center: 600, scaleX: .51, bodyPath: 'M345 0H855V390Q825 500 850 650L1040 1312H160L350 650Q375 500 345 390Z', bands: [[70, 583], [260, 677], [1171, 1235]], sleevePath: 'M0 0H380V400L380 580L310 1312H0Z', shoulder: [360, 250], cuff: [120, 820], targetCuff: [244, 962], backPath: 'M490 0H714V140H490Z' },
};
function mappedY(f: GarmentFit, y: number) { let i = 0; while (i < f.bands.length - 2 && y > f.bands[i + 1][0])
    i++; const [a, b] = f.bands[i], [c, d] = f.bands[i + 1]; return b + (y - a) * (d - b) / (c - a); }
function similarity(a: Point, b: Point, c: Point, d: Point): Matrix { const x = b[0] - a[0], y = b[1] - a[1], u = d[0] - c[0], v = d[1] - c[1], den = x * x + y * y, p = (x * u + y * v) / den, q = (x * v - y * u) / den; return [p, q, -q, p, c[0] - p * a[0] + q * a[1], c[1] - q * a[0] - p * a[1]]; }
function matrix(m: Matrix) { return `matrix(${m.join(' ')})`; }
const safe = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
export function fittedGarment(item: CollectionItem | undefined, uid: string, resolve: AssetResolver, alphaId: string, layer: 'front' | 'back', showSleeves = true, onlySleeves = false) {
    const f = item && GARMENT_FITS[item.id];
    if (!item || !f)
        return '';
    const prefix = uid + '-' + item.id + '-' + layer;
    const img = (extra = '') => `<image href="${safe(resolve(item.image))}" width="${item.width}" height="${item.height}" filter="url(#${alphaId})" ${extra}/>`;
    const layerMask = prefix + '-layer', bodyClip = prefix + '-body', sleeveClip = prefix + '-sleeve';
    let defs = `<mask id="${layerMask}" maskUnits="userSpaceOnUse" x="0" y="0" width="${item.width}" height="${item.height}">${layer === 'front' ? `<rect width="${item.width}" height="${item.height}" fill="white"/><path d="${f.backPath}" fill="black"/>` : `<path d="${f.backPath}" fill="white"/>`}</mask><clipPath id="${bodyClip}"><path d="${f.bodyPath}"/></clipPath><clipPath id="${sleeveClip}"><path d="${f.sleevePath}"/></clipPath>`;
    const shoulder: Point = [512 + (f.shoulder[0] - f.center) * f.scaleX, mappedY(f, f.shoulder[1])];
    const left = similarity(f.shoulder, f.cuff, shoulder, f.targetCuff);
    const right: Matrix = [left[0], -left[1], -left[2], left[3], 1024 - left[4] - item.width * left[0], left[5] + item.width * left[1]];
    // The reflected source coordinates are used only for clipping; the right sleeve retains its original texture.
    const rightClip = prefix + '-right';
    defs += `<clipPath id="${rightClip}"><path d="${f.sleevePath}" transform="translate(${item.width} 0) scale(-1 1)"/></clipPath>`;
    const sleeves = `<g data-fit-part="sleeve-left" transform="${matrix(left)}"><g clip-path="url(#${sleeveClip})">${img(`mask="url(#${layerMask})"`)}</g></g><g data-fit-part="sleeve-right" transform="${matrix(right)}"><g clip-path="url(#${rightClip})">${img(`mask="url(#${layerMask})"`)}</g></g>`;
    let bodice = '';
    for (let i = 0; i < f.bands.length - 1; i++) {
        const [src0, dst0] = f.bands[i], [src1, dst1] = f.bands[i + 1], sy = (dst1 - dst0) / (src1 - src0), y0 = i === 0 ? 0 : src0, y1 = i === f.bands.length - 2 ? item.height : src1;
        const clip = prefix + '-band' + i;
        defs += `<clipPath id="${clip}"><rect x="0" y="${y0 - .2}" width="${item.width}" height="${y1 - y0 + .4}"/></clipPath>`;
        bodice += `<g data-fit-part="bodice" transform="matrix(${f.scaleX} 0 0 ${sy} ${512 - f.center * f.scaleX} ${dst0 - src0 * sy})"><g clip-path="url(#${bodyClip})"><g clip-path="url(#${clip})">${img(`mask="url(#${layerMask})"`)}</g></g></g>`;
    }
    return `<g data-collection="${item.id}" data-garment-layer="${layer}"><defs>${defs}</defs>${showSleeves ? sleeves : ''}${onlySleeves ? '' : bodice}</g>`;
}
export interface HeadwearFit {
    box?: Box;
    backPath: string;
    headPath?: string;
    frontKeepPath?: string;
}
export const HEADWEAR_FITS: Record<string, HeadwearFit> = {
    'hat-wizard': { backPath: 'M-200 805Q350 800 768 718Q1160 800 1750 805V2500H-200Z', headPath: 'M-1000 805Q350 800 768 718Q1160 800 2500 805V4000H-1000Z' },
    'hat-straw': { backPath: 'M-200 580Q350 650 768 698Q1200 670 1750 585V2500H-200Z', frontKeepPath: 'M990 520L1280 510L1395 805H1025Z', headPath: 'M-1000 580Q350 650 768 698Q1200 670 2500 585V4000H-1000Z' },
    'hat-beret': { backPath: 'M-200 880Q300 865 768 797Q1250 865 1750 880V2500H-200Z', headPath: 'M-1000 880Q300 865 768 797Q1250 865 2500 880V4000H-1000Z' },
    'hat-detective': { backPath: 'M-200 920Q350 930 768 835Q1180 930 1750 920V2500H-200Z', headPath: 'M-1000 760H2500V4000H-1000Z' },
    'hat-cap': { backPath: 'M-200 900Q350 920 768 782Q1180 920 1750 900V2500H-200Z', headPath: 'M-1000 900Q350 920 768 782Q1180 920 2500 900V4000H-1000Z' },
    'hat-cat': { box: [207, -48, 610, 355], backPath: 'M0 500H450V1200H0Z M1086 500H1600V1200H1086Z' },
};
export function headwearDefs(item: CollectionItem | undefined, uid: string) { if (!item)
    return ''; const f = HEADWEAR_FITS[item.id]; if (!f)
    return ''; const [x, y, w, h] = f.box || item.box, [cx, cy, cw, ch] = item.crop; return hairLayerMasks(item.width, item.height, f.backPath, uid + '-hat-back', uid + '-hat-front', f.frontKeepPath) + (f.headPath ? `<clipPath id="${uid}-head-visible"><path d="${f.headPath}" transform="matrix(${w / cw} 0 0 ${h / ch} ${x - cx * w / cw} ${y - cy * h / ch})"/></clipPath>` : ''); }
export function fittedHeadwear(item: CollectionItem | undefined, uid: string, resolve: AssetResolver, alphaId: string, layer: 'front' | 'back') { if (!item)
    return ''; const f = HEADWEAR_FITS[item.id]; return collectionAsset(item, resolve, alphaId, f?.box, undefined, f ? `mask="url(#${uid}-hat-${layer})"` : ''); }
