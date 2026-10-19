/** Room display dimensions, independent of source canvas/crop. Add new species explicitly. */
export const COMPANION_SCENE_SIZES:Record<string,[number,number]>={
 cat:[72,72],dog:[72,72],rabbit:[72,78],
 tiger:[110,110],elephant:[120,120],horse:[125,140],unicorn:[125,140],
 griffin:[150,155],whale:[210,140],dragon:[210,155],
};
export function companionSceneSize(itemId:string):[number,number]{
 const key=Object.keys(COMPANION_SCENE_SIZES).find(k=>itemId===k||itemId.startsWith(k+'-'));
 return COMPANION_SCENE_SIZES[key||'cat'];
}
