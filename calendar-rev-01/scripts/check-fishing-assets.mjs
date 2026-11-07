import{readFileSync,readdirSync}from'node:fs';import{resolve,dirname}from'node:path';import{fileURLToPath}from'node:url';import{inflateSync}from'node:zlib';import{execFileSync}from'node:child_process';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');const catalog=JSON.parse(readFileSync(resolve(root,'src/data/fishing-catalog.json'),'utf8')),ids=new Set(),folders=new Set();
for(const f of catalog.species){if(ids.has(f.id))throw Error('Duplicate fish ID');ids.add(f.id);if(f.min_cm>=f.max_cm||f.weight<=0||f.base_price<=0||f.base_price*1.5>catalog.sale_cap)throw Error(`Invalid fish economy: ${f.id}`);if(!f.locations.length||f.locations.some(id=>!catalog.locations.some(l=>l.id===id)))throw Error(`Invalid fish location: ${f.id}`);if(f.crop.length!==4||f.crop.some(n=>!Number.isFinite(n))||f.crop[2]<=0||f.crop[3]<=0)throw Error(`Invalid fish crop: ${f.id}`);
 if(!/^\/world\/fishing-\d+(?:-\d+)?\/[-a-z]+\.png$/.test(f.image_path))throw Error(`Invalid fish image path: ${f.id}`);const file=resolve(root,'public',f.image_path.slice(1)),png=readFileSync(file);folders.add(dirname(file));if(png.length>=25*1024*1024||png[24]!==8||png[25]!==6)throw Error(`Fish must be RGBA PNG under 25MiB: ${f.id}`);const width=png.readUInt32BE(16),height=png.readUInt32BE(20);if(f.crop[0]<0||f.crop[1]<0||f.crop[0]+f.crop[2]>width||f.crop[1]+f.crop[3]>height)throw Error(`Fish crop exceeds image: ${f.id}`);
 let end=false,parts=[];for(let p=8;p<png.length;){const len=png.readUInt32BE(p),type=png.toString('ascii',p+4,p+8);if(p+len+12>png.length)throw Error('Truncated fish PNG');if(type==='IDAT')parts.push(png.subarray(p+8,p+8+len));p+=len+12;if(type==='IEND'){end=p===png.length;break;}}if(!end||inflateSync(Buffer.concat(parts)).length!==(width*4+1)*height)throw Error(`Incomplete fish PNG: ${f.id}`);
}
for(const folder of folders)if(readdirSync(folder).filter(f=>f.endsWith('.png')).length>20)throw Error('Fish image folder exceeds 20 files.');
for(const b of catalog.baits)if(b.modifiers.length!==5||b.modifiers.some(n=>n<=0)||b.size_bias<0||b.size_bias>1||(b.pack_price>0&&(b.pack_size<=0||b.pack_price%b.pack_size!==0)))throw Error(`Invalid bait: ${b.id}`);
execFileSync(process.execPath,[resolve(root,'scripts/sync-fishing-catalog.mjs'),'--check'],{stdio:'inherit'});console.log(`Fishing checks passed: ${ids.size} fish images, sizes, locations, bait effects and SQL seed.`);
// V058 first-person layers are runtime assets; SQL migrations remain optional in the deployment tree.
for(const name of ['pond','coast','hands']){
 const file=resolve(root,`public/world/fishing-058/${name}.png`),bytes=readFileSync(file);
 if(bytes.length>=25*1024*1024||bytes[24]!==8||![2,6].includes(bytes[25]))throw Error(`Invalid fishing scene: ${name}`);
 if(name==='hands'&&bytes[25]!==6)throw Error('Hands need a transparent RGBA layer.');
 let end=false,parts=[];for(let p=8;p<bytes.length;){const n=bytes.readUInt32BE(p),type=bytes.toString('ascii',p+4,p+8);if(p+n+12>bytes.length)throw Error('Truncated scene PNG');if(type==='IDAT')parts.push(bytes.subarray(p+8,p+8+n));p+=n+12;if(type==='IEND'){end=p===bytes.length;break;}}
 const channels=bytes[25]===6?4:3;if(!end||inflateSync(Buffer.concat(parts)).length!==(bytes.readUInt32BE(16)*channels+1)*bytes.readUInt32BE(20))throw Error(`Incomplete fishing scene: ${name}`);
}
const fightSource=readFileSync(resolve(root,'src/data/fishingFight.ts'),'utf8'),tierSource=readFileSync(resolve(root,'src/services/fishing.ts'),'utf8');
if(!fightSource.includes('stepFishingFight')||!tierSource.includes("['일반','고급','희귀','매우 희귀','극희귀']")||JSON.stringify(catalog.tiers)!==JSON.stringify(['일반','고급','희귀','매우 희귀','극희귀']))throw Error('Fishing fight/grade configuration mismatch.');
console.log('V058 POV layers and grade labels checked.');

// V059 metadata drives both the server fight and aquarium animation.
const motions=new Set(['fish','eel','crustacean','cephalopod','octopus','seahorse','jelly','turtle','whale','star','bottom']);
const patterns=new Set(['steady','agile','burst']);
for(const s of catalog.species){
 if(!motions.has(s.motion)||!patterns.has(s.fight_pattern)||!Number.isInteger(s.tier)||s.tier<0||s.tier>4||!Number.isInteger(s.weight))throw Error(`Invalid species metadata: ${s.id}`);
}
for(const loc of catalog.locations){
 const available=catalog.species.filter(s=>s.locations.includes(loc.id));
 if(available.reduce((n,s)=>n+s.weight,0)!==1000000)throw Error(`Unbalanced location weight: ${loc.id}`);
 if(new Set(available.map(s=>s.tier)).size!==5)throw Error(`Location missing a grade: ${loc.id}`);
}
if(catalog.version===59&&catalog.species.length!==60)throw Error('V059 requires all 60 species.');
console.log('V059 species motions, fight patterns and probabilities checked.');
