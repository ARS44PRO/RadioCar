import {Pressable,Dimensions,View,Text, StyleSheet, ActivityIndicator} from 'react-native';
import { get_store } from '../assets/module_hooks/store'
import { useState, useEffect,useRef } from 'react';
import { useRouter } from 'expo-router';
import { SERVER_URL } from '@/assets/module_hooks/names';

const scale = Dimensions.get('screen').fontScale**-1;


export default function Load(){
    const router = useRouter()
    const jwt = get_store('jwt')
    const [id, setid] = useState(0);
    const funcTim = useRef<ReturnType<typeof setInterval> | null>(null)

    useEffect(() => {
        funcTim.current = setInterval(() => {
          setid(prev => prev + 1);
        }, 5000);
    
        return () => {
          if (funcTim.current) clearInterval(funcTim.current);
        };
      }, []);

    useEffect(()=>{
        fetch(`${SERVER_URL}/user`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwt}`
            }
        })
        .then(response=>{
            if (response.status==200){
                if (funcTim.current) clearInterval(funcTim.current);
                router.push("/(auth)/(main)/all_cars");                
            }else {
                if (funcTim.current) clearInterval(funcTim.current);
                router.push("/all_before/vhod");
            };
        })
        .catch((error)=>{
            alert(error);
        })
    },[id]);

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
        backgroundColor: '#ffffff',
        width:'100%',
        height:'100%',
        flex:1,
        justifyContent:'center', 
        alignItems:'center'
    },
})