import {transformation082} from '../data/transformations082';
import type {Equipment} from '../data/wardrobe';
const escape=(s:string)=>s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
/** Complete native forms replace the avatar; their weapons own a wider artboard. */
export function transformationSvg082(e:Equipment,uid:string,resolve:(p:string)=>string):string|undefined{
 const a=transformation082(e.costume);if(!a)return;
 const [x,y,w,h]=a.placement,[vx,vy,vw,vh]=a.frame;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${vw}" height="${vh}" viewBox="${vx} ${vy} ${vw} ${vh}" preserveAspectRatio="xMidYMax meet"><defs><filter id="${uid}-transform-alpha" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncA type="linear" slope="2" intercept="-.8"/></feComponentTransfer></filter></defs><g data-transformation="${a.id}" data-native-proportions="true"><image href="${escape(resolve(a.image))}" x="${x}" y="${y}" width="${w}" height="${h}" filter="url(#${uid}-transform-alpha)"/></g></svg>`;
}
