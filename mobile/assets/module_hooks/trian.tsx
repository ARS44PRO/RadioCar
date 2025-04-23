import { Svg, Polygon } from 'react-native-svg';
import { Dimensions } from 'react-native';

const {width,height} = Dimensions.get('screen')

export const TriangleIcon = () => (
  <Svg width={width*0.05} height={width*0.05} viewBox="0 0 24 24">
    <Polygon
      points="12,2 22,22 2,22"
      fill="black"
      transform="rotate(90 12 12)"
    />
  </Svg>
);
