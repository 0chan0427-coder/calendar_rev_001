import type {CSSProperties} from 'react';
import {effectProfile} from '../../data/battleEffects';
import type {ActiveBattleEffect} from './useBattlePlayback';

export default function BattleEffects({active,ownSide}:{active:ActiveBattleEffect|null;ownSide:number}){
 if(!active)return null;
 const {event,stage}=active,p=effectProfile(event),impact=stage==='impact',own=event.side===ownSide;
 const from=own?[270,460]:[750,225],to=own?[750,225]:[270,460];
 const status=p.category==='status',debuff=event.changes?.some(c=>c.delta<0),buff=event.changes?.some(c=>c.delta>0)||['teamSpeed','teamGuard','protect'].includes(event.effect||'')&&event.applied;
 const kind=event.kind!=='skill'?event.kind:event.hit===false?'miss':event.healing&&event.effect==='heal'?'heal':status?(debuff?'debuff':buff?'buff':'status'):'attack';
 const destination=status&&!debuff?from:to;
 const particles=Array.from({length:p.signature?12:7},(_,i)=>i),entry=event.kind==='entry',switching=event.kind==='switch';
 const style={'--fx-color':p.color,'--fx-light':p.light,'--fx-from-x':`${from[0]/10}%`,'--fx-from-y':`${from[1]/7.2}%`,'--fx-to-x':`${destination[0]/10}%`,'--fx-to-y':`${destination[1]/7.2}%`} as CSSProperties;
 return <div className={`battle-fx ${impact?'is-impact':'is-casting'} ${p.signature?'is-signature':''}`} key={active.key} data-kind={kind} data-from={own?'player':'enemy'} data-motif={p.motif} style={style} aria-hidden="true">
 <div className="battle-skill-announcement"><small>{entry?'출전 공개':switching?'동물 교체':`${event.actorName}${p.signature?' · 고유기':''}`}</small><b>{entry?'양쪽 동물이 출전합니다':switching?`${event.actorName} 출전`:p.name}</b></div>
 <svg className="battle-fx-art" viewBox="0 0 1000 720" preserveAspectRatio="none">
 <defs><radialGradient id={`fx-glow-${event.order}`}><stop offset="0" stopColor={p.light} stopOpacity=".85"/><stop offset="1" stopColor={p.color} stopOpacity="0"/></radialGradient></defs>
 {entry?<>{[[270,460],[750,225]].map(([x,y],i)=><g key={i} transform={`translate(${x} ${y})`} className="fx-entry-rings"><ellipse rx="100" ry="35"/><ellipse rx="70" ry="25"/><path d="M-85 0L-100-75M85 0L100-75M-40 5L-48-100M40 5L48-100"/></g>)}</>:switching?<g transform={`translate(${from[0]} ${from[1]})`} className="fx-entry-rings"><ellipse rx="95" ry="32"/><path d="M-70 0Q0-180 70 0M-40 0Q0-140 40 0"/></g>:<>
 {!impact&&<g transform={`translate(${from[0]} ${from[1]})`} className="fx-casting-aura"><circle r={p.signature?125:85} fill={`url(#fx-glow-${event.order})`}/><ellipse rx="90" ry="30"/><path d="M-55 8Q-95-65-50-100M55 8Q95-65 50-100"/></g>}
 {!impact&&!status&&p.category==='special'&&<g className="fx-projectile"><circle r={p.signature?30:20} fill={p.light} stroke={p.color} strokeWidth="8"/>{particles.slice(0,5).map(i=><path key={i} d={`M${-25-i*10} ${i%2?18:-18}L${-70-i*13} ${i%2?25:-25}`} stroke={p.color} strokeWidth="5"/>)}</g>}
 {impact&&event.hit!==false&&<g transform={`translate(${destination[0]} ${destination[1]})`}>
 {(status||event.effect==='heal')?<g className="fx-status-rings"><circle r="100" fill={`url(#fx-glow-${event.order})`}/><ellipse rx="100" ry="35"/><ellipse rx="70" ry="24"/>{event.applied&&particles.map(i=><g key={i} transform={`translate(${(i%4-1.5)*38} ${Math.floor(i/4)*45-60})`} className={debuff?'fx-stat-down':'fx-stat-up'}>{event.effect==='heal'?<path d="M-10 0H10M0-10V10" strokeWidth="8"/>:<path d={debuff?'M-9-6L0 5 9-6M0-15V3':'M-9 6L0-5 9 6M0 15V-3'}/>}</g>)}</g>:<>
 <circle r={p.signature?150:110} className="fx-impact-glow" fill={`url(#fx-glow-${event.order})`}/>
 <circle r={p.signature?100:65} className="fx-shock-ring"/>
 {['slash','claw','kick','leap','charge','dash','slide','fist','sweep','tail','counter','beak','skyDash'].includes(p.motif)&&<g className="fx-slashes"><path d="M-80 65Q-5-15 45-90M-42 85Q28 0 85-65M-100 20Q-40-45 0-100"/></g>}
 {['bite','pincer','coil','shell','horn'].includes(p.motif)&&<g className="fx-jaws"><path d="M-100-55Q0-135 100-55L70-15 45-45 0-10-45-45-70-15ZM-100 55Q0 135 100 55L70 15 45 45 0 10-45 45-70 15Z" fill={p.light}/></g>}
 {['tide','bubbles','ink'].includes(p.motif)&&<g className="fx-waves">{[0,1,2].map(i=><path key={i} d={`M-135 ${i*34-25}Q-75 ${i*34-90} -20 ${i*34-25}T100 ${i*34-25}`} />)}</g>}
 {['breath','flame','feathers'].includes(p.motif)&&<g className="fx-flames">{[-1,0,1].map((i)=><path key={i} transform={`translate(${i*46} ${Math.abs(i)*18})`} d="M0 75Q-65 15-20-60Q-15-15 10-105Q75-25 42 32Q35 70 0 75Z" fill={i===0?p.light:p.color}/>)}</g>}
 {['sonic','roar','wind','dive','wing','fan','camouflage','shadow'].includes(p.motif)&&<g className="fx-sonic">{[55,95,135].map(r=><ellipse key={r} rx={r} ry={r*.7}/>)}</g>}
 {p.motif==='lightning'&&<path className="fx-lightning" d="M35-145L-30-30 30-40-30 130 0 20-45 25Z" fill={p.light}/>}
 {particles.map(i=>{const angle=i*Math.PI*2/particles.length;return <g key={i} transform={`rotate(${angle*180/Math.PI})`}><g className="fx-particle" style={{'--particle-delay':`${i*16}ms`} as CSSProperties} transform={`translate(${80+i%3*16} 0)`}>{['leaves','grove','feathers','fan','wing'].includes(p.motif)?<path d="M0 0Q-20-32 2-45Q25-18 0 0Z" fill={p.light}/>:['ice','rocks','spikes','acorn'].includes(p.motif)?<path d="M-10-14L8-25 20 0 0 18Z" fill={p.light}/>:<path d="M-7 0L0-14 7 0 0 14Z" fill={p.light}/>}</g></g>;})}
 </>}
 {(event.blocked||status&&event.applied&&['teamGuard','protect'].includes(event.effect||''))&&<g className="fx-shield"><path d="M0-110L80-80 65 30Q55 85 0 115Q-55 85-65 30L-80-80Z"/><path d="M0-80V80M-45 0H45"/></g>}
 {!status&&debuff&&event.applied&&<g className="fx-stat-down" transform="translate(0 -120)"><path d="M-15-12L0 8 15-12M0-30V4"/></g>}
 </g>}
 </>}
 </svg>
 {impact&&event.kind==='skill'&&<>
 {event.hit===false?<div className="battle-fx-number is-miss" style={{left:`${to[0]/10}%`,top:`${to[1]/7.2}%`}}>빗나감</div>:event.damage? <div className="battle-fx-number" style={{left:`${to[0]/10}%`,top:`${to[1]/7.2}%`}}>−{event.damage}{event.blocked&&<small>방어</small>}</div>:status&&!event.applied?<div className="battle-fx-number is-neutral" style={{left:`${destination[0]/10}%`,top:`${destination[1]/7.2}%`}}>변화 없음</div>:null}
 {Boolean(event.healing)&&<div className="battle-fx-number is-heal" style={{left:`${from[0]/10}%`,top:`${from[1]/7.2}%`}}>+{event.healing}</div>}
 </>}
 </div>;
}
