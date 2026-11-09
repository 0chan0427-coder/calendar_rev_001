import {MAKEUP_077} from './avatarCosmetics077';
import {irisPalette079} from './avatarColors079';
export const ANIME_EYES_079=[
 {id:'eyes079-clear',name:'차분한 애니 눈매',price:800},
 {id:'eyes079-soft',name:'부드러운 애니 눈매',price:800},
 {id:'eyes079-cat',name:'가는 고양이 눈매',price:800},
 {id:'eyes079-almond',name:'담담한 애니 반눈',price:800},
 {id:'eyes079-doll',name:'반짝이는 큰 눈매',price:800},
 {id:'eyes079-heroine',name:'선명한 애니 눈매',price:800},
] as const;
const shapes:Record<string,{lid:string;upper:string;brow:string;cy:number;rx:number;ry:number;lash:number;closed:string}>={
 'eyes079-clear':{lid:'M321 402Q350 360 389 363Q432 366 458 400Q443 451 390 458Q340 453 321 402Z',upper:'M320 401Q350 359 389 363Q432 366 458 400',brow:'M330 324Q387 307 445 327',cy:411,rx:36,ry:48,lash:9,closed:'M324 409Q385 448 455 408'},
 'eyes079-soft':{lid:'M322 418Q331 367 387 365Q429 362 457 391Q444 454 391 463Q339 462 322 418Z',upper:'M322 418Q332 366 387 365Q430 362 457 391',brow:'M330 336Q386 314 443 323',cy:418,rx:39,ry:49,lash:9,closed:'M324 421Q386 450 455 404'},
 'eyes079-cat':{lid:'M319 382Q374 385 454 410Q432 452 391 454Q343 446 319 382Z',upper:'M316 379Q374 385 454 410',brow:'M327 333Q382 323 446 339',cy:414,rx:28,ry:38,lash:10,closed:'M320 395Q382 437 455 410'},
 'eyes079-almond':{lid:'M324 390Q387 384 454 391Q445 445 390 449Q339 445 324 390Z',upper:'M323 389Q387 384 454 391',brow:'M332 330Q387 315 443 331',cy:410,rx:30,ry:43,lash:7,closed:'M323 405Q387 436 453 406'},
 'eyes079-doll':{lid:'M321 404Q323 343 388 345Q454 346 458 406Q450 475 391 475Q328 472 321 404Z',upper:'M320 404Q323 343 388 345Q452 346 458 406',brow:'M332 317Q388 302 443 320',cy:414,rx:43,ry:57,lash:11,closed:'M323 412Q390 455 456 412'},
 'eyes079-heroine':{lid:'M318 388Q366 350 408 365Q443 378 457 402Q444 458 391 461Q339 454 318 388Z',upper:'M316 385Q365 349 408 365Q442 377 457 402',brow:'M327 323Q382 306 446 336',cy:412,rx:37,ry:50,lash:12,closed:'M319 397Q383 444 455 410'},
};
export function renderAnimeEye079(style:string,makeup:string,uid:string,state:'open'|'closed',colorId?:string):string|undefined{
 const s=shapes[style];if(!s)return;const closed=state==='closed';
 const cosmetic=MAKEUP_077.find(m=>m.id===makeup),liner=cosmetic?.liner||'#34252b',lashWeight=s.lash+(cosmetic?cosmetic.lashes-1:0);
 const pair=[0,1].map(side=>{const key=uid+'-anime-'+side;const red=makeup==='makeup-mukuro-six'&&side===0,blue=makeup==='makeup-mukuro-six'&&side===1;
 const colors=red?['#401523','#b82d42','#f29b9c']:blue?['#16274c','#397cb3','#a5ddf6']:irisPalette079(colorId)||irisPalette079({'eyes079-clear':'eyecolor079-blue','eyes079-soft':'eyecolor079-violet','eyes079-cat':'eyecolor079-emerald','eyes079-almond':'eyecolor079-emerald','eyes079-doll':'eyecolor079-violet','eyes079-heroine':'eyecolor079-pink'}[style])!;
 const wings:Record<string,string>={'eyes079-clear':'M321 401L307 385L333 393Z M332 386L323 371L344 379Z','eyes079-soft':'M323 414L309 401L333 403Z M332 391L323 377L344 382Z','eyes079-cat':'M319 383L302 368L334 386Z M336 386L325 371L348 389Z','eyes079-almond':'M325 390L309 381L337 389Z M338 388L330 378L349 388Z','eyes079-doll':'M322 396L306 379L334 383Z M332 369L320 351L345 359Z M348 354L342 339L357 351Z','eyes079-heroine':'M319 387L302 366L333 377Z M332 376L320 357L346 367Z M350 365L344 349L362 361Z'};
 const lashes=`<path d="${closed?s.closed:s.upper}" fill="none" stroke="${liner}" stroke-width="${lashWeight}" stroke-linecap="round"/>${closed?`<path d="M328 414L315 403 M338 422L324 416" fill="none" stroke="${liner}" stroke-width="4" stroke-linecap="round"/>`:`<path d="${wings[style]}" fill="${liner}"/>`}`;
 const pupil=red?`<g transform="translate(372 ${s.cy-22}) scale(.4)" fill="none" stroke="#201420" stroke-width="9" stroke-linecap="round"><path d="M48 0L56 14 M9 29H91 M38 48Q29 70 9 85 M63 48Q76 66 88 85"/></g>`:`<ellipse cx="390" cy="${s.cy-3}" rx="${s.rx*.35}" ry="${s.ry*.5}" fill="#201724"/>`;
 const iris=`<g ${side?'transform="translate(780 0) scale(-1 1)"':''}><ellipse cx="390" cy="${s.cy}" rx="${s.rx}" ry="${s.ry}" fill="url(#${key}-iris)" stroke="${colors[0]}" stroke-width="3.5"/><ellipse cx="390" cy="${s.cy+20}" rx="${s.rx*.79}" ry="${s.ry*.42}" fill="${colors[2]}" opacity=".48"/>${Array.from({length:9},(_,i)=>{const a=(i*20+10)*Math.PI/180;return `<path d="M${390+Math.cos(a)*s.rx*.56} ${s.cy+Math.sin(a)*s.ry*.55}L${390+Math.cos(a)*s.rx*.85} ${s.cy+Math.sin(a)*s.ry*.86}" stroke="${colors[2]}" stroke-width="2" opacity=".6"/>`;}).join('')}${pupil}${style==='eyes079-doll'&&!red&&!blue?`<polygon points="${Array.from({length:12},(_,i)=>{const a=(i*30-90)*Math.PI/180,r=i%2?6:16;return [390+Math.cos(a)*r,s.cy+Math.sin(a)*r].join(',')}).join(' ')}" fill="#fff" opacity=".92"/>`:''}<ellipse cx="${side?408:372}" cy="${s.cy-24}" rx="10" ry="14" fill="#fff" transform="rotate(24 ${side?408:372} ${s.cy-24})"/><circle cx="${side?374:406}" cy="${s.cy+18}" r="5.5" fill="#fff8ec"/><circle cx="${side?402:378}" cy="${s.cy+33}" r="2.6" fill="#fff"/></g>`;
 return `<g transform="${side?'translate(1024 0) scale(-1 1)':''}"><defs><clipPath id="${key}-lid"><path d="${s.lid}"/></clipPath><linearGradient id="${key}-iris" x2="0" y2="1"><stop stop-color="${colors[0]}"/><stop offset=".55" stop-color="${colors[1]}"/><stop offset="1" stop-color="${colors[2]}"/></linearGradient></defs><path d="${s.brow}" fill="none" stroke="#71504b" stroke-width="5.5" stroke-linecap="round"/>${closed?lashes:`<path d="${s.lid}" fill="#fffaf6" stroke="#b88d88" stroke-width="2.5"/><g clip-path="url(#${key}-lid)" data-iris="${red?'six-red':blue?'blue':colorId||'original'}">${iris}<path d="${s.upper}" fill="none" stroke="#393044" stroke-width="20" opacity=".16"/></g>${lashes}<path d="M337 449Q389 478 440 449" fill="none" stroke="#926467" stroke-width="2.5" opacity=".45"/>`}</g>`;
 }).join('');
 return `<g data-eye-style="${style}" data-eye-frame="${state}">${pair}</g>`;
}
