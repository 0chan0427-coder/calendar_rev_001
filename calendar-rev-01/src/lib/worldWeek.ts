export function worldWeekStart(now=new Date()){
 const seoul=new Date(now.getTime()+9*60*60*1000),day=seoul.getUTCDay();seoul.setUTCDate(seoul.getUTCDate()+(day===0?-6:1-day));return seoul.toISOString().slice(0,10);
}
export function previousWorldWeek(now=new Date()){const d=new Date(worldWeekStart(now)+'T00:00:00Z');d.setUTCDate(d.getUTCDate()-7);return d.toISOString().slice(0,10);}
