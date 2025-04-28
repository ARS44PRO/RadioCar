import {View, Text, Pressable,
    StyleSheet, ActivityIndicator,
    Dimensions
} from 'react-native';
import {router,useLocalSearchParams} from 'expo-router';
import { get_store } from '@/assets/module_hooks/store';
import { useRef,useEffect } from 'react';

const scale = Dimensions.get('screen').fontScale**-1


export default function Connect() {
    const funcTim = useRef<ReturnType<typeof setInterval> | null>(null);
    const {name,id} = useLocalSearchParams<{name:string,id:string}>();

    const connect_ws = (name:string,id: string) => {
        if (funcTim.current) {
            clearInterval(funcTim.current);
            funcTim.current = null;
        }
        
        router.push({
            pathname:'/manage_car/manage_car',
            params:{name:name,id:id}
        });
    };
    
    useEffect(() => {
        funcTim.current = setInterval(() => {
            connect_ws(name,id);
        }, 2000);

        return () => {
            if (funcTim.current) {
                clearInterval(funcTim.current);
                funcTim.current = null;
            }
        };
    }, []);
    
    return (
        <View style={styles.all}>
            <Text style={{
                color: '#000000',
                fontSize: 25*scale,
            }}>Connect to {name}</Text>
            <ActivityIndicator style={{marginTop:'10%'}} size="large" color='#000000' />
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