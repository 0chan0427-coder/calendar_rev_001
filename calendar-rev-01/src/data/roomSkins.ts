import {INTERIORS_072} from './interiors072';
import type {WorldItem} from '../types/world';
export const interiorDesign=(id?:string|null)=>INTERIORS_072.find(i=>i.id===id);
export const isRoomSkin=(id:string)=>id==='room-default'||interiorDesign(id)?.kind==='room';
export const INTERIOR_ITEMS:WorldItem[]=[{id:'room-default',name:'기본 방',type:'theme',category:'실내 테마',price:0,image:'🏠',placement_type:'none',description:'기본 방으로 돌아갑니다. 배치 가구는 보관함으로 돌려놓습니다.'},...INTERIORS_072.map(i=>({id:i.id,name:i.name,price:i.price,type:i.kind==='wall'?'wallpaper':i.kind==='floor'?'floor':i.kind==='room'?'theme':'props',category:i.kind==='wall'?'벽지':i.kind==='floor'?'바닥':i.kind==='room'?'실내 테마':'창문',subcategory:i.kind==='frame'?'프레임':i.kind==='room'?'전체 스킨':'소재',image:i.image,image_url:i.image,placement_type:'none',description:i.kind==='room'?'방 전체의 배경과 고정 장식을 변경합니다. 기존 배치 가구와 창문은 보관함으로 돌아갑니다.':i.kind==='frame'?'한 개의 창문 자리에 적용하는 프레임. 창밖 풍경은 별도로 선택합니다.':'집 안의 소재를 변경합니다. 실내 테마 적용 중이면 기본 방으로 돌아갑니다.'}))];
