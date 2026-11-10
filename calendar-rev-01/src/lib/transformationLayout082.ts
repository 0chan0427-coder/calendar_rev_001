/** Room forms keep the same body scale even when weapons enlarge their canvas.
 * Bounded preview/profile slots instead fit the complete form, never crop a weapon. */
export function transformationLayout082(frame:readonly number[],width:number,height:number,bounded:boolean){
 const fw=frame[2],fh=frame[3];
 const scale=bounded?Math.min(Math.max(0,width)/fw,Math.max(0,height)/fh):Math.max(0,height)/1536;
 return {width:fw*scale,height:fh*scale};
}
