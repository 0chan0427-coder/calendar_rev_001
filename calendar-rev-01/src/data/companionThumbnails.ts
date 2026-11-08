import manifest from './companion-thumbnails.json';
export const THUMBNAIL_SOURCES=manifest.images as Record<string,{image:string;width:number;height:number;bytes:number}>;
export const companionImageSource=(image:string,thumbnail=false)=>thumbnail?(THUMBNAIL_SOURCES[image]?.image||image):image;
