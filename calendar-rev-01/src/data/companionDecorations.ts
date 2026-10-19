/** Fitting belongs to each body, never reuse a baby animal's face coordinates on an adult. */
export const COMPANION_DECORATIONS:Record<string,{ribbon?:[number,number,number,number];glasses?:string}>={
 'cat-ivory':{ribbon:[490,690,250,170]},'cat-ginger':{ribbon:[490,690,250,170]},
 dog:{glasses:'rotate(13 540 420)'},
 'adult-cat-ivory':{ribbon:[310,315,200,135]},
 'adult-cat-ginger':{ribbon:[310,315,200,135]},
 'adult-dog':{glasses:'rotate(-6 420 130) translate(174 -49) scale(.44)'},
};
