import paper from 'paper';
import {offsetStroke} from 'paperjs-offset';

// Compile painted masks into geometry. No brightness or alpha masks remain in the SVG.
const scope=new paper.PaperScope();scope.setup(new scope.Size(1,1));
const cache=new Map<string,string>();
export function avatarClipPaths(markup:string):string{
 const doc=new DOMParser().parseFromString(markup,'image/svg+xml');
 if(doc.querySelector('parsererror'))throw Error('Invalid avatar SVG');
 scope.activate();
 try{
  for(const mask of Array.from(doc.querySelectorAll('mask'))){
   const key=new XMLSerializer().serializeToString(mask);
   let data=cache.get(key);
   if(data===undefined){
    let area:paper.PathItem=new scope.CompoundPath({insert:false});
    const paint=(shape:paper.PathItem,colour:string|null)=>{
     if(colour==='none')return;
     const white=colour==='white'||colour==='#fff'||colour==='#ffffff';
     if(!white&&colour!==null&&!['black','#000','#000000'].includes(colour))throw Error('Unsupported avatar mask colour');
     const next=white?area.unite(shape,{insert:false}):area.subtract(shape,{insert:false});area.remove();area=next;
    };
    const draw=(element:Element,override?:Element)=>{
     const attr=(name:string)=>override?.getAttribute(name)??element.getAttribute(name);
     if(element.localName==='use'){
      const target=doc.getElementById((element.getAttribute('href')||'').slice(1));
      if(!target||target.localName==='use')throw Error('Invalid avatar mask reference');draw(target,element);return;
     }
     if(attr('transform'))throw Error('Unsupported avatar mask transform');
     let shape:paper.PathItem;
     if(element.localName==='path')shape=new scope.CompoundPath({pathData:attr('d')||'',insert:false});
     else if(element.localName==='rect')shape=new scope.Path.Rectangle({point:[Number(attr('x')||0),Number(attr('y')||0)],size:[Number(attr('width')),Number(attr('height'))],insert:false});
     else throw Error('Unsupported avatar mask shape');
     try{
      paint(shape,attr('fill'));
      const stroke=attr('stroke');
      if(stroke&&stroke!=='none'){
       const outline=offsetStroke(shape as paper.Path|paper.CompoundPath,Number(attr('stroke-width')||1)/2,{join:(attr('stroke-linejoin')||'miter') as 'miter'|'round'|'bevel',insert:false});
       try{paint(outline,stroke);}finally{outline.remove();}
      }
     }finally{shape.remove();}
    };
    for(const element of Array.from(mask.children))draw(element);
    data=area.pathData;area.remove();cache.set(key,data);while(cache.size>64)cache.delete(cache.keys().next().value!);
   }
   const clip=doc.createElementNS('http://www.w3.org/2000/svg','clipPath');clip.setAttribute('id',mask.id);clip.setAttribute('clipPathUnits','userSpaceOnUse');
   const path=doc.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',data);path.setAttribute('clip-rule','nonzero');clip.append(path);mask.replaceWith(clip);
  }
  for(const element of Array.from(doc.querySelectorAll('[mask]'))){
   const value=element.getAttribute('mask')!;element.removeAttribute('mask');
   if(element.hasAttribute('clip-path')){const group=doc.createElementNS('http://www.w3.org/2000/svg','g');group.setAttribute('clip-path',value);element.replaceWith(group);group.append(element);}
   else element.setAttribute('clip-path',value);
  }
  return new XMLSerializer().serializeToString(doc.documentElement);
 }finally{scope.project.clear();}
}
