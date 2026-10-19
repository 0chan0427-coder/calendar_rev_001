/** Native source masks: only the free-standing tail moves; paws and body stay anchored. */
export const COMPANION_TAIL_RIGS:Record<string,{path:string;origin:[number,number];duration:number}>={
 'cat-ivory':{path:'M970 645H1312V1199H930V1095Q1010 1020 960 930Q940 840 970 780Z',origin:[965,1090],duration:7.2},
 'cat-ginger':{path:'M970 645H1312V1199H930V1095Q1010 1020 960 930Q940 840 970 780Z',origin:[965,1090],duration:7.2},
 dog:{path:'M985 730H1227V1282H970V1090Q1030 970 985 885Z',origin:[995,1100],duration:5.6},
};
export function companionIdleKind(id:string){return /whale|dragon|eagle|griffin/.test(id)?'float':'breathe';}
