import { save_store,get_store } from "@/assets/module_hooks/store";
import { router } from "expo-router";
import {View, Text, Pressable,StyleSheet,TextInput,
    Dimensions
} from "react-native";
import * as Font from 'expo-font';
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { jwtDecode } from "jwt-decode";
import { useState,useEffect } from "react";
import { SERVER_URL } from "@/assets/module_hooks/names";

type jwt_info = {sub:string,token_type:string,email:string,
    exp:string,is_super:boolean,iat:string,header:{typ:string,alg:string}}

const scale = Dimensions.get('screen').fontScale**-1
const {width,height} = Dimensions.get('screen')

export default function Profile(){
    const [jwt,setjwt] = useState(get_store('jwt'));
    const info_user = jwtDecode<jwt_info>(jwt);
    const [id_del,setid_del] = useState('');
    const [id, setid] = useState(0); 

    useFocusEffect(() => {
        const loadFont = async () => {
        try {
            await Font.loadAsync({
            'roboto': require('@/assets/fonts/Roboto_500Medium.ttf'),
            });
        } catch (error) {
            console.error('Ошибка загрузки шрифта:', error);
        }
        };
    
        loadFont();
        setjwt(get_store('jwt'));
    });
    
    useEffect(()=>{
        if (id_del!=''){
            fetch(`${SERVER_URL}/user/`,{
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwt}`
                },
                body: JSON.stringify({
                    id: id_del
                })
                }).then((response)=>{
                    if (response.status==200){
                        setid_del('');
                        save_store('admin','false');
                        save_store('jwt','')
                        router.push('../../all_before/vhod'); 
                    }
                })
                .catch(error=>{
                    alert(error);
                })
        }
    },[id]);

    return (
        <SafeAreaView style={styles.all_body}
        edges={['top']}>
            <View style={styles.header}/>
            <View style={styles.other_body}>
                <View style={styles.block}>
                    <View style={styles.first_column}>
                        <Text style={styles.text_user}>{info_user.email}</Text>
                        <Text style={[styles.text_root,{marginTop:'3%'}]}>{
                            info_user.is_super==true?'Супер пользователь':
                            'Не супер пользователь'
                        }</Text>
                    </View>
                    <View style={styles.second_column}>
                        <Pressable style={styles.bt}>
                            <Text style={styles.text_bt} onPress={()=>{
                                setid_del(info_user.sub);
                                setid(prev=>(prev+1));
                            }}>
                                Удалить аккаунт
                            </Text>
                        </Pressable>
                        <Pressable style={styles.bt} onPress={()=>{
                            save_store('admin','false');
                            save_store('jwt','');
                            router.push('../../all_before/vhod')
                        }}>
                            <Text style={styles.text_bt}>
                                Выйти
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    all_body: {
        backgroundColor:'#f3edf7',
        width: '100%',
        height: '100%'
    },
    header: {
        width:'100%',
        height:'10%',
        backgroundColor: '#f3edf7'
    },
    other_body:{
        backgroundColor:'#ffffff',
        flex:1,
        justifyContent:'center',
        alignItems:'center',
    },
    block:{
        width:width,
        height:width*0.35,
        flexDirection:'row',
        justifyContent:'space-around'
    },
    text_user:{
        fontFamily:'roboto',
        fontSize:22*scale
    },
    text_root:{
        fontFamily:'Roboto',
        fontSize:16*scale
    },
    bt:{
        width:width*0.45,
        height:width*0.45*0.3,
        borderWidth:2,
        borderColor:'black',
        borderRadius:10,
        justifyContent:'center',
        alignItems:'center'
    },
    text_bt:{
        fontFamily:'roboto',
        fontSize:20*scale,
        color:'#4f378a',
    },
    first_column:{
        flexDirection:'column',
        justifyContent:'center'
    },
    second_column:{
        flexDirection:'column',
        justifyContent:'space-around'
    },
})