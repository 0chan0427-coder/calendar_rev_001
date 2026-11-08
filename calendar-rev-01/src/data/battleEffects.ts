import {BATTLE_PETS,SKILL_BY_ID} from './petRoster';
import type {BattleEvent} from '../services/petBattle';
const palettes:Record<string,[string,string]>={일반:['#f2d8a0','#fff9e6'],불:['#ee713f','#ffe3a0'],물:['#50b4df','#e1faff'],풀:['#7bb76a','#e6f9b7'],전기:['#efca38','#ffffc1'],땅:['#b48b5e','#f7ddb5'],바람:['#85c7c0','#f1ffed'],얼음:['#85cbe8','#f2ffff'],빛:['#e5c873','#fff9d9'],어둠:['#9a73bc','#e4d5f5']};
const signatures:Record<string,string>={cat:'claw',dog:'charge',rabbit:'kick',panda:'slam',fox:'shadow',tiger:'leap',elephant:'stomp',crocodile:'bite',eagle:'dive',whale:'tide',unicorn:'horn',dragon:'breath',wolf:'claw',bear:'slam',lion:'roar',leopard:'leap',deer:'grove',horse:'kick',griffin:'dive',phoenix:'feathers',owl:'sonic',penguin:'slide',seal:'tide',otter:'tail',turtle:'shell',octopus:'ink',shark:'bite',ray:'tide',hedgehog:'spikes',snake:'coil',rhino:'charge',hippo:'stomp',giraffe:'kick',zebra:'dash',gorilla:'fist',orangutan:'sweep',sloth:'counter',koala:'leaves',kangaroo:'kick',raccoon:'shadow',redpanda:'tail',squirrel:'acorn',bat:'sonic',peacock:'fan',flamingo:'wing',crane:'beak',chameleon:'camouflage',frog:'bubbles',scorpion:'pincer',pegasus:'skyDash'};
export function effectProfile(event:BattleEvent){
 const skill=event.skillId?SKILL_BY_ID[event.skillId]:undefined;
 const pet=event.skillId?.startsWith('X')?BATTLE_PETS.find(p=>p.skills.includes(event.skillId!)):undefined;
 const signature=Boolean(pet),type=event.type||skill?.type||'일반';
 const motif=pet?signatures[pet.species]:type==='불'?'flame':type==='물'?'tide':type==='풀'?'leaves':type==='전기'?'lightning':type==='땅'?'rocks':type==='바람'?'wind':type==='얼음'?'ice':type==='빛'?'star':type==='어둠'?'shadow':'slash';
 const category=event.category||skill?.category||'status';
 return{name:skill?.name||event.text,type,category,motif,signature,adult:pet?.age==='adult',color:palettes[type]?.[0]||palettes.일반[0],light:palettes[type]?.[1]||palettes.일반[1]};
}
