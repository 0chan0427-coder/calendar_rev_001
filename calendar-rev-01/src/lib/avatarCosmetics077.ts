/** Cosmetics use the established face coordinates; no replacement eyes or face bitmap. */
export const SKIN_TONES_077=[
 {id:'skin077-porcelain',name:'포슬린 피부',rgb:[1.00,.96,.94],offset:[0,.035,.055]},
 {id:'skin077-ivory',name:'아이보리 피부',rgb:[.98,.94,.86],offset:[0,.025,.04]},
 {id:'skin077-rose',name:'로지 베이지 피부',rgb:[.97,.87,.85],offset:[0,.025,.04]},
 {id:'skin077-sand',name:'샌드 베이지 피부',rgb:[.88,.80,.68],offset:[0,.02,.03]},
 {id:'skin077-olive',name:'올리브 베이지 피부',rgb:[.80,.77,.63],offset:[0,.025,.025]},
 {id:'skin077-honey',name:'허니 피부',rgb:[.79,.65,.48],offset:[0,.015,.02]},
 {id:'skin077-tan',name:'골든 탠 피부',rgb:[.68,.53,.38],offset:[0,.012,.015]},
 {id:'skin077-bronze',name:'브론즈 피부',rgb:[.56,.40,.28],offset:[0,.012,.015]},
 {id:'skin077-umber',name:'엄버 피부',rgb:[.43,.30,.23],offset:[0,.012,.015]},
 {id:'skin077-deep',name:'딥 브라운 피부',rgb:[.31,.22,.18],offset:[0,.012,.015]},
];
export const MAKEUP_077=[
 {id:'makeup077-gyaru',name:'갸루 메이크업',color:'#da898c',lip:'#a94f58',liner:'#392620',lashes:3,white:true,shadow:'#a27d63'},
 {id:'makeup077-softgyaru',name:'소프트 갸루',color:'#eea28f',lip:'#b36562',liner:'#61412f',lashes:2,white:true,shadow:'#ccaa8d'},
 {id:'makeup077-douyin',name:'두인 글리터 메이크업',color:'#dd879f',lip:'#a9576b',liner:'#603b3b',lashes:2,glitter:true,shadow:'#c59cae'},
 {id:'makeup077-peach',name:'피치 코랄 메이크업',color:'#edac82',lip:'#bd765f',liner:'#895c40',lashes:1,shadow:'#d8b18d'},
 {id:'makeup077-igari',name:'이가리 볼터치',color:'#dc7381',lip:'#b16a70',liner:'#79534c',lashes:1,highBlush:true,shadow:'#dbb4ae'},
 {id:'makeup077-glam',name:'브론즈 소프트 글램',color:'#b97963',lip:'#95564c',liner:'#4d3329',lashes:2,shadow:'#a78465'},
 {id:'makeup077-classic',name:'클래식 레드 립',color:'#c38e8b',lip:'#a72e3b',liner:'#392a2b',lashes:2,shadow:'#baa6a2'},
 {id:'makeup077-smoky',name:'플럼 스모키',color:'#a77d93',lip:'#82445c',liner:'#392631',lashes:2,shadow:'#92798d'},
];
export function skinFilter077(skin:string|undefined,uid:string){
 const s=SKIN_TONES_077.find(t=>t.id===skin);if(!s)return '';
 return `<filter id="${uid}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${s.rgb[0]} 0 0 0 ${s.offset[0]} 0 ${s.rgb[1]} 0 0 ${s.offset[1]} 0 0 ${s.rgb[2]} 0 ${s.offset[2]} 0 0 0 1 0"/></filter>`;
}
export function cosmetic077(makeup:string|undefined,face:string|undefined,closed:boolean,uid='cosmetic077',gender:'male'|'female'='male',showLip=true){
 closed=closed||face==='eyes-smile';
 const m=MAKEUP_077.find(i=>i.id===makeup);if(!m)return '';
 const soft=face==='eyes-slit'||face==='eyes-sleepy',cy=m.highBlush?474:500;
 const anime=face?.startsWith('eyes079-'),accentOffset=({'eyes079-clear':10,'eyes079-soft':12,'eyes079-cat':4,'eyes079-almond':0,'eyes079-doll':22,'eyes079-heroine':8} as Record<string,number>)[face||'']||0;
 const gradient=uid+'-'+m.id+'-'+(closed?'closed':'open');
 const cheeks=`<defs><radialGradient id="${gradient}"><stop stop-color="${m.color}" stop-opacity=".7"/><stop offset="1" stop-color="${m.color}" stop-opacity="0"/></radialGradient></defs><g fill="url(#${gradient})"><ellipse cx="350" cy="${cy}" rx="58" ry="27"/><ellipse cx="674" cy="${cy}" rx="58" ry="27"/></g>`;
 // The under-eye accents stay below the moving lids, never drawn as a second eye.
 const accents=m.white?`<g transform="translate(0 ${accentOffset})" fill="none" stroke="#fff0d8" stroke-width="5" stroke-linecap="round" opacity=".8"><path d="M344 455Q385 476 427 455 M597 455Q638 476 679 455"/></g>`:'';
 const sparkle=m.glitter?`<g transform="translate(0 ${accentOffset})" fill="#fff4d1"><circle cx="340" cy="469" r="4"/><circle cx="421" cy="468" r="3"/><circle cx="603" cy="468" r="3"/><circle cx="684" cy="469" r="4"/></g>`:'';
 const lip=showLip?`<path data-makeup-lip="${gender}" d="${gender==='female'?'M465 493Q509 516 554 493':'M469 498Q507 523 547 498'}" fill="none" stroke="${m.lip}" stroke-width="7" stroke-linecap="round"/>`:'';
 const eyes=anime?'':[false,true].map(right=>{
  const lashes=Array.from({length:soft?1:m.lashes},(_,i)=>`<path d="M${331+i*7} ${(closed?408:soft?419:399)+i*4}l${-14+i*2} ${-9-i*2}"/>`).join('');
  return `<g ${right?'transform="translate(1024 0) scale(-1 1)"':''} fill="none" stroke="${m.liner}" stroke-width="${m.lashes>2?7:5}" stroke-linecap="round">${lashes}</g>`;
 }).join('');
 return `<g data-cosmetic="${m.id}" data-cosmetic-frame="${closed?'closed':'open'}">${cheeks}${lip}${accents}${sparkle}${eyes}</g>`;
}

export function cosmeticShadow077(makeup:string|undefined,closed:boolean,uid:string){
 const m=MAKEUP_077.find(i=>i.id===makeup);if(!m)return '';
 const key=uid+'-'+(closed?'closed':'open'),y=closed?405:369;
 return `<defs><radialGradient id="${key}"><stop stop-color="${m.shadow}" stop-opacity=".55"/><stop offset="1" stop-color="${m.shadow}" stop-opacity="0"/></radialGradient></defs><g data-makeup-shadow="${closed?'closed':'open'}" fill="url(#${key})"><ellipse cx="390" cy="${y}" rx="77" ry="40"/><ellipse cx="634" cy="${y}" rx="77" ry="40"/></g>`;
}
