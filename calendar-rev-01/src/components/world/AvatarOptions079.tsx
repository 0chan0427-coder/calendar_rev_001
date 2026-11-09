import {HAIR_COLORS_079,EYE_COLORS_079,HAIR_COLOR_ORIGINAL_079,EYE_COLOR_ORIGINAL_079} from '../../data/avatarColors079';
import type {Equipment} from '../../data/wardrobe';
import type {AvatarPreset079,AvatarPresetSlot079} from '../../lib/avatarPresets079';
export function AvatarPresets079({presets,busy,ready,canSave,onSave,onLoad}:{presets:AvatarPreset079[];busy:boolean;ready:boolean;canSave:boolean;onSave:(slot:AvatarPresetSlot079)=>void;onLoad:(preset:AvatarPreset079)=>void}){
 return <section className="avatar-presets079" aria-label="착장 프리셋"><div><b>착장 프리셋</b><small>착장과 색상을 함께 저장해요.</small></div><div className="avatar-preset-grid079">{(['A','B','C'] as const).map(slot=>{const preset=presets.find(p=>p.slot===slot);return <article key={slot}><strong>{slot}</strong><span>{preset?'저장됨':'비어 있음'}</span><button disabled={busy||!ready||!preset} onClick={()=>preset&&onLoad(preset)}>불러오기</button><button disabled={busy||!ready||!canSave} onClick={()=>onSave(slot)}>{preset?'덮어쓰기':'저장'}</button></article>;})}</div><small>불러온 뒤 ‘착용 저장’을 누르면 미니홈피에도 적용돼요.</small></section>;
}
export function AvatarColors079({draft,slot,busy,onChange}:{draft:Equipment;slot:string;busy:boolean;onChange:(part:'hairColor'|'eyeColor',value:string)=>void}){
 if(slot!=='hair'&&slot!=='face')return null;
 const hair=slot==='hair',part=hair?'hairColor':'eyeColor',original=hair?HAIR_COLOR_ORIGINAL_079:EYE_COLOR_ORIGINAL_079,colors=hair?HAIR_COLORS_079:EYE_COLORS_079;
 const locked=hair?Boolean(draft.costume&&draft.costume!=='costume-none'):draft.makeup==='makeup-mukuro-six';
 const selected=draft[part]||original,label=selected===original?'원본 색상':colors.find(c=>c.id===selected)?.name||'원본 색상';
 return <section className="avatar-colors079"><div><b>{hair?'헤어 색상':'눈 색상'}</b><span>{locked?'고유 색상 고정':`${label} · 무료`}</span></div>{locked&&<p>{hair?'전체 코스튬에 포함된 헤어 색상은 고정돼요.':'무쿠로 六 오드아이는 고유 색상과 문양을 유지해요.'}</p>}<div className="avatar-palette079" role="group" aria-label={hair?'헤어 색상 선택':'홍채 색상 선택'}><button disabled={busy||locked} aria-pressed={selected===original} onClick={()=>onChange(part,original)}>원본</button>{colors.map(c=><button key={c.id} disabled={busy||locked} aria-label={c.name} title={c.name} aria-pressed={selected===c.id} onClick={()=>onChange(part,c.id)}><i style={{background:c.color}}/>{c.name}</button>)}</div></section>;
}
