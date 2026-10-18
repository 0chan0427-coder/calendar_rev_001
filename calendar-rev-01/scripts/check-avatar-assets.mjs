import {readFileSync,readdirSync} from 'node:fs';
import {resolve,dirname,basename} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(process.argv[2]||resolve(dirname(fileURLToPath(import.meta.url)),'..'));
const text=readFileSync(resolve(root,'src/data/collection01.ts'),'utf8');
const marker='export const COLLECTION_01:CollectionItem[]=';
const start=text.indexOf(marker)+marker.length,end=text.indexOf('\n];',start)+2;
if(start<marker.length||end<2)throw Error('Collection catalog must remain a JSON array.');
const items=JSON.parse(text.slice(start,end));
const fits=readFileSync(resolve(root,'src/lib/avatarFitting.ts'),'utf8');
const [garment,headwear]=fits.split('export const HEADWEAR_FITS:');
const registered=(source,id)=>source.includes("'"+id+"':");
const fail=(id,message)=>{throw Error(`Avatar fitting: ${id}: ${message}`);};
const unique=new Set(),paths=new Set(),dirs=new Set();
for(const item of items){
 if(unique.has(item.id))fail(item.id,'duplicate item ID');unique.add(item.id);
 if(paths.has(item.image))fail(item.id,'duplicate asset path');paths.add(item.image);
 if(!/^\/world\/[^/]+\/[^/]+\.png$/.test(item.image))fail(item.id,'invalid image path');
 const file=resolve(root,'public',item.image.slice(1)),png=readFileSync(file);
 if(png.readUInt32BE(16)!==item.width||png.readUInt32BE(20)!==item.height)fail(item.id,'PNG dimensions differ from registered source dimensions');
 const validBox=b=>Array.isArray(b)&&b.length===4&&b.every(Number.isFinite)&&b[2]>0&&b[3]>0;
 if(!validBox(item.box)||!validBox(item.crop))fail(item.id,'missing/invalid placement or alpha crop');
 const inSource=b=>validBox(b)&&b[0]>=0&&b[1]>=0&&b[0]+b[2]<=item.width&&b[1]+b[3]<=item.height;
 if(!inSource(item.crop))fail(item.id,'crop extends outside its PNG');
 if(item.slot==='hair'&&!item.hairLayers?.backPath)fail(item.id,'register the original-image front/back hair split');
 if(item.slot==='top'&&!registered(garment,item.id))fail(item.id,'register neck, bodice, shoulder and cuff fitting before adding a top');
 if(item.slot==='outer'&&item.id!=='outer-wizard'&&!registered(garment,item.id))fail(item.id,'register the outer garment fitting before adding it');
 if(item.slot==='hat'&&!registered(headwear||'',item.id))fail(item.id,'register head opening / front-back headwear fitting');
 if(item.slot==='shoes'&&(!item.feet||item.feet.length!==2||!item.feet.every(inSource)))fail(item.id,'register both feet in original-image coordinates');
 dirs.add(dirname(file));
}
for(const dir of dirs){const count=readdirSync(dir).filter(n=>n.endsWith('.png')).length;const limit=basename(dir)==='wardrobe-01'?40:20;if(count>limit)fail(dir,`folder has ${count} images; upload groups must contain at most ${limit}`);}
console.log(`Avatar source/fitting checks passed: ${items.length} designs. Visual fit review is also required.`);
