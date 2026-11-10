/** Large forms scale by body height in scenes; weapons never determine body size.
 * Bounded preview/profile slots keep the existing whole-figure fit. */
export function transformationRoomScale084(group:string|undefined){
 return group==='digimon'?2:group==='gundam'?2.2:1;
}
export function transformationLayout082(frame:readonly number[],width:number,height:number,bounded:boolean,group?:string){
 const fw=frame[2],fh=frame[3];
 const scale=bounded?Math.min(Math.max(0,width)/fw,Math.max(0,height)/fh):Math.max(0,height)/1536*transformationRoomScale084(group);
 return {width:fw*scale,height:fh*scale};
}
