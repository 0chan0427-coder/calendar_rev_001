import type {WorldProfile,WorldSceneType} from '../types/world';
export function homeEntryScene(profile:Pick<WorldProfile,'home_scene'|'scene_type'>):WorldSceneType{return profile.home_scene==='exterior'?'exterior':profile.home_scene==='interior'?'interior':profile.scene_type==='exterior'?'exterior':'interior';}
