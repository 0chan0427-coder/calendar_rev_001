import {memo} from 'react';
import {BATTLE_PETS} from '../../data/petRoster';
import {isBattleFighter,type BattleFighter,type BattleRoom,type BattleTeamEntry} from '../../services/petBattle';
import CompanionAvatar from '../world/CompanionAvatar';

function Art({pet,animate=false}:{pet:BattleFighter;animate?:boolean}){
 return <CompanionAvatar itemId={pet.itemId} name={pet.name} equipment={pet.equipment} specialForm={pet.special_form} rewardAccessory={pet.reward_accessory} animate={animate}/>;
}
function Fighter({pet,opponent}:{pet:BattleFighter|undefined;opponent:boolean}){
 const species=pet?BATTLE_PETS.find(p=>p.id===pet.id)?.name:undefined;
 return <div className={`battle-combatant ${opponent?'is-opponent':'is-player'}`}>
  <div className="battle-combatant-art">{pet?<div className="battle-facing"><Art pet={pet} animate/></div>:<div className="battle-stage-placeholder" aria-label={opponent?'상대 첫 출전 선택 대기':'내 첫 출전 선택 대기'}><b>{opponent?'?':'출전 준비'}</b><span>{opponent?'상대가 동물을 고르고 있어요':'아래에서 첫 동물을 골라주세요'}</span></div>}</div>
  {pet&&<div className="battle-combatant-info"><div><strong>{pet.name}</strong><span>{species!==pet.name?species+' · ':''}{pet.types.join(' · ')}</span></div><div className="battle-hp-row"><progress max={pet.maxHp} value={pet.hp} aria-label={`${pet.name} HP`}/><b>{pet.hp}<small> / {pet.maxHp}</small></b></div><small>{pet.ability.name}{pet.special_form?' · 특별 외형':''}{Object.values(pet.stages).some(v=>v!==0)?' · 능력 변화':''}</small></div>}
 </div>;
}
export const BattleTeamStrip=memo(function BattleTeamStrip({room,side}:{room:BattleRoom;side:number}){
 const own=side===room.side,active=room.state.active[side];
 return <section className={`battle-squad ${own?'is-own':'is-enemy'}`} aria-label={own?'내 팀':'상대 팀'}><header><b>{own?'내 팀':room.opponentName}</b><small>{own?'3마리 편성':'출전한 동물만 공개'}</small></header><div className="battle-squad-slots">{room.state.teams[side].map((entry:BattleTeamEntry,index:number)=>{
  const shown=isBattleFighter(entry)&&(own||entry.revealed===true||active===index),pet=shown&&isBattleFighter(entry)?entry:undefined;
  return <div key={index} className={`battle-squad-slot ${active===index?'is-active':''} ${pet?.hp===0?'is-fainted':''} ${pet?'':'is-hidden'}`} aria-label={pet?`${pet.name}${active===index?' 출전 중':''}`:`상대 동물 ${index+1}, 미공개`}>
   <div className="battle-squad-art">{pet?<Art pet={pet}/>:<span className="battle-question" aria-hidden="true">?</span>}</div><div><b>{pet?.name||'미공개'}</b><small>{pet?(pet.hp===0?'쓰러짐':active===index?'출전 중':own?'대기':'공개됨'):'출전 전'}</small></div>
  </div>;
 })}</div></section>;
});
export default memo(function BattleArena({room}:{room:BattleRoom}){
 const own=room.state.teams[room.side][room.state.active[room.side]],enemy=room.state.teams[1-room.side][room.state.active[1-room.side]];
 return <div className="battle-stage" aria-label="동물 대전 경기장"><div className="battle-stage-sky"/><div className="battle-stage-platform enemy-platform"/><div className="battle-stage-platform player-platform"/><span className="battle-stage-mark" aria-hidden="true">VS</span><Fighter pet={isBattleFighter(enemy)?enemy:undefined} opponent/><Fighter pet={isBattleFighter(own)?own:undefined} opponent={false}/></div>;
});
