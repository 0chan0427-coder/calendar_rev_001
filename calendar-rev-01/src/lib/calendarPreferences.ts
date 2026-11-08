const key=(userId:string)=>`ssiksik-calendar-selection:${userId}`;
export function restoreCalendarSelection(userId:string,availableIds:string[],linkedRoom?:string|null):string[]{
 if(linkedRoom&&availableIds.includes(linkedRoom))return[linkedRoom];
 try{const saved=JSON.parse(localStorage.getItem(key(userId))||'null');return Array.isArray(saved)?[...new Set(saved.filter((id):id is string=>typeof id==='string'&&availableIds.includes(id)))]:[];}catch{return[];}
}
export function saveCalendarSelection(userId:string,ids:string[]){try{localStorage.setItem(key(userId),JSON.stringify(ids));}catch{/* Selection still works when storage is unavailable. */}}
