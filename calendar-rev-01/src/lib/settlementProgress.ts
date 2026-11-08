interface Item{user_id:string;amount:number|string;is_paid:boolean}
export function settlementProgress(ownerId:string,items:Item[]|null|undefined){
 if(!items?.length)return{status:'unregistered',label:'참여자 미등록',paid:0,total:0,percent:0,remaining:0};
 const targets=items.filter(i=>i.user_id!==ownerId&&Number(i.amount)>0);
 const total=targets.length,paid=targets.filter(i=>i.is_paid===true).length;
 return{status:paid===total?'complete':paid===0?'waiting':'progress',label:paid===total?'정산 완료':paid===0?'정산 대기':'정산 중',paid,total,percent:total?Math.round(paid/total*100):100,remaining:targets.filter(i=>!i.is_paid).reduce((n,i)=>n+Number(i.amount),0)};
}
