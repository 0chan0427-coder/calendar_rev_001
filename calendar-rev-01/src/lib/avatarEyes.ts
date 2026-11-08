/** Native eye shapes share the established face anchors; iris art is clipped inside each eyelid. */
export const EYE_STYLES=[
 {id:'eyes-sharp',name:'날카로운 눈매',price:600},
 {id:'eyes-half',name:'무심한 반눈',price:600},
 {id:'eyes-slit',name:'가는 실눈',price:500},
 {id:'eyes-droop',name:'처진 눈매',price:500},
 {id:'eyes-round',name:'동그란 눈매',price:500},
 {id:'eyes-confident',name:'자신감 있는 눈매',price:700},
 {id:'eyes-sleepy',name:'졸린 눈매',price:500},
 {id:'eyes-villain',name:'강한 악역 눈매',price:800},
] as const;
const shapes:Record<string,{path:string;brow:string;cy:number;rx:number;ry:number;weight?:number}>={
 'eyes-sharp':{path:'M329 371Q384 373 449 400Q443 443 395 449Q344 447 329 421Z',brow:'M329 326Q387 332 448 363',cy:414,rx:30,ry:39,weight:12},
 'eyes-half':{path:'M329 393Q389 385 451 393Q448 448 391 452Q336 450 329 420Z',brow:'M331 333Q388 323 446 335',cy:421,rx:31,ry:39},
 'eyes-droop':{path:'M329 410Q344 374 391 371Q428 370 451 382Q440 441 390 450Q345 451 329 410Z',brow:'M331 339Q387 316 446 322',cy:411,rx:32,ry:41},
 'eyes-round':{path:'M327 406Q328 353 390 352Q452 353 455 406Q451 464 390 464Q330 463 327 406Z',brow:'M329 325Q389 301 450 326',cy:411,rx:36,ry:49},
 'eyes-confident':{path:'M329 400Q383 369 450 389Q443 443 391 451Q344 448 329 420Z',brow:'M329 331Q384 302 449 333',cy:412,rx:31,ry:41,weight:10},
 'eyes-sleepy':{path:'M330 413Q389 406 450 413Q442 445 390 448Q340 446 330 429Z',brow:'M332 339Q388 333 446 339',cy:427,rx:30,ry:34},
 'eyes-villain':{path:'M327 386L451 410L440 444Q380 461 337 431Z',brow:'M326 326L449 370',cy:421,rx:26,ry:38,weight:14},
};
export function renderEyeStyle(style:string,makeup:string,uid:string,state:'open'|'closed'='open'):string|undefined{
 if(!EYE_STYLES.some(s=>s.id===style))return;
 const closed=state==='closed';
 if(style==='eyes-slit')return `<g data-eye-style="${style}" data-eye-frame="${state}" fill="none" stroke="#673521" stroke-linecap="round"><path d="M330 333Q389 321 448 333 M576 333Q635 321 694 333" stroke-width="9"/><path d="${closed?'M331 410Q390 432 449 410 M575 410Q634 432 693 410':'M330 419Q390 383 450 419 M574 419Q634 383 694 419'}" stroke-width="12"/></g>`;
 const s=shapes[style];
 const pair=[0,1].map(side=>{
  const transform=side?'translate(1024 0) scale(-1 1)':'';
  const key=uid+'-'+side,red=makeup==='makeup-mukuro-six'&&side===0,blue=makeup==='makeup-mukuro-six'&&side===1;
  const colors=red?['#471826','#b82d42','#e46766']:blue?['#173047','#367dac','#86c7e9']:['#3f231b','#8c5039','#d18d61'];
  const pupil=red?`<g transform="translate(372 ${s.cy-21}) scale(.4)" fill="none" stroke="#24131a" stroke-width="9" stroke-linecap="round"><path d="M48 0L56 14 M9 29H91 M38 48Q29 70 9 85 M63 48Q76 66 88 85"/></g>`:`<ellipse cx="390" cy="${s.cy}" rx="${s.rx*.38}" ry="${s.ry*.48}" fill="#2d1c19"/>`;
  // Mirror iris shine and the Six glyph back independently, so the glyph itself is never mirrored.
  const iris=`<g ${side?`transform="translate(780 0) scale(-1 1)"`:''}><ellipse cx="390" cy="${s.cy}" rx="${s.rx}" ry="${s.ry}" fill="url(#${key}-iris)" stroke="#653622" stroke-width="3"/>${pupil}<circle cx="${side?376:404}" cy="${s.cy-19}" r="8" fill="#fff9ed"/><circle cx="${side?407:373}" cy="${s.cy+17}" r="3.5" fill="#ffe5c0" opacity=".8"/></g>`;
  return `<g transform="${transform}"><defs><clipPath id="${key}-lid"><path d="${s.path}"/></clipPath><radialGradient id="${key}-iris" cx=".45" cy=".25" r=".8"><stop stop-color="${colors[0]}"/><stop offset=".65" stop-color="${colors[1]}"/><stop offset="1" stop-color="${colors[2]}"/></radialGradient></defs><path d="${s.brow}" fill="none" stroke="#673521" stroke-width="${s.weight||9}" stroke-linecap="round"/>${closed?'<path d="M330 405Q389 435 450 405" fill="none" stroke="#673521" stroke-width="11" stroke-linecap="round"/>':`<path d="${s.path}" fill="#fff9ef"/><g clip-path="url(#${key}-lid)" data-iris="${red?'six-red':blue?'blue':'brown'}">${iris}</g><path d="${s.path}" fill="none" stroke="#63331f" stroke-width="6" stroke-linejoin="round"/>`}</g>`;
 }).join('');
 return `<g data-eye-style="${style}" data-eye-frame="${state}">${pair}</g>`;
}
