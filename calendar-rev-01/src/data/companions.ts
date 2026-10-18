// Add one entry per body/breed. Different bodies can share compatible accessories.
// Match real catalog IDs; never derive filenames from the animal display name.
export interface CompanionAppearance { family:'cat'|'other'; body:string; artboard:[number,number]; }
export const COMPANION_APPEARANCES:Record<string,CompanionAppearance> = {
 'cat-white':{family:'cat',body:'/world/companions-v2/cat-ivory.svg',artboard:[256,256]},
 'cat-ribbon':{family:'cat',body:'/world/companions-v2/cat-ivory.svg',artboard:[256,256]},
};
