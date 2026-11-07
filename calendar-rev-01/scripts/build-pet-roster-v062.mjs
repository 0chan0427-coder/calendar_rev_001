import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const old=[
['cat','고양이','일반','바람','빠른 물리','빠른 지원','물리강화','민첩강화','팀가속','특방낮추기','빠르게 압박한 뒤 성체가 팀 속도를 지원'],
['dog','개','일반','일반','빠른 지원','물리 탱커','팀보호','공격낮추기','방어강화','물리강화','아기가 팀을 보호하고 성체가 물리 공격을 받아냄'],
['rabbit','토끼','풀','풀','고속 교란','빠른 특수','감속','팀가속','특수강화','회복','아기의 감속으로 성체의 특수 공격 기회를 확보'],
['panda','판다','풀','풀/땅','지원 탱커','물리 탱커','팀보호','회복','물리강화','방어강화','보호 지원과 단단한 물리 전열을 나눠 맡음'],
['fox','여우','어둠','불/어둠','빠른 지원','특수 공격','특방낮추기','팀가속','특수강화','방어자세','아기가 특수방어를 낮춘 상대를 성체가 압박'],
['tiger','호랑이','일반','불','빠른 물리','특수 공격','특방낮추기','민첩강화','특수강화','방어자세','아기 물리·성체 특수로 한쪽 방어에 치우친 상대를 공략'],
['elephant','코끼리','땅','땅','지원 탱커','물리 강타','팀보호','감속','물리강화','방어자세','아기가 피해를 줄이고 느린 성체가 강하게 공격'],
['crocodile','악어','물','물/땅','빠른 물리','물리 탱커','방어낮추기','민첩강화','방어강화','회복','아기가 물리방어를 낮추고 성체가 오래 버팀'],
['eagle','독수리','바람','바람/빛','빠른 지원','빠른 물리','팀가속','공격낮추기','물리강화','방어자세','아기는 팀 속도·성체는 빠른 마무리 담당'],
['whale','고래','물','물/얼음','지원 탱커','특수 탱커','팀보호','감속','특수강화','회복','아기는 팀 보호·성체는 특수 공격을 받아내는 역할'],
['unicorn','유니콘','빛','빛/풀','빠른 특수','지원 탱커','민첩강화','특방낮추기','회복','팀보호','아기는 특수 압박·성체는 회복과 팀 보호'],
['dragon','용','불','불/바람','빠른 물리','혼합 공격','방어낮추기','민첩강화','물리강화','특수강화','아기 물리 압박 뒤 성체가 물리·특수 중 방어가 낮은 쪽 선택'],
['wolf','늑대','얼음','얼음/어둠','빠른 지원','빠른 물리','팀가속','방어낮추기','물리강화','감속','아기 방어 약화와 성체의 빠른 물리 공격 연계'],
['bear','곰','땅','땅/얼음','균형','물리 탱커','공격낮추기','회복','방어강화','방어자세','아기는 유연한 대응·성체는 물리 방어 중심'],
['lion','사자','불','불/빛','빠른 물리','특수 공격','특방낮추기','팀가속','특수강화','공격낮추기','아기 특방 약화·성체 특수 압박, 호랑이와 지원 구성이 다름'],
['leopard','표범','어둠','어둠/바람','고속 교란','물리 강타','방어낮추기','민첩강화','물리강화','방어자세','빠른 교란과 높은 공격력의 역할 분담'],
['deer','사슴','풀','풀/빛','빠른 지원','특수 탱커','팀가속','팀보호','특수강화','회복','속도 지원과 특수 방어 담당을 연결'],
['horse','말','일반','땅/바람','고속 교란','빠른 물리','감속','팀가속','물리강화','방어자세','아기는 감속·성체는 속도 우위를 활용한 물리 공격'],
['griffin','그리핀','바람','바람/땅','빠른 특수','물리 탱커','특방낮추기','민첩강화','방어강화','팀보호','특수 공격과 물리 방어를 분담'],
['phoenix','불사조','불','불/빛','빠른 지원','특수 공격','팀가속','팀보호','특수강화','회복','아기가 기회를 만들고 성체가 특수 공격, 부활은 미도입'],
['owl','부엉이','바람','바람/어둠','빠른 특수','특수 탱커','특방낮추기','감속','특수강화','회복','아기 교란·성체 특수 방어, 느린 상대 압박'],
['penguin','펭귄','얼음','물/얼음','빠른 물리','지원 탱커','물리강화','감속','팀보호','회복','아기의 공격과 성체의 보호로 팀 약점을 보완'],
['seal','물범','물','물/얼음','빠른 특수','물리 탱커','특수강화','감속','방어강화','공격낮추기','아기 특수 공격·성체 물리 방어'],
['otter','수달','물','물/풀','고속 교란','혼합 공격','방어낮추기','특방낮추기','물리강화','특수강화','아기가 낮춘 방어에 맞춰 성체가 공격 종류 선택'],
['turtle','거북','물','물/땅','지원 탱커','특수 탱커','팀보호','방어강화','회복','특수강화','물리 쪽 지원과 특수 쪽 방어를 분담'],
['octopus','문어','물','물/어둠','빠른 지원','특수 공격','공격낮추기','특방낮추기','특수강화','감속','아기는 상대 공격을 낮추고 성체는 특수 공격'],
['shark','상어','물','물/어둠','빠른 물리','물리 강타','방어낮추기','민첩강화','물리강화','방어자세','빠른 아기와 강한 성체가 같은 상대를 지속 압박'],
['ray','가오리','물','물/전기','빠른 지원','빠른 특수','팀가속','감속','특수강화','특방낮추기','아기가 속도 차이를 만들고 성체가 빠른 특수 공격'],
['hedgehog','고슴도치','땅','땅/전기','물리 탱커','빠른 지원','방어강화','공격낮추기','팀가속','특방낮추기','아기 방어·성체 속도 지원으로 성장 역할을 반대로 구성'],
['snake','뱀','풀','풀/어둠','빠른 특수','고속 교란','특수강화','특방낮추기','감속','공격낮추기','아기는 특수 공격·성체는 상대 행동 효율을 낮추는 교란']
];
const extra=[
 ['rhino','코뿔소','땅','땅','균형','물리 강타','방어강화','감속','물리강화','방어자세','아기는 유연한 방어, 성체는 느리고 강한 물리 공격'],
 ['hippo','하마','물','물/땅','지원 탱커','물리 탱커','팀보호','공격낮추기','회복','물리강화','아기는 팀 보호, 성체는 물리 공격을 버팀'],
 ['giraffe','기린','풀','풀/빛','빠른 지원','특수 탱커','팀가속','특방낮추기','특수강화','회복','속도 지원 뒤 특수 공격과 방어를 담당'],
 ['zebra','얼룩말','일반','전기/땅','고속 교란','빠른 물리','감속','팀가속','물리강화','방어낮추기','아기가 속도를 조절하고 성체가 빠르게 공격'],
 ['gorilla','고릴라','풀','풀/땅','균형','물리 강타','공격낮추기','팀보호','물리강화','방어자세','아기는 보호 지원, 성체는 높은 물리 공격'],
 ['orangutan','오랑우탄','풀','풀/어둠','빠른 지원','혼합 공격','방어낮추기','특방낮추기','물리강화','특수강화','방어 약화와 공격 종류 선택을 조합'],
 ['sloth','나무늘보','풀','풀','지원 탱커','특수 탱커','팀보호','회복','특수강화','공격낮추기','낮은 속도를 보호·회복으로 보완'],
 ['koala','코알라','풀','풀/빛','지원 탱커','균형','팀보호','회복','특수강화','공격낮추기','아기는 보호 중심, 성체는 균형 있는 대응'],
 ['kangaroo','캥거루','일반','땅','빠른 지원','빠른 물리','팀가속','팀보호','물리강화','민첩강화','아기의 팀 지원으로 성체 공격 기회 확보'],
 ['raccoon','너구리','어둠','일반/어둠','고속 교란','혼합 공격','감속','특방낮추기','방어낮추기','특수강화','속도·방어를 낮추고 유연하게 공격'],
 ['redpanda','레서판다','풀','불/풀','빠른 특수','빠른 지원','특수강화','감속','팀가속','팀보호','아기는 특수 공격, 성체는 빠른 지원'],
 ['squirrel','다람쥐','일반','풀/전기','고속 교란','빠른 특수','감속','공격낮추기','특수강화','특방낮추기','아기의 교란으로 성체 특수 공격을 보조'],
 ['bat','박쥐','어둠','바람/어둠','빠른 특수','고속 교란','특수강화','감속','공격낮추기','특방낮추기','아기는 특수 공격, 성체는 빠른 약화 기술'],
 ['peacock','공작','빛','빛/바람','빠른 지원','특수 공격','팀보호','특방낮추기','특수강화','감속','보호와 특수방어 약화로 성체를 지원'],
 ['flamingo','홍학','물','물/바람','빠른 특수','빠른 지원','특수강화','민첩강화','팀가속','공격낮추기','아기는 공격, 성체는 속도와 공격 약화 지원'],
 ['crane','두루미','바람','바람/빛','빠른 물리','특수 탱커','방어낮추기','팀가속','특수강화','회복','공격 방식과 방어 역할을 서로 다르게 구성'],
 ['chameleon','카멜레온','풀','풀/어둠','빠른 지원','혼합 공격','공격낮추기','특방낮추기','물리강화','특수강화','상대의 약한 방어를 골라 공격'],
 ['frog','개구리','물','물/전기','고속 교란','빠른 특수','감속','팀보호','특수강화','특방낮추기','아기의 감속·보호와 성체의 빠른 특수 공격'],
 ['scorpion','전갈','땅','땅/어둠','물리 탱커','물리 강타','방어강화','공격낮추기','물리강화','방어낮추기','아기가 물리 공격을 버티고 성체가 방어를 돌파'],
 ['pegasus','페가수스','바람','바람/빛','빠른 지원','빠른 특수','팀가속','팀보호','특수강화','민첩강화','아기는 팀 지원, 성체는 빠른 특수 공격']
];
const entries=[...old,...extra];
const profiles={ '빠른 물리':[65,100,60,115,65,75], '빠른 특수':[65,60,70,110,105,70], '물리 탱커':[95,95,115,40,55,80], '특수 탱커':[100,55,80,40,95,110], '균형':[80,85,80,75,80,80], '빠른 지원':[75,55,75,115,65,95], '지원 탱커':[100,55,105,40,75,105], '물리 강타':[85,120,70,75,55,75], '특수 공격':[75,55,65,80,125,80], '혼합 공격':[75,100,65,75,100,65], '고속 교란':[60,75,60,140,75,70] };
const types=['일반','불','물','풀','전기','땅','바람','얼음','빛','어둠'];
const pnames=['몸통치기','불꽃발톱','물결치기','덩굴채찍','전기타격','바위치기','바람베기','얼음타격','빛의타격','그림자발톱'];
const snames=['기합파','불꽃탄','물대포','잎바람','전기파','모래파','돌풍','냉기탄','빛의파동','그림자파'];
const skills=[];
types.forEach((type,i)=>{for(const category of ['physical','special'])skills.push({id:`${category==='physical'?'P':'S'}${i+1}`,name:(category==='physical'?pnames:snames)[i],type,category,power:75,accuracy:100,priority:0,cooldown:0,effect:'none',description:'위력 75 · 추가 효과 없음'});});
const util=[['물리강화','atkUp','공격 1단계 상승',2],['특수강화','spaUp','특수공격 1단계 상승',2],['방어강화','defUp','방어 1단계 상승',2],['민첩강화','speUp','속도 1단계 상승',2],['공격낮추기','atkDown','상대 공격 1단계 하락',2],['방어낮추기','defDown','상대 방어 1단계 하락',2],['특방낮추기','spdDown','상대 특수방어 1단계 하락',2],['감속','speDown','상대 속도 1단계 하락',2],['회복','heal','최대 HP 25% 회복',3],['팀보호','teamGuard','아군 진영 다음 공격 피해 30% 감소 · 3턴 이내 1회',3],['팀가속','teamSpeed','아군 진영 속도 25% 상승 · 3턴',3],['방어자세','protect','이 턴에 받는 공격 피해 50% 감소',2]];
util.forEach(([name,effect,description,cooldown],i)=>skills.push({id:`U${i+1}`,name,type:'일반',category:'status',power:0,accuracy:100,priority:effect==='protect'?1:0,cooldown,effect,description}));
const utility=name=>skills.find(s=>s.name===name).id;
const statNames=['hp','atk','def','spe','spa','spd'];
const familyDescriptions={wolf:'gray wolf with silver gray fur and amber eyes',bear:'brown bear with thick chocolate brown fur',lion:'African lion with golden tawny fur; adult has a full magnificent mane',leopard:'leopard with golden coat and dark rosettes',deer:'red deer, warm russet coat; mature adult stag with elegant branched antlers',horse:'chestnut horse with dark flowing mane and white blaze',griffin:'griffin, eagle head and forelegs, lion hindquarters, broad brown gold wings',phoenix:'phoenix bird with crimson gold plumage and long elegant fiery tail feathers',owl:'Eurasian eagle owl with brown cream feathers and orange eyes',penguin:'emperor penguin with black white plumage and gold neck patches',seal:'harbor seal with mottled silver gray coat, no external ears',otter:'river otter with rich brown waterproof fur and long tail',turtle:'green sea turtle with green olive shell and four flippers',octopus:'red orange octopus with eight naturally curling arms',shark:'great white shark, gray back white belly, clearly recognizable shark silhouette',ray:'manta ray with broad dark wings and cream underside',hedgehog:'European hedgehog with brown spines and cream face',snake:'emerald green tree snake with coiled body',rhino:'white rhinoceros with gray folded skin and two horns',hippo:'hippopotamus with dusky mauve gray skin and broad muzzle',giraffe:'giraffe with ochre patch pattern, long neck and small ossicones',zebra:'plains zebra with black and white stripes and erect mane',gorilla:'western gorilla; adult powerful silverback, baby soft dark fur',orangutan:'orangutan with long copper orange fur and thoughtful face',sloth:'three toed sloth with gray brown fur, naturally crouching gripping a small branch',koala:'koala with soft gray fur, round fluffy ears and dark nose',kangaroo:'red kangaroo with russet fur and large hind legs',raccoon:'raccoon with gray brown fur, black facial mask and striped tail',redpanda:'red panda with rusty red fur, cream face and bushy ringed tail',squirrel:'red squirrel with rusty fur and magnificent bushy tail',bat:'fruit bat with dark brown fur, warm dark wing membranes and pointed ears',peacock:'Indian blue peacock; adult has magnificent fanned iridescent green blue eye spotted tail',flamingo:'greater flamingo with soft pink plumage, curved beak and slender legs',crane:'red crowned crane with white plumage black neck and red crown',chameleon:'panther chameleon with green turquoise skin, curled tail and distinctive eyes',frog:'green tree frog with emerald skin and orange toe pads',scorpion:'emperor scorpion with dark charcoal armor, two claws and raised segmented tail',pegasus:'white pegasus horse with silver flowing mane and large feathered wings'};
const existingItem={cat:'cat-white',dog:'dog-brown',dragon:'dragon-red'};
const existingSprite={cat:'cat-ivory',dog:'dog',dragon:'dragon-red'};
const affinities=['은빛 무늬','금빛 무늬','푸른 무늬','밝은 털색'];
const innate=[['swift','민첩','출전 중 속도 10% 증가'],['armor','단단한 몸','받는 물리 피해 10% 감소'],['ward','특수 방어','받는 특수 피해 10% 감소'],['power','강한 발톱','물리 공격 피해 10% 증가'],['focus','집중','특수 공격 피해 10% 증가'],['support','보호 본능','보조 기술 사용 시 자신의 최대 HP 5% 회복'],['comeback','끈기','HP가 3분의 1 이하일 때 공격 피해 15% 증가'],['precision','정확한 공격','공격 기술 명중률 +10%p']];
const pets=[],species=[];let imageIndex=0;
entries.forEach((r,i)=>{
 const [id,name,bt,at,br,ar,bu1,bu2,au1,au2,synergy]=r;const existing=i<12;
 species.push({id,name,existing,synergy,description:familyDescriptions[id]||name});
 for(const age of ['baby','adult']){
  const adult=age==='adult',role=adult?ar:br,ts=(adult?at:bt).split('/');
  const budget=adult?(id==='dragon'||id==='griffin'||id==='phoenix'||id==='whale'?600:490+(i*17%100)):(410+(i*13%85));
  let vals=profiles[role].map(v=>Math.round(v*budget/480));vals[0]+=budget-vals.reduce((a,b)=>a+b,0);
  if(adult&&id==='dragon')vals=[110,80,100,45,170,95];
  if(adult&&id==='griffin')vals=[90,155,90,135,55,75];
  if(adult&&id==='phoenix')vals=[95,45,65,110,165,120];
  if(adult&&id==='whale')vals=[160,65,110,25,100,140];
  const stats=Object.fromEntries(statNames.map((n,j)=>[n,vals[j]]));
  const physical=['빠른 물리','물리 탱커','물리 강타','고속 교란'].includes(role)||role==='혼합 공격';
  const cover=ts[1]||({일반:'땅',불:'바람',물:'얼음',풀:'일반',전기:'바람',땅:'일반',바람:'일반',얼음:'물',빛:'일반',어둠:'일반'}[ts[0]]);
  const moves=[skills.find(s=>s.type===ts[0]&&s.category===(physical?'physical':'special')).id,skills.find(s=>s.type===cover&&s.category===(role==='혼합 공격'?'special':physical?'physical':'special')).id,utility(adult?au1:bu1),utility(adult?au2:bu2)];
  const itemId=(adult?'adult-':'')+(existing?existingItem[id]||id:id);
  const spriteKey=(adult?'adult-':'')+(existing?existingSprite[id]||id:id);
  let image=null;
  if(!existing){image=`/world/pets-062-${String(Math.floor(imageIndex/20)+1).padStart(2,'0')}/${spriteKey}.png`;imageIndex++;}
  const passive=innate[(i*3+(adult?2:0))%innate.length];
  pets.push({id:`${id}-${age}`,species:id,name:(adult?'':'아기 ')+name,age,itemId,spriteKey,existing,types:ts,role,stats,total:budget,skills:moves,ability:{id:passive[0],name:passive[1],description:passive[2]},synergy,image,specialName:name+' 특별 외형',specialPalette:i%4,specialDescription:affinities[i%4]+'로 바뀝니다. 전투 능력은 그대로입니다.',price:existing?null:(adult?(budget>=575?15000:budget>=540?12000:budget>=510?8000:4000):[1500,2000,2500,3000,3500,4000][i%6]),size:adult?(['whale','dragon','griffin','phoenix','elephant','rhino','hippo'].includes(id)?[220,170]:['horse','pegasus','giraffe','zebra','deer','lion','bear','gorilla'].includes(id)?[170,155]:[120,115]):[85,85]});
 }
});
const strong={일반:[],불:['풀','얼음'],물:['불','땅'],풀:['물','땅'],전기:['물','바람'],땅:['불','전기'],바람:['풀','어둠'],얼음:['바람','빛'],빛:['어둠','전기'],어둠:['빛','얼음']};
const signatureNames=['날렵한 발톱','돌진','뛰어차기','앞발 밀기','속임수 공격','덮치기','육중한 발구르기','회전 물기','급강하','큰 물결','빛의 뿔','용의 숨결','몰아치기','앞발 강타','포효','도약 공격','숲의 기운','뒷발차기','하늘 습격','불꽃 깃털','밤의 날갯짓','얼음 미끄럼','물결 밀기','꼬리치기','등껍질 공격','먹물 분사','빠른 물기','해류 타기','가시 공격','휘감기','뿔 돌진','육중한 몸통치기','높은 발차기','번개 질주','주먹 강타','팔 휘두르기','느린 반격','나뭇잎 공격','도약차기','재빠른 습격','회전 꼬리','도토리 던지기','초음파','깃털 부채','날개치기','긴 부리','위장 습격','물방울 탄','집게 공격','천공 질주'];
for(let i=0;i<pets.length;i++){
 const p=pets[i],oldSkill=skills.find(s=>s.id===p.skills[1]);
 const effect=i%3===0?'speDown':oldSkill.category==='physical'?'defDown':'spdDown';
 const effectName=effect==='speDown'?'속도':effect==='defDown'?'방어':'특수방어';
 const power=85+(Math.floor(i/2)%3)*5;
 const skill={id:'X'+(i+1),name:(p.age==='baby'?'아기 ':'')+species[Math.floor(i/2)].name+' · '+signatureNames[Math.floor(i/2)],type:oldSkill.type,category:oldSkill.category,power,accuracy:90,priority:0,cooldown:2,effect,effectChance:25,description:'위력 '+power+' · 명중 90% · 25% 확률로 상대 '+effectName+' 1단계 하락'};
 skills.push(skill);p.skills[1]=skill.id;
}
const data={version:62,types,strong,species,pets,skills};
if(pets.length!==100||pets.filter(p=>p.total===600).length!==4||pets.some(p=>p.total>600||Object.values(p.stats).reduce((a,b)=>a+b,0)!==p.total))throw Error('Roster constraints');
fs.writeFileSync(path.join(root,'src/data/pet-battle-catalog.json'),JSON.stringify(data,null,2)+'\n');
const jobs=pets.filter(p=>!p.existing).map(p=>({id:p.id,image:p.image,spriteKey:p.spriteKey,species:p.species,subject:familyDescriptions[p.species],age:p.age}));
fs.writeFileSync('/workspace/scratch/5dd4e3617c7a/pet-image-jobs.json',JSON.stringify(jobs,null,2));
console.log(`Roster: ${species.length} species, ${pets.length} forms, ${jobs.length} new images, four 600-stat adults.`);
