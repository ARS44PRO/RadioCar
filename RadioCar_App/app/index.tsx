import {Pressable,Dimensions,View,Text, StyleSheet, ActivityIndicator} from 'react-native';
import { get_store } from '../assets/module_hooks/store'
import { useState } from 'react';
import { useRouter } from 'expo-router';

const scale = Dimensions.get('screen').fontScale;


export default function Load(){
    const router = useRouter()
    let jwt = get_store('jwt')

    
    const check_in_server = (jwt:string)=>{
        if (jwt!='NaN' && (jwt=='55' || jwt=='44')){
            router.push("/(auth)/all_cars"); {/*change here*/}
        }else{
            router.push("/all_before/vhod");
        }
    }

    const func_tim = setInterval(function(){
        check_in_server(jwt);
        clearInterval(func_tim)
    }, 5000)

    return (
        <View style={styles.all}>
            <Text style={{
                color: '#ffffff',
                fontSize: 40*scale,
            }}>RadioCar</Text>
            <ActivityIndicator style={{marginTop:'20%'}} size="large" color='#ffffff' />
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