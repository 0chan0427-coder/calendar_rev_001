import {BOND_ACCESSORY_FITS,BOND_THEMES,companionBondFamily} from '../../data/companionBonds';
/** Coordinates are registered separately for each age/body. Only front-facing straps are drawn. */
export default function CompanionBondAccessory({itemId,fit:customFit}:{itemId:string;fit?:[number,number,number]}){
 const family=companionBondFamily(itemId);if(!family)return null;
 const adult=itemId.startsWith('adult-');
 const fit=customFit||BOND_ACCESSORY_FITS[family][adult?'adult':'baby'];
 const [x,y,scale]=fit;const motif=BOND_THEMES[family].motif;
 const necklace=['moon','bamboo','knot','tiger','diamond'].includes(motif);
 return <g data-bond-accessory={family} transform={`translate(${x} ${y}) scale(${scale})`} stroke="#846740" strokeWidth=".6" strokeLinecap="round" strokeLinejoin="round">
 {necklace&&<path d="M-10-4Q0 5 10-4" fill="none" stroke="#ae8d54" strokeWidth="1.25"/>}
 {motif==='moon'&&<><path d="M0 1V4"/><path d="M2 4A4 4 0 1 0 3 10A3.5 3.5 0 0 1 2 4Z" fill="#e5c47a"/><path d="M-2 5L0 6-2 7-4 6Z" fill="#c0e1e5"/></>}
 {motif==='wing'&&<><path d="M-11-5Q0-1 11-5L6 2L0 0L-6 2Z" fill="#70899a" stroke="#516b7c"/><path d="M-2 1L-8-1-6 3-2 4M2 1L8-1 6 3 2 4" fill="#f3ecd9"/><path d="M0 1L2 4 0 7-2 4Z" fill="#dcb86c"/></>}
 {motif==='flower'&&<><path d="M-3 0Q-1-5 2-2L3 2" fill="none" stroke="#a98d56"/>{[0,72,144,216,288].map(a=><ellipse key={a} cx="0" cy="-3" rx="1.8" ry="2.8" transform={`rotate(${a})`} fill="#eac1c4"/>)}<circle r="1.6" fill="#e8ca82"/><path d="M3 3A2.6 2.6 0 1 0 5 7A2.3 2.3 0 0 1 3 3Z" fill="#e4c67f"/></>}
 {motif==='bamboo'&&<><path d="M-2 1H2V11H-2Z" fill="#7aab8b"/><path d="M-2 4H2M-2 8H2" stroke="#dce8c2"/><path d="M2 4Q8-1 7 4Q5 7 2 6M-2 8Q-8 3-7 8Q-4 11-2 10" fill="#739980"/></>}
 {motif==='knot'&&<><path d="M0 0Q-8-4-5 1L0 4Q8-3 5-1L0 0M0 4L-3 10M0 4L3 10" fill="none" stroke="#ae665c" strokeWidth="1.5"/><circle cy="6" r="2.6" fill="#d8b96d"/><path d="M-1 7H1"/></>}
 {motif==='tiger'&&<><path d="M0 0L6 4 4 10 0 13-4 10-6 4Z" fill="#cfad67"/><path d="M-3 4L0 6 3 4M0 3V10M-3 8H3" fill="none" stroke="#685544"/><circle cy="1.8" r=".7" fill="#e8e3be"/></>}
 {motif==='gem'&&<><path d="M-8-2Q0 1 8-2" fill="none" stroke="#a88c59" strokeWidth="1.2"/><path d="M0-3L4 1 0 7-4 1Z" fill="#8eb5a2"/><path d="M0-3V7M-4 1H4" stroke="#c4dbbe"/></>}
 {motif==='scale'&&<><path d="M-8 0L-3-4 3-3 8 2 3 6-3 5Z" fill="#ad985b"/><path d="M0-2L3 1 0 5-3 1Z" fill="#8bb7ac"/><path d="M-7 1L-4 3M5 1L6 2" stroke="#e0ca8e"/></>}
 {motif==='ring'&&<><ellipse rx="5.5" ry="2" fill="#d3b674"/><path d="M-5.5 0V3Q0 6 5.5 3V0" fill="#bfa169"/><path d="M-2 1L0 3 2 1" fill="none" stroke="#668b9f"/></>}
 {motif==='star'&&<><path d="M-6-3Q-3 3 3 5" fill="none" stroke="#a88e5c" strokeWidth="1.25"/><path d="M2 1L3 4 6 5 3 6 2 9 1 6-2 5 1 4Z" fill="#e0c78c"/><circle cx="-3" cy="1" r="1.3" fill="#95b7cf"/></>}
 {motif==='diamond'&&<><path d="M0 0L5 5 0 12-5 5Z" fill={/gold/.test(itemId)?'#c4a554':/blue/.test(itemId)?'#91b8d1':/green/.test(itemId)?'#83b99d':'#c27e70'}/><path d="M0 0V12M-5 5H5" stroke="#e8d4ad"/><path d="M-6 5L0 14 6 5" fill="none"/></>}
 {motif==='crown'&&<><path d="M-8 1L-7-4-3-1 0-5 3-1 7-4 8 1Z" fill="#d5b980"/><path d="M-7 1Q0 4 7 1" fill="none" stroke="#aa9268" strokeWidth="1.2"/><path d="M0-3L1.6-1 0 1-1.6-1Z" fill="#b7a7c8"/></>}
 </g>;
}
