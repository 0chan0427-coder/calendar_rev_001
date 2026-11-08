import {readFileSync,existsSync,readdirSync} from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url),text=readFileSync(new URL('src/data/catalogThumbnails.ts',root),'utf8');
const map=JSON.parse(text.slice(text.indexOf('=')+1).trim().replace(/;$/,''));assert.equal(Object.keys(map).length,29);
for(const [source,target]of Object.entries(map)){assert(existsSync(new URL('public'+source,root)),source);assert(existsSync(new URL('public'+target,root)),target);}
for(const [folder,count]of [['catalog-thumbs-070-01',20],['catalog-thumbs-070-02',9]])assert.equal(readdirSync(new URL('public/world/'+folder,root)).length,count);
console.log('V070: 29 registered catalog thumbnails, sources and upload groups checked.');
