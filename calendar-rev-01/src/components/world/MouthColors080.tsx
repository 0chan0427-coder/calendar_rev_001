import {LIP_COLORS_080} from '../../data/avatarMouth080';
import type {Equipment} from '../../data/wardrobe';
export default function MouthColors080({draft,busy,onChange}:{draft:Equipment;busy:boolean;onChange:(value:string)=>void}){
 if(draft.costume==='c04-set-armstrong')return <p>수염이 포함된 코스튬은 원래 입 모양을 유지해요. 선택한 입은 일반 착장에서 적용돼요.</p>;
 if(draft.mouth!=='mouth080-full')return null;
 return <section className="avatar-colors079"><b>입술 색상 · 무료</b><div className="avatar-palette079" role="group" aria-label="입술 색상 선택">{LIP_COLORS_080.map(c=><button key={c.id} disabled={busy} aria-label={c.name} aria-pressed={(draft.lipColor||'lipcolor080-rose')===c.id} onClick={()=>onChange(c.id)}><i style={{background:c.color}}/>{c.name}</button>)}</div></section>;
}
