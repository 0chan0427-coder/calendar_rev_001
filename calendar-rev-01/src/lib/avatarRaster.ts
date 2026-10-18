import type { Equipment } from '../data/wardrobe';
import { AVATAR_DEFAULTS, WEARABLES } from '../data/wardrobe';
import { RASTER_ASSETS } from '../data/avatarRaster';
import type { RasterKey } from '../data/avatarRaster';
export type AssetResolver=(path:string)=>string;
export interface AvatarRenderOptions {animate?:boolean;blink?:boolean;phase?:number}
const identity:AssetResolver=p=>p;
const safe=(s:string)=>s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
/** One renderer for the actual app and the offline preview. No hand-drawn replacement body. */
export function avatarSvgMarkup(gender:'male'|'female',input:Equipment={},uid='avatar',resolve:AssetResolver=identity,options:AvatarRenderOptions={}){
 const valid=Object.fromEntries(Object.entries(input).filter(([slot,id])=>WEARABLES.some(i=>i.target==='avatar'&&i.id===id&&i.slot===slot)));
 const e={...AVATAR_DEFAULTS,...valid};
 const id=(s:string)=>`${uid}-${s}`;
 const animate=options.animate===true;
 const blinking=animate&&options.blink!==false&&e.face!=='eyes-smile';
 const phase=Number.isFinite(options.phase)?options.phase!:0;
 const stateClass=(state:'open'|'closed')=>blinking?`avatar-eye-${state}`:'';
 const clean=RASTER_ASSETS[`${gender}-clean`];
 const image=(path:string,extra='')=>`<image href="${safe(resolve(path))}" width="1024" height="1536" ${extra}/>`;
 // Lift near-opaque interiors to full opacity while retaining the antialiased edge ramp.
 const base=image(clean.image,`filter="url(#${id('alpha')})"`);
 const asset=(key:RasterKey,box:[number,number,number,number],extra='',crop?:[number,number,number,number],imageExtra='')=>{const a=RASTER_ASSETS[key];if(!a)return '';return `<svg data-asset="${key}" x="${box[0]}" y="${box[1]}" width="${box[2]}" height="${box[3]}" viewBox="${(crop||a.crop).join(' ')}" preserveAspectRatio="none" overflow="hidden" ${extra}><image href="${safe(resolve(a.image))}" width="${a.width}" height="${a.height}" filter="url(#${id('alpha')})" ${imageExtra}/></svg>`;};
 const hair=e.hair==='hair-bob-brown'||(e.hair==='hair-chestnut'&&gender==='female')?'hair-bob':'hair-short';
 const hairBox:[number,number,number,number]=hair==='hair-bob'?[165,-5,690,610]:[180,-15,660,450];
 const showHair=e.hair!=='hair-none';
 const eyeY=gender==='female'?-6:0;
 const eyeSprite=asset('eyes-open',[305,293,414,176]);
 const brows=`<g clip-path="url(#${id('brows')})">${eyeSprite}</g>`;
 const closedEyes=`${brows}<g transform="translate(0 ${eyeY})" stroke="#673521" stroke-width="11" fill="none" stroke-linecap="round"><path d="M329 399 Q387 435 446 399 M568 399 Q628 435 688 399"/><path d="M332 401L323 395 M443 401L451 395 M571 401L562 395 M685 401L694 395" stroke-width="7"/></g>`;
 const smileEyes=`${brows}<g transform="translate(0 ${eyeY})" stroke="#673521" stroke-width="13" fill="none" stroke-linecap="round"><path d="M329 420 Q387 359 446 420 M568 420 Q628 359 688 420"/></g>`;
 const eyes=e.face==='eyes-smile'?smileEyes:blinking
  ?`<g data-eye-state="open" class="${stateClass('open')}">${eyeSprite}</g><g data-eye-state="closed" class="${stateClass('closed')}">${closedEyes}</g>`:eyeSprite;
 const faceBody=`<g id="${id('body')}">${base}</g>`;
 const skin=e.skin==='skin-warm'?`<use href="#${id('body')}" clip-path="url(#${id('skin')})" filter="url(#${id('warm')})" data-layer="skin"/>`:'';
 // Masks hide baked-in basics only where replacement clothing is equipped.
 const hasTop=e.top!=='top-base';
 const hasBottom=e.bottom!=='bottom-base';
 // The baked underwear includes its dark outer stroke and soft edge pixels.
 // Exclude the whole source garment, not just its approximate interior.
 const underwearCutout=gender==='female'
  ?'M345 912Q512 940 675 912L702 1080Q512 1115 315 1080Z'
  :'M345 912Q512 940 675 912L702 1078Q512 1110 315 1078Z';
 const hasShoes=e.shoes!=='shoes-none';
 const top=e.top==='top-pink'?asset('sweater-peach',[148,595,728,435]):e.top==='top-shirt-blue'||e.top==='top-mint'?asset('shirt-blue',[203,595,618,390]):'';
 const bottom=e.bottom==='bottom-trousers'?asset('trousers-charcoal',[307,919,410,486]):e.bottom==='bottom-shorts-cream'?asset('shorts-cream',[315,919,397,215]):'';
 // Fit each boot to its ankle independently. Both sexes share the art but not the foot baseline.
 const bootY=gender==='male'?1293:1313;
 const bootPair=(front:boolean)=>{
  const mask=front?`mask="url(#${id('boot-front')})"`:'';
  return asset('boots-brown',[268,bootY,219,195],'data-foot="left"',[368,280,481,413],mask)
   +asset('boots-brown',[537,bootY,219,195],'data-foot="right"',[925,280,481,413],mask);
 };
 const shoesBack=e.shoes==='shoes-boots'?bootPair(false):'';
 const shoesFront=e.shoes==='shoes-boots'?bootPair(true):e.shoes==='shoes-cream'?asset('sneakers-white',[277,1350,470,153]):'';
 const peach=e.makeup==='makeup-peach'||e.makeup==='makeup-freckles';
 const hasBlush=peach||['makeup-blush','makeup-rose','makeup-mauve'].includes(e.makeup!);
 const freckles=e.makeup==='makeup-freckles'?`<g fill="#a46e4f" opacity=".65">${[[323,491],[344,504],[367,490],[389,505],[635,505],[657,490],[680,504],[701,491]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="4.5"/>`).join('')}</g>`:'';
 const shadow=(closed:boolean)=>`<g opacity=".55" transform="translate(0 ${eyeY})"><ellipse cx="387" cy="${closed?409:365}" rx="69" ry="${closed?20:29}" fill="url(#${id('shadow')})"/><ellipse cx="628" cy="${closed?409:365}" rx="69" ry="${closed?20:29}" fill="url(#${id('shadow')})"/></g>`;
 const eyeMakeup=e.makeup==='makeup-mauve'?(blinking?`<g data-makeup-state="open" class="${stateClass('open')}">${shadow(false)}</g><g data-makeup-state="closed" class="${stateClass('closed')}">${shadow(true)}</g>`:shadow(e.face==='eyes-smile')):'';
 const blush=hasBlush?`<g data-layer="makeup"><g opacity="${e.makeup==='makeup-rose'?.7:peach?.48:.4}"><ellipse cx="350" cy="503" rx="63" ry="33" fill="url(#${id('blush')})"/><ellipse cx="674" cy="503" rx="63" ry="33" fill="url(#${id('blush')})"/></g>${freckles}${eyeMakeup}</g>`:'';
 const glassesStyle:Record<string,{color:string;shape:'round'|'rect'|'oval';width:number}>={
  'glasses-round':{color:'#6d4d3b',shape:'round',width:8},
  'glasses-gold':{color:'#ad8860',shape:'round',width:8},
  'glasses-olive':{color:'#58604d',shape:'rect',width:10},
  'glasses-rose':{color:'#b88579',shape:'oval',width:6},
 };
 const frame=glassesStyle[e.glasses!];
 const lenses=frame?.shape==='oval'?'<ellipse cx="391" cy="411" rx="93" ry="66"/><ellipse cx="635" cy="411" rx="93" ry="66"/>':`<rect x="304" y="340" width="175" height="147" rx="${frame?.shape==='rect'?32:57}"/><rect x="547" y="340" width="175" height="147" rx="${frame?.shape==='rect'?32:57}"/>`;
 const glasses=frame?`<g data-layer="glasses" fill="none" stroke="${frame.color}" stroke-width="${frame.width}" stroke-linejoin="round" transform="translate(0 ${eyeY})">${lenses}<path d="M${frame.shape==='oval'?484:479} 391 Q513 373 ${frame.shape==='oval'?542:547} 391 M304 385 L275 372 M722 385 L752 372"/><path d="M331 363 L350 354 M574 363 L593 354" stroke="#fff8ec" stroke-opacity=".7" stroke-width="5"/></g>`:'';
 const ribbon=e.accessory==='ribbon-avatar'?`<svg x="675" y="110" width="145" height="110" viewBox="0 0 1536 1024" preserveAspectRatio="xMidYMid meet"><image href="${safe(resolve('/world/wearables/shared/ribbon-red.png'))}" width="1536" height="1024" filter="url(#${id('alpha')})"/></svg>`:'';
 return `<svg class="raster-avatar-svg" viewBox="0 0 1024 1536" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="--avatar-phase:${phase}s"><defs>
 <style>
 @keyframes minime-eye-open{0%,45%,48%,100%{visibility:visible}46%,47%{visibility:hidden}}
 @keyframes minime-eye-closed{0%,45%,48%,100%{visibility:hidden}46%,47%{visibility:visible}}
 @keyframes minime-breathe{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.006)}}
 .raster-avatar-svg .avatar-eye-open{animation:minime-eye-open 6.4s steps(1,end) infinite;animation-delay:var(--avatar-phase,0s)}
 .raster-avatar-svg .avatar-eye-closed{visibility:hidden;animation:minime-eye-closed 6.4s steps(1,end) infinite;animation-delay:var(--avatar-phase,0s)}
 .raster-avatar-svg .avatar-breathe{transform-origin:512px 1505px;animation:minime-breathe 4s ease-in-out infinite;animation-delay:var(--avatar-phase,0s)}
 @media(prefers-reduced-motion:reduce){.raster-avatar-svg .avatar-breathe,.raster-avatar-svg .avatar-eye-open,.raster-avatar-svg .avatar-eye-closed{animation:none}.raster-avatar-svg .avatar-eye-open{visibility:visible}.raster-avatar-svg .avatar-eye-closed{visibility:hidden}}
 </style>
 <filter id="${id('alpha')}" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncA type="linear" slope="1.045" intercept="-0.025"/></feComponentTransfer></filter>
 <filter id="${id('warm')}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".96 0 0 0 0 0 .86 0 0 .015 0 0 .78 0 .025 0 0 0 1 0"/></filter>
 <!-- Native-image coordinates: the rear cuff goes behind the shin, while the tongue/laces stay in front. -->
 <mask id="${id('boot-front')}" maskUnits="userSpaceOnUse" x="0" y="0" width="1774" height="887">
 <rect width="1774" height="887" fill="white"/>
 <path d="M545 250H817V300Q735 306 681 329Q627 307 550 315Z M976 250H1238V315Q1167 307 1107 329Q1048 306 976 300Z" fill="black"/>
 </mask>
 <!-- Equipment-specific occlusion uses the original body art, without repainting its silhouette. -->
 <path id="${id('tank-shape')}" d="M400 605L438 599Q431 676 510 676Q587 676 582 599L620 605L623 690L648 742L650 834L673 930Q512 968 346 932L370 833L369 742L395 688Z"/>
 <path id="${id('shorts-shape')}" d="${underwearCutout}"/>
 <mask id="${id('body-visible')}" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1536"><rect width="1024" height="1536" fill="white"/>
 ${hasTop?`<use href="#${id('tank-shape')}" fill="black"/>`:''}
 ${hasBottom?`<use href="#${id('shorts-shape')}" fill="black" stroke="black" stroke-width="12" stroke-linejoin="round" data-occlusion="underwear"/>`:''}
 ${hasShoes?'<path d="M285 1365H481V1510H285Z M540 1365H735V1510H540Z" fill="black"/>':''}
 </mask>
 <clipPath id="${id('neck')}"><path d="${e.top==='top-pink'?'M463 558H553V589Q555 602 583 608L582 619Q572 642 511 642Q450 642 439 619L438 608Q461 602 463 589Z':'M463 558H553V589Q555 602 583 608L583 631Q570 658 511 658Q453 658 438 631L438 608Q461 602 463 589Z'}"/></clipPath>
 <clipPath id="${id('brows')}"><rect x="300" y="272" width="425" height="61"/></clipPath>
 <clipPath id="${id('skin')}"><rect x="150" width="725" height="610"/><path d="M443 575H580V617Q580 675 510 675Q443 675 443 617Z M399 608Q337 614 297 705L140 1000V1080H305L380 850L405 695Z M625 608Q687 614 727 705L884 1000V1080H719L644 850L619 695Z"/><rect x="270" y="1075" width="470" height="440"/></clipPath>
 <mask id="${id('hair-front')}"><rect width="1024" height="1536" fill="white"/><ellipse cx="512" cy="448" rx="235" ry="149" fill="black"/></mask>
 <radialGradient id="${id('blush')}"><stop offset="0" stop-color="${peach?'#eaa070':'#ee8492'}"/><stop offset="1" stop-color="${peach?'#eaa070':'#ee8492'}" stop-opacity="0"/></radialGradient>
 <radialGradient id="${id('shadow')}"><stop stop-color="#b68a9e"/><stop offset="1" stop-color="#b68a9e" stop-opacity="0"/></radialGradient>
 ${faceBody}</defs>
 <g data-layer="avatar-motion" class="${animate?'avatar-breathe':''}">
 ${showHair?asset(hair,hairBox,'data-layer="hair-back"'):''}
 <g data-layer="shoes-back">${shoesBack}</g>
 <g mask="url(#${id('body-visible')})"><use href="#${id('body')}" data-layer="base"/>${skin}</g>${blush}<g data-layer="eyes">${eyes}</g>
 <!-- Current trousers are worn over shoes: back cuff → shin → front shoe → trouser hem. -->
 <g data-layer="shoes-front">${shoesFront}</g><g data-layer="bottom">${bottom}</g><g data-layer="top">${top}</g>${hasTop?`<use href="#${id('body')}" clip-path="url(#${id('neck')})" ${e.skin==='skin-warm'?`filter="url(#${id('warm')})"`:''} data-layer="neck-occlusion"/>`:''}

 ${glasses}${showHair?`<g mask="url(#${id('hair-front')})" data-layer="hair-front">${asset(hair,hairBox)}</g>`:''}${ribbon}</g></svg>`;
}
