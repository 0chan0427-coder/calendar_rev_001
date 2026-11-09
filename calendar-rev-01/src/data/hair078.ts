import type {Box,CollectionItem} from './collection01';
/** Basic hair uses the same avatar-space artwork and layering as paid hair. */
export function originalBaseHair078(id:string|undefined,gender:'male'|'female'):CollectionItem|undefined{
 if(!id||!['hair-chestnut','hair-short-chestnut','hair-bob-brown'].includes(id))return undefined;
 const bob=id==='hair-bob-brown'||(id==='hair-chestnut'&&gender==='female');
 const crop:Box=bob?[20,66,1214,997]:[175,57,896,606];
 const box:Box=bob?[142,8,740,608]:[174,12,677,458];
 const sx=box[2]/crop[2],sy=box[3]/crop[3];
 // Keep the antialiased fringe around the opaque bounds without changing fitting.
 return {id,slot:'hair',name:bob?'기본 단발':'기본 짧은 머리',price:0,kind:'hair',image:`/world/hair-078/${bob?'bob':'short'}.png`,width:1254,height:1254,crop:[crop[0]-3,crop[1]-3,crop[2]+6,crop[3]+6],box:[box[0]-3*sx,box[1]-3*sy,box[2]+6*sx,box[3]+6*sy],hairLayers:{backPath:bob?'M430 970Q627 1060 824 970L900 1254H350Z':'M400 800H850V1254H400Z'}};
}
export const ORIGINAL_HAIR_IDS_078=new Set(['hair-chestnut','hair-short-chestnut','hair-bob-brown','hair-wave','hair-sidepart','hair-curls','hair-long','hair-twintail','hair-pony']);
