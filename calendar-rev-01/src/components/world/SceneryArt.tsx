import {gardenTheme} from '../../data/gardens';
import {sceneryImage} from '../../data/windows';
import WorldImageCanvas from './WorldImageCanvas';
export default function SceneryArt({id,gardenId,className=''}:{id?:string;gardenId?:string;className?:string}){
 const garden=(!id||id==='view-garden')?gardenTheme(gardenId):undefined;
 return <WorldImageCanvas src={garden?.image||sceneryImage(id)} crop={garden?.windowCrop} sourceSize={garden?[garden.width,garden.height]:undefined} className={className} label={garden?`${garden.name}의 창밖 풍경`:'창밖 풍경'}/>;
}
