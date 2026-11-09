import {PAINTED_EYES_080} from '../data/eyes080';
import {irisPalette079} from './avatarColors079';
const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
/** Painted open frames, independently clipped irises, and a real closed frame. */
export function paintedEyes080(style:string,makeup:string,uid:string,state:'open'|'closed',colorId:string|undefined,resolve:(p:string)=>string):string|undefined{
 const a=PAINTED_EYES_080[style];if(!a)return;
 const brow=style==='eyes079-cat'?'M323 330Q384 327 448 350 M576 350Q640 327 701 330':style==='eyes079-almond'?'M326 345Q387 331 448 342 M576 342Q637 331 698 345':'M326 337Q387 310 448 336 M576 336Q637 310 698 337';
 const brows=`<path d="${brow}" fill="none" stroke="#6b4034" stroke-width="7" stroke-linecap="round"/>`;
 if(state==='closed')return `<g data-eye-style="${style}" data-eye-frame="closed">${brows}<g fill="none" stroke="#56362e" stroke-linecap="round"><path d="M320 406Q388 443 455 407 M569 407Q636 443 704 406" stroke-width="10"/><path d="M324 410L313 404 M335 416L325 415 M700 410L711 404 M689 416L699 415" stroke-width="6"/></g></g>`;
 const art=`<image href="${esc(resolve(a.image))}" width="${a.width}" height="${a.height}"/>`;
 const fixed=makeup==='makeup-mukuro-six',palette=fixed?undefined:irisPalette079(colorId);
 let iris='';
 if(fixed){iris=a.irises.map((v,i)=>{const p=i?['#142535','#256194','#73bceb']:['#251219','#a3213b','#ed6c79'];const glyph=i?`<ellipse cx="${v.cx}" cy="${v.cy}" rx="${v.rx*.27}" ry="${v.ry*.47}" fill="#172332"/>`:`<g transform="translate(${v.cx-v.rx*.52} ${v.cy-v.ry*.66}) scale(${v.rx*.0104} ${v.ry*.014})" fill="none" stroke="#25131c" stroke-width="9" stroke-linecap="round"><path d="M48 0L56 14 M9 29H91 M38 48Q29 70 9 85 M63 48Q76 66 88 85"/></g>`;return `<defs><clipPath id="${uid}-iris-${i}"><path d="${v.path}"/></clipPath><linearGradient id="${uid}-fixed-${i}" x2="0" y2="1">${p.map((c,j)=>`<stop offset="${j/2}" stop-color="${c}"/>`).join('')}</linearGradient></defs><g data-iris="${i?'blue':'six-red'}" clip-path="url(#${uid}-iris-${i})"><path d="${v.path}" fill="url(#${uid}-fixed-${i})"/>${glyph}<ellipse cx="${v.cx-v.rx*.32}" cy="${v.cy-v.ry*.44}" rx="${v.rx*.24}" ry="${v.ry*.17}" fill="#fffaf5"/><circle cx="${v.cx+v.rx*.39}" cy="${v.cy+v.ry*.47}" r="${v.rx*.09}" fill="#fffaf5"/></g>`;}).join('');}
 else if(palette){
 const colors=['#08060b',...palette,'#ffffff'];const table=(channel:number)=>colors.map(c=>(parseInt(c.slice(1+channel*2,3+channel*2),16)/255).toFixed(4)).join(' ');
 iris=`<defs><clipPath id="${uid}-irises">${a.irises.map(v=>`<path d="${v.path}"/>`).join('')}</clipPath><filter id="${uid}-tint" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/><feComponentTransfer>${['R','G','B'].map((c,j)=>`<feFunc${c} type="table" tableValues="${table(j)}"/>`).join('')}<feFuncA type="identity"/></feComponentTransfer></filter></defs><g clip-path="url(#${uid}-irises)"><g filter="url(#${uid}-tint)">${art}</g></g>`;
 }
 return `<g data-eye-style="${style}" data-eye-frame="open" data-painted-eyes="080">${brows}<defs><filter id="${uid}-edge" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncA type="linear" slope="1.6" intercept="-.5"/></feComponentTransfer></filter></defs><g transform="translate(${a.tx} ${a.ty}) scale(${a.scale})" filter="url(#${uid}-edge)">${art}${iris}</g></g>`;
}
