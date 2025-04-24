import {View, Text, Pressable,
    StyleSheet, ActivityIndicator,
    Dimensions
} from 'react-native';
import {router} from 'expo-router';
import { get_store } from '@/assets/module_hooks/store';

const scale = Dimensions.get('screen').fontScale**-1


export default function Connect(){
    const name = get_store('name_connect')
    const ip = get_store('ip_connect')

    const connect_ws = (ip:string)=>{
        alert('Connection success!');
        router.push('/manage_car/manage_car')
    }

    const func_tim = setInterval(function(){
        connect_ws(ip);
        clearInterval(func_tim)
    }, 2000)

    return (
        <View style={styles.all}>
            <Text style={{
                color: '#ffffff',
                fontSize: 30*scale,
            }}>Connect to {name}</Text>
            <ActivityIndicator style={{marginTop:'10%'}} size="large" color='#ffffff' />
        </View>
    );
}

const styles = StyleSheet.create({
    all:{
        backgroundColor: '#666565',
        width:'100%',
        height:'100%',
        flex:1,
        justifyContent:'center', 
        alignItems:'center'
    },
})