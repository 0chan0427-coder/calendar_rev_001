import{readFileSync,readdirSync,existsSync}from'node:fs';import assert from'node:assert/strict';
const root=new URL('../',import.meta.url),source=readFileSync(new URL('src/data/interiors072.ts',root),'utf8'),rows=JSON.parse(source.slice(source.indexOf('=',source.indexOf('export const'))+1).trim().replace(/;$/,''));assert.equal(rows.length,28);assert.equal(new Set(rows.map(r=>r.id)).size,28);
for(const r of rows){assert(existsSync(new URL('public'+r.image,root)),r.image);assert(r.width>0&&r.height>0);if(r.kind==='frame'){assert.equal(r.opening.length,4);const[x,y,w,h]=r.opening;assert(x>0&&y>0&&w>10&&h>10&&x+w<100&&y+h<100,r.id);}}
for(const[dir,n]of[['frames-072-01',10],['surfaces-072-01',12],['room-themes-072-01',6]])assert.equal(readdirSync(new URL('public/world/'+dir,root)).filter(n=>n.endsWith('.webp')).length,n);
// Migrations are intentionally optional in the deployment tree; apply them separately in Supabase.
console.log('V072: 10 window frames, 6 wallpapers, 6 floors, 6 room skins; paths/openings/upload groups checked.');
