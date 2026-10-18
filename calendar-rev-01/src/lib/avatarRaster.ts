import type { Equipment } from '../data/wardrobe';
import { AVATAR_DEFAULTS, WEARABLES } from '../data/wardrobe';
import { RASTER_ASSETS } from '../data/avatarRaster';
import type { RasterKey } from '../data/avatarRaster';
export type AssetResolver=(path:string)=>string;
const identity:AssetResolver=p=>p;
const safe=(s:string)=>s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
/** One renderer for the actual app and the offline preview. No hand-drawn replacement body. */
export function avatarSvgMarkup(gender:'male'|'female',input:Equipment={},uid='avatar',resolve:AssetResolver=identity){
 const valid=Object.fromEntries(Object.entries(input).filter(([slot,id])=>WEARABLES.some(i=>i.target==='avatar'&&i.id===id&&i.slot===slot)));
 const e={...AVATAR_DEFAULTS,...valid};
 const id=(s:string)=>`${uid}-${s}`;
 const clean=RASTER_ASSETS[`${gender}-clean`];
 const image=(path:string,extra='')=>`<image href="${safe(resolve(path))}" width="1024" height="1536" ${extra}/>`;
 // Lift near-opaque interiors to full opacity while retaining the antialiased edge ramp.
 const base=image(clean.image,`filter="url(#${id('alpha')})"`);
 const asset=(key:RasterKey,box:[number,number,number,number],extra='')=>{const a=RASTER_ASSETS[key];if(!a)return '';return `<svg data-asset="${key}" x="${box[0]}" y="${box[1]}" width="${box[2]}" height="${box[3]}" viewBox="${a.crop.join(' ')}" preserveAspectRatio="none" overflow="hidden" ${extra}><image href="${safe(resolve(a.image))}" width="${a.width}" height="${a.height}" filter="url(#${id('alpha')})"/></svg>`;};
 const hair=e.hair==='hair-bob-brown'||(e.hair==='hair-chestnut'&&gender==='female')?'hair-bob':'hair-short';
 const hairBox:[number,number,number,number]=hair==='hair-bob'?[165,-5,690,610]:[180,-15,660,450];
 const showHair=e.hair!=='hair-none';
 const eyeY=gender==='female'?-6:0;
 const eyeSprite=asset('eyes-open',[305,293,414,176]);
 const eyes=e.face==='eyes-smile'?`<g clip-path="url(#${id('brows')})">${eyeSprite}</g><g transform="translate(0 ${eyeY})" stroke="#673521" stroke-width="13" fill="none" stroke-linecap="round"><path d="M329 420 Q387 359 446 420"/><path d="M568 420 Q628 359 688 420"/></g>`:eyeSprite;
 const faceBody=`<g id="${id('body')}">${base}</g>`;
 const skin=e.skin==='skin-warm'?`<use href="#${id('body')}" clip-path="url(#${id('skin')})" filter="url(#${id('warm')})" data-layer="skin"/>`:'';
 // Masks hide baked-in basics only where replacement clothing is equipped.
 const hasTop=e.top!=='top-base';
 const hasBottom=e.bottom!=='bottom-base';
 const hasShoes=e.shoes!=='shoes-none';
 const top=e.top==='top-pink'?asset('sweater-peach',[148,595,728,435]):e.top==='top-shirt-blue'||e.top==='top-mint'?asset('shirt-blue',[203,595,618,390]):'';
 const bottom=e.bottom==='bottom-trousers'?asset('trousers-charcoal',[307,919,410,486]):e.bottom==='bottom-shorts-cream'?asset('shorts-cream',[315,919,397,215]):'';
 const shoes=e.shoes==='shoes-boots'?asset('boots-brown',[276,1307,472,195]):e.shoes==='shoes-cream'?asset('sneakers-white',[277,1350,470,153]):'';
 const blush=e.makeup==='makeup-blush'||e.makeup==='makeup-rose'?`<g data-layer="makeup" opacity="${e.makeup==='makeup-rose'?0.7:0.4}"><ellipse cx="350" cy="503" rx="63" ry="33" fill="url(#${id('blush')})"/><ellipse cx="674" cy="503" rx="63" ry="33" fill="url(#${id('blush')})"/></g>`:'';
 const glasses=e.glasses==='glasses-round'||e.glasses==='glasses-gold'?`<g data-layer="glasses" fill="none" stroke="${e.glasses==='glasses-gold'?'#ad8860':'#6d4d3b'}" stroke-width="8" stroke-linejoin="round" transform="translate(0 ${eyeY})"><rect x="304" y="340" width="175" height="147" rx="57"/><rect x="547" y="340" width="175" height="147" rx="57"/><path d="M479 391 Q513 373 547 391 M304 385 L275 372 M722 385 L752 372"/><path d="M331 363 L350 354 M574 363 L593 354" stroke="#fff8ec" stroke-opacity=".7" stroke-width="5"/></g>`:'';
 const ribbon=e.accessory==='ribbon-avatar'?`<svg x="675" y="110" width="145" height="110" viewBox="0 0 1536 1024" preserveAspectRatio="xMidYMid meet"><image href="${safe(resolve('/world/wearables/shared/ribbon-red.png'))}" width="1536" height="1024" filter="url(#${id('alpha')})"/></svg>`:'';
 return `<svg class="raster-avatar-svg" viewBox="0 0 1024 1536" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>
 <filter id="${id('alpha')}" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncA type="linear" slope="1.045" intercept="-0.025"/></feComponentTransfer></filter>
 <filter id="${id('warm')}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".96 0 0 0 0 0 .86 0 0 .015 0 0 .78 0 .025 0 0 0 1 0"/></filter>
 <!-- Equipment-specific occlusion uses the original body art, without repainting its silhouette. -->
 <path id="${id('tank-shape')}" d="M400 605L438 599Q431 676 510 676Q587 676 582 599L620 605L623 690L648 742L650 834L673 930Q512 968 346 932L370 833L369 742L395 688Z"/>
 <path id="${id('shorts-shape')}" d="M350 918Q512 946 669 918L690 1067Q607 1090 516 1079L506 1034L498 1079Q405 1090 328 1067Z"/>
 <mask id="${id('body-visible')}" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1536"><rect width="1024" height="1536" fill="white"/>
 ${hasTop?`<use href="#${id('tank-shape')}" fill="black"/>`:''}
 ${hasBottom?`<use href="#${id('shorts-shape')}" fill="black"/>`:''}
 ${hasShoes?'<path d="M285 1365H481V1510H285Z M540 1365H735V1510H540Z" fill="black"/>':''}
 </mask>
 <clipPath id="${id('neck')}"><path d="${e.top==='top-pink'?'M463 558H553V589Q555 602 583 608L582 619Q572 642 511 642Q450 642 439 619L438 608Q461 602 463 589Z':'M463 558H553V589Q555 602 583 608L583 631Q570 658 511 658Q453 658 438 631L438 608Q461 602 463 589Z'}"/></clipPath>
 <clipPath id="${id('brows')}"><rect x="300" y="272" width="425" height="61"/></clipPath>
 <clipPath id="${id('skin')}"><rect x="150" width="725" height="610"/><path d="M443 575H580V617Q580 675 510 675Q443 675 443 617Z M399 608Q337 614 297 705L140 1000V1080H305L380 850L405 695Z M625 608Q687 614 727 705L884 1000V1080H719L644 850L619 695Z"/><rect x="270" y="1075" width="470" height="440"/></clipPath>
 <mask id="${id('hair-front')}"><rect width="1024" height="1536" fill="white"/><ellipse cx="512" cy="448" rx="235" ry="149" fill="black"/></mask>
 <radialGradient id="${id('blush')}"><stop offset="0" stop-color="#ee8492"/><stop offset="1" stop-color="#ee8492" stop-opacity="0"/></radialGradient>
 ${faceBody}</defs>
 ${showHair?asset(hair,hairBox,'data-layer="hair-back"'):''}
 <g mask="url(#${id('body-visible')})"><use href="#${id('body')}" data-layer="base"/>${skin}</g><g data-layer="eyes">${eyes}</g>${blush}
 <!-- Shoes sit under trouser hems; the fitted neck occludes only the rear collar. -->
 <g data-layer="shoes">${shoes}</g><g data-layer="bottom">${bottom}</g><g data-layer="top">${top}</g>${hasTop?`<use href="#${id('body')}" clip-path="url(#${id('neck')})" ${e.skin==='skin-warm'?`filter="url(#${id('warm')})"`:''} data-layer="neck-occlusion"/>`:''}

 ${glasses}${showHair?`<g mask="url(#${id('hair-front')})" data-layer="hair-front">${asset(hair,hairBox)}</g>`:''}${ribbon}</svg>`;
}
