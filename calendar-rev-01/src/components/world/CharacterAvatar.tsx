import React from 'react';

type Gender = 'male' | 'female';

interface Props {
  gender: Gender;
  className?: string;
  alt?: string;
  blink?: boolean;
}

const src = (gender: Gender) =>
  `/world/characters/base/minime_${gender}_default.png`;

export default function CharacterAvatar({ gender, className = '', alt = '씩씩이 미니미', blink = true }: Props) {
  return (
    <div className={`character-avatar ${gender} ${className}`}>
      <img className="character-avatar-image" src={src(gender)} alt={alt} />
      {blink && (
        <span className="character-blink" aria-hidden="true">
          <i />
          <i />
        </span>
      )}
    </div>
  );
}
