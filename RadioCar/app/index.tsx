import {Pressable,Dimensions,View,Text, StyleSheet, ActivityIndicator} from 'react-native';
import { get_store } from '../assets/module_hooks/store'
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';

const scale = Dimensions.get('screen').fontScale**-1;


export default function Load(){
    const router = useRouter()
    let jwt = get_store('jwt')
    let [id, setid] = useState(0);
    

    useEffect(()=>{
        fetch('http://gl.anohin.fvds.ru:3001/user/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwt}`
            }
        })
        .then(response=>{
            if (JSON.stringify(response.status)=='200'){
                clearInterval(func_tim);
                router.push("/(auth)/(main)/all_cars");                
            }else if (JSON.stringify(response.status)=='400'){
                clearInterval(func_tim);
                router.push("/all_before/vhod");
            };
        })
        .catch((error)=>{
            alert(error);
        })
    },[id]);

    const func_tim = setInterval(function(){
        setid(id+=1);
    }, 5000)

    return (
        <View style={styles.all}>
            <Text style={{
                color: '#000000',
                fontSize: 60*scale,
            }}>RadioCar</Text>
            <ActivityIndicator style={{marginTop:'20%'}} size="large" color='#000000' />
        </View>
    );
}

const styles = StyleSheet.create({
    all:{
        backgroundColor: '#fffff',
        width:'100%',
        height:'100%',
        flex:1,
        justifyContent:'center', 
        alignItems:'center'
    },
})