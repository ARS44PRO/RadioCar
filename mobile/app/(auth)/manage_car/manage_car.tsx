import {Dimensions, Text} from 'react-native';

const scale = Dimensions.get('screen').fontScale**-1

export default function manage(){
    return (
        <Text style={{fontSize:30*scale, flex:1, justifyContent:'center',
            alignItems:'center'
        }}>Manage!</Text>
    );
}