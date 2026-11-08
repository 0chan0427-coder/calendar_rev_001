import {readFileSync,readdirSync} from 'node:fs';import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..'),text=readFileSync(resolve(root,'src/data/collection02.ts'),'utf8'),marker='export const COLLECTION_02:CollectionItem[]=';const items=JSON.parse(text.slice(text.indexOf(marker)+marker.length,text.lastIndexOf(';')));
if(items.length!==20||new Set(items.map(i=>i.id)).size!==20)throw Error('Costume 02 must have exactly 20 unique items');
const files=readdirSync(resolve(root,'public/world/wardrobe-02')).filter(f=>/\.(png|webp)$/.test(f));if(files.length!==20)throw Error('Wardrobe 02 image folder must contain exactly 20 files');
const fits=readFileSync(resolve(root,'src/lib/avatarFitting.ts'),'utf8'),accessories=readFileSync(resolve(root,'src/lib/avatarAccessories.ts'),'utf8');
for(const i of items){
 const data=readFileSync(resolve(root,'public',i.image.slice(1)));if(data.subarray(0,4).toString()!=='RIFF'||data.subarray(8,12).toString()!=='WEBP')throw Error('Invalid WebP '+i.id);
 let size;for(let offset=12;offset+8<data.length;){const kind=data.subarray(offset,offset+4).toString(),length=data.readUInt32LE(offset+4),start=offset+8;
 if(kind==='VP8X')size=[data.readUIntLE(start+4,3)+1,data.readUIntLE(start+7,3)+1];
 if(kind==='VP8L'){const bits=data.readUInt32LE(start+1);size=[(bits&16383)+1,((bits>>>14)&16383)+1];}
 if(kind==='VP8 ')size=[data.readUInt16LE(start+6)&16383,data.readUInt16LE(start+8)&16383];
 offset=start+length+(length%2);}
 if(!size||size[0]!==i.width||size[1]!==i.height)throw Error('Source dimensions differ from registry '+i.id);
 if(data.length>24*1024*1024)throw Error('GitHub single-file size '+i.id);
 if(i.price<=0||i.price%100!==0)throw Error('Invalid price '+i.id);
 if(i.crop.length!==4||i.crop[0]<0||i.crop[1]<0||i.crop[0]+i.crop[2]>i.width||i.crop[1]+i.crop[3]>i.height)throw Error('Invalid measured crop '+i.id);
 if(['top','hat'].includes(i.slot)&&!fits.includes("'"+i.id+"':"))throw Error('Missing per-item fitting '+i.id);
 if(i.slot==='accessory'&&!accessories.includes("'"+i.id+"':"))throw Error('Missing per-item accessory anchor '+i.id);
}
console.log('Costume 02 checks passed: 20 independently registered items, fitted tops/headwear/accessories, one image folder of 20.');
