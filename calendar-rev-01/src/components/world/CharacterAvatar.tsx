import React from 'react';
import AppearanceArt from './AppearanceArt';
import type { Equipment } from '../../data/wardrobe';

type Gender = 'male' | 'female';

export interface CharacterLayer {
  /** Asset is positioned in the same coordinate system as the base mini-me. */
  src: string;
  alt?: string;
  zIndex?: number;
  className?: string;
}

interface Props {
  gender: Gender;
  equipment?: Equipment;
  className?: string;
  alt?: string;
  blink?: boolean;
  /** Optional future clothing/hair/accessory layers. Existing callers do not need this. */
  layers?: CharacterLayer[];
  /** Allows multiple avatars on one screen to blink at slightly different times. */
  blinkDelay?: string;
}

interface AvatarSpec {
  width: number;
  height: number;
  base: string;
  blink: string;
}

const AVATAR_SPEC: Record<Gender, AvatarSpec> = {
  male: {
    width: 128,
    height: 273,
    base: '/world/characters/base/minime_male_default.png',
    blink: '/world/characters/overlays/minime_male_blink.png',
  },
  female: {
    width: 157,
    height: 276,
    base: '/world/characters/base/minime_female_default.png',
    blink: '/world/characters/overlays/minime_female_blink.png',
  },
};

export default function CharacterAvatar({
  gender,
  equipment = {},
  className = '',
  alt = '씩씩이 미니미',
  blink = true,
  layers = [],
  blinkDelay = '0s',
}: Props) {
  const spec = AVATAR_SPEC[gender];
  const style = {
    '--avatar-ratio': `${spec.width} / ${spec.height}`,
    '--blink-delay': blinkDelay,
  } as React.CSSProperties;

  return (
    <div className={`character-avatar ${gender} ${className}`} style={style}>
      <div className="character-artboard">
        <AppearanceArt src={spec.base} gender={gender} equipment={equipment} alt={alt}/>

        {layers.map((layer, index) => (
          <img
            key={`${layer.src}-${index}`}
            className={`character-layer-image ${layer.className ?? ''}`}
            src={layer.src}
            alt={layer.alt ?? ''}
            draggable={false}
            style={{ zIndex: layer.zIndex ?? 20 + index }}
            aria-hidden={layer.alt ? undefined : true}
          />
        ))}

        {blink && (
          <img
            className="character-blink"
            src={spec.blink}
            alt=""
            draggable={false}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}
