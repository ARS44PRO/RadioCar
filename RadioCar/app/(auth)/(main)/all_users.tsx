import {Text, FlatList, StyleSheet, View, Dimensions,
    Pressable,Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, {useEffect, useState} from 'react';
import * as Font from 'expo-font';
import { useFocusEffect } from 'expo-router';
import { get_store } from '@/assets/module_hooks/store';
import { SERVER_URL } from '@/assets/module_hooks/names';
import {Image} from 'expo-image';
import { jwtDecode } from 'jwt-decode';

type poper = {id:string,email:string,is_super:boolean,is_verified:boolean
}

type props_fetch={
    id_get:number, id_put:number,id_delete:number
}

const {width,height} = Dimensions.get('screen')
const scale = Dimensions.get('screen').fontScale**-1

export default function MainSelect(){
    const [id, setid] = useState<props_fetch>({id_get:0,id_put:0,id_delete:0});
    const [refreshing, setrefresh] = useState(false)
    const [Data, setdata] = useState<poper[]>([])
    const [jwt,setjwt] = useState(get_store('jwt'));
    const [id_del, setid_del] = useState('');
    const [edited, setedit] = useState<Partial<poper>>({id:'',email:'',is_super:false,is_verified:false});

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
        fetch(`${SERVER_URL}/user`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwt}`
            }
        })
        .then(response=>{
            if (JSON.stringify(response.status)=='200'){
                return response.json();
            }
        }).then(body=>{setdata(body);})
        .catch((error)=>{
            alert(error);
        })
    },[id.id_get]);
    
    useEffect(()=>{
        if (edited.email!=''&&edited.id!=''
        ){
            fetch(`${SERVER_URL}/user`,{
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwt}`
                },
                body: JSON.stringify({
                    id: edited.id,
                    email: edited.email,
                    is_super: edited.is_super,
                    is_verified: edited.is_verified
                })
                }).then((response)=>{
                    if (response.status==200){
                        handle();
                        setedit({id:'',email:'',is_super:false,is_verified:false});
                    }
                })
                .catch(error=>{
                    alert(error);
                })
        }
    },[id.id_put]);
    
    useEffect(()=>{
        if (id_del!=''){
            fetch(`${SERVER_URL}/user`,{
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
                        handle();
                        setid_del('');
                    }
                })
                .catch(error=>{
                    alert(error);
                })
        }
    },[id.id_delete]);

    const handle = ()=>{
        setrefresh(true);
        try{
            setid(prev=>({...prev,id_get:prev.id_get+1}));
        } finally{
            setrefresh(false)
        }
    };

    const Cars = ({id, email, is_super, is_verified}: poper)=>{
        const [modalVis, setvis] = useState(false);
        const name = jwtDecode<poper>(jwt).email.toString()
        const edit = (key:keyof poper,value:string|boolean) =>{
            setedit(prev=>({...prev,[key]:value}));
        };
        return(
            <View style={styles.whole_box}>
                <View style={styles.first_column}>
                    <View>
                        <Text style={styles.text_user}>{email}</Text>
                    </View>
                    <View style={
                        {
                            marginTop:'1%'
                        }
                    }>
                        {is_verified==true?
                        <Text style={styles.text_other}>{is_super==true?'Супер пользователь':
                            'Не супер пользователь'}</Text>:null}
                    </View>
                    <View style={{
                        marginTop:'1%'
                    }}>
                        <Text style={[styles.text_other,{
                            color:is_verified==false?'#4f378a':'rgb(30,216,98)',
                            fontFamily:'roboto'
                        }]}>{is_verified==false?'На рассмотрении':'Подтвержден'}</Text>
                    </View>
                </View>
                {name!=email?
                <View style={styles.second_column}>
                    <Pressable onPress={()=>{setvis(true)}} style={styles.second_column_2}>
                        <View>
                            <Image
                                style={styles.img_size} 
                                source={require('@/assets/images/bt_user/Icon.png')}
                            />
                        </View>
                        <View style={styles.view_line}/>
                        <View>
                            <Image
                                style={styles.img_size} 
                                source={require('@/assets/images/bt_user/Icon-1.png')}
                            />
                        </View>
                    </Pressable>
                </View>:null}
                <Modal
                    animationType="fade" 
                    transparent={true}
                    visible={modalVis}
                    onRequestClose={() => setvis(false)}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                {is_verified==false?
                                <View style={styles.root_choose}>
                                    <Pressable style={styles.button} onPress={()=>{
                                        setedit({id,email,is_super,is_verified});
                                        edit("is_super",true);
                                        edit("is_verified",true);
                                        setid(prev=>({...prev,["id_put"]:prev.id_put+1}));
                                        setvis(false);
                                    }}>
                                        <Text style={styles.text_bt}>Админ</Text>
                                    </Pressable>
                                    <Pressable style={styles.button} onPress={()=>{
                                        setedit({id,email,is_super,is_verified});
                                        edit("is_super",false);
                                        edit("is_verified",true);                                        
                                        setid(prev=>({...prev,["id_put"]:prev.id_put+1}));
                                        setvis(false);
                                    }}>
                                        <Text style={styles.text_bt}>Пользователь</Text>
                                    </Pressable>
                                </View>:null}
                                <View style={styles.exit_del}>
                                    <Pressable style={styles.button} onPress={()=>{setvis(false)}}>
                                        <Text style={styles.text_bt}>Закрыть</Text>
                                    </Pressable>
                                    <Pressable style={styles.button} onPress={()=>{
                                        setid_del(id);
                                        setid(prev=>({...prev,["id_delete"]:prev.id_delete+1}))
                                        setvis(false);
                                    }}>
                                        <Text style={styles.text_bt}>Удалить</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                </Modal>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.all_body} edges={['top']}>
            <View style={styles.header}/>
            <View style={{paddingTop:'5%',backgroundColor:'#ffffff',flex:1}}>
                <FlatList
                    data={Data}
                    renderItem={({item}) => <Cars email={item.email} id={item.id}  
                    is_super={item.is_super} is_verified={item.is_verified} />}
                    keyExtractor={item=>item.id}
                    onRefresh={handle}
                    refreshing={refreshing}
                />
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
    whole_box:{
        width:'100%',
        height:height*0.08,
        flexDirection: 'row',
        justifyContent:'space-between',
        alignItems:'center',
        marginLeft:width*0.05,
        marginBottom:height*0.03,
    },

    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '85%',
        height:'19%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding:width*0.03,
        flexDirection:'column',
        alignItems: 'center',
        justifyContent:'space-around'
    },
    text_user:{
        fontFamily:'Roboto',
        fontSize:22*scale
    },
    text_other:{
        fontFamily:'Roboto',
        color:'rgb(72,69,78)',
        fontSize:16*scale
    },
    first_column:{
    },
    second_column:{
        right:'8%',
    },
    img_size:{
        width:width*0.06*scale,
        aspectRatio:1
    },
    view_line:{
        width:1,
        height: '100%',
        backgroundColor: '#ccc',
    },
    second_column_2:{
        width:width*0.11,
        flexDirection:'row',
        justifyContent:'space-around',
    },
    exit_del:{
        width:'100%',
        flexDirection:'row',
        justifyContent:'space-around',
    },
    root_choose:{
        width:'100%',
        flexDirection:'row',
        justifyContent:'space-around'
    },
    button:{
        width:'49%',
        height:width*0.8*0.2,
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
    }
})