/** Compress real lengths into a readable display range; no species-specific hard cap. */
export function aquariumLayout(lengthCm:number,crop:number[],tankWidth:number,tankHeight:number,motion='fish'){
 const length=Math.max(0,Number.isFinite(lengthCm)?lengthCm:0);
 const percent=14+74*Math.pow(Math.min(1,length/2000),.48);
 const areaWidth=Math.max(1,tankWidth-16),areaHeight=Math.max(1,tankHeight-48);
 const ratio=Math.max(.15,Number(crop[2])/Number(crop[3])||1.8);
 let width=areaWidth*percent/100,height=width/ratio;
 const maxHeight=Math.max(1,areaHeight-24);
 if(height>maxHeight){height=maxHeight;width=height*ratio;}
 const floor=['crustacean','star','bottom'].includes(motion);
 return {width,height,top:floor?Math.max(12,areaHeight-height-12):Math.max(12,(areaHeight-height)/2),travel:Math.max(0,areaWidth-width),duration:20+percent*.25,percent};
}
