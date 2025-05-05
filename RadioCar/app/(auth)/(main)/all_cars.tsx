import {Text, FlatList, StyleSheet, View, TextInput, Dimensions,
    Pressable,Modal,
    TouchableOpacity,Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, {useEffect, useState} from 'react';
import * as Font from 'expo-font';
import { useFocusEffect,router } from 'expo-router';
import { get_store, save_store } from '@/assets/module_hooks/store';
import { TriangleIcon } from '@/assets/module_hooks/trian';
import { SERVER_URL } from '@/assets/module_hooks/names';
import {Image} from 'expo-image';
import * as FileSystem from 'expo-file-system';

type poper = {id:string,last_seen:string,name:string,
    description:string,image_url:string
}
type props={name:string, id:string, last:string, image_url:string, 
    description:string, on:string
}
type props_post = {name:string,description:string,image_url:string,key:string}
type props_fetch={
    id_get:number, id_post:number, id_put:number,id_delete:number
}

const {width,height} = Dimensions.get('screen')
const scale = Dimensions.get('screen').fontScale**-1

export default function MainSelect(){
    const [id, setid] = useState<props_fetch>({id_get:0,id_post:0,id_put:0,id_delete:0});
    const [refreshing, setrefresh] = useState(false)
    const [Data, setdata] = useState<poper[]>([])
    const [admin_know,setadmin] = useState(get_store('admin'));
    const [jwt,setjwt] = useState(get_store('jwt'));
    const [vis2, setvis2] = useState(false);
    const [poster, setposter] = useState<Partial<props_post>>({name:'',description:'',image_url:'',key:''})
    const [modal_add_img,setmodal_add_img] = useState(false);
    const default_img = require('@/assets/images/Image.jpg');
    const [id_del, setid_del] = useState('');
    const [edit_put,setedit_put] = useState<Partial<props>>({id:'',name:'',description:'',image_url:''});

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
      setadmin(get_store('admin'));
      setjwt(get_store('jwt'));
    });

    useEffect(()=>{
        fetch(`${SERVER_URL}/car`, {
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
        if (poster.name!=''&&poster.key!=''){
            fetch(`${SERVER_URL}/car`,{
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify({
                name: poster.name,
                description: poster.description,
                image_url: poster.image_url,
                key: poster.key
            })
            }).then((response)=>{
                if (response.status==200){
                    setposter({name:'',description:'',image_url:'',key:''});
                    handle();
                }
            })
            .catch(error=>{
                alert(error);
            })
        }
    },[id.id_post]);
    
    useEffect(()=>{
        if (edit_put.id!=''
            &&edit_put.name!=''
        ){
            fetch(`${SERVER_URL}/car`,{
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwt}`
                },
                body: JSON.stringify({
                    id: edit_put.id,
                    name: edit_put.name,
                    description: edit_put.description,
                    image_url: edit_put.image_url
                })
                }).then((response)=>{
                    if (response.status==200){
                        handle();
                        setedit_put({id:'',name:'',description:'',image_url:''});
                    }
                })
                .catch(error=>{
                    alert(error);
                })
        }
    },[id.id_put]);
    
    useEffect(()=>{
        if (id_del!=''){
            fetch(`${SERVER_URL}/car`,{
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
    
    const change_post_information = (key:keyof props_post,value:string)=>{
        setposter(prev=>({...prev,[key]:value}));
    };

    const Cars = ({name, id, last, image_url, description, on}: props)=>{
        const [modalVis, setvis] = useState(false);
        const [edited, setedit] = useState<Partial<props>>({id,name,image_url,description});
        const nach = {name,last,image_url,description}
        const [modal_img, setmodal_img] = useState(false);
        const last_up = new Date(last)
        const edit = (key:keyof poper,value:string) =>{
            setedit(prev=>({...prev,[key]:value}));
        };
        const [localImageUri, setLocalImageUri] = useState<string | null>(null);
        const [isImageLoading, setIsImageLoading] = useState(true);

        useEffect(() => {
          setIsImageLoading(true);
          
          if (!edited.image_url) {
            setLocalImageUri(null);
            setIsImageLoading(false);
            return;
          }
        
          const imageName = edited.image_url.split('/').pop() || Date.now().toString();
          const safeImageName = imageName.replace(/[^a-zA-Z0-9]/g, '_');
          const cachedImagePath = `${FileSystem.cacheDirectory}${safeImageName}`;
        
          FileSystem.getInfoAsync(cachedImagePath)
            .then(info => {
              if (info.exists) {
                setLocalImageUri(cachedImagePath);
                setIsImageLoading(false);
              } else {
                if (edited.image_url && edited.image_url.startsWith('http')) {
                  FileSystem.downloadAsync(edited.image_url, cachedImagePath)
                    .then(({ uri }) => {
                      setLocalImageUri(uri);
                      setIsImageLoading(false);
                    })
                    .catch(error => {
                      setLocalImageUri(null);
                      setIsImageLoading(false);
                    });
                } else {
                  setLocalImageUri(null);
                  setIsImageLoading(false);
                }
              }
            })
            .catch(error => {
              setLocalImageUri(null);
              setIsImageLoading(false);
            });
          
        }, [edited.image_url]);
        
        return(
            <View style={styles.whole_box}>
                <Pressable onPress={()=>setvis(true)} style={{
                    width:'70%',
                    flexDirection:'row',
                    justifyContent:'flex-start'
                }}>
                    <View style={styles.img_position}>
                        {admin_know=='true' ? (
                          <TouchableOpacity 
                            onPress={()=>setvis(true)}
                            onLongPress={()=>setmodal_img(true)}
                          >
                            {isImageLoading ? (
                              <View style={[styles.img_size, {backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center'}]}>
                                <Text style={{color: '#666'}}>Загрузка...</Text>
                              </View>
                            ) : (
                              <Image
                                style={styles.img_size} 
                                source={localImageUri!=null ? { uri: localImageUri } : default_img}
                                contentFit="cover"
                                cachePolicy="memory-disk"
                              />
                            )}
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity onPress={()=>setvis(true)}>
                            {isImageLoading ? (
                              <View style={[styles.img_size, {backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center'}]}>
                                <Text style={{color: '#666'}}>Загрузка...</Text>
                              </View>
                            ) : (
                              <Image
                                style={styles.img_size} 
                                source={localImageUri!=null ? { uri: localImageUri } : default_img}
                                contentFit="cover"
                                cachePolicy="memory-disk"
                              />
                            )}
                          </TouchableOpacity>
                        )}
                    </View>
                    <View style={styles.text_position}>
                        <Text style={styles.text_name}>{name}</Text>
                        <Text numberOfLines={3} style={styles.text_descr}>{description}</Text>
                        {on=='true'||name=='Pavel'||'benz'?<Text style={[styles.text_on,{color:'#4f378a'}]}>Включена</Text>:<Text style={[styles.text_on,{color:'#b3261e'}]}>Выключена</Text>}
                    </View>
                </Pressable>
                {on=='true'||name=='Pavel'||'benz'?
                <Pressable onPress={()=>choose_car(name,id)}> 
                    <View style={styles.bt_choose}>
                        <TriangleIcon/>
                    </View>
                </Pressable>
                :null}
    
                <Modal
                    animationType="fade" 
                    transparent={true}
                    visible={modalVis}
                    onRequestClose={() => setvis(false)}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <View style={styles.first_row}>
                                <View style={styles.first_column}>
                                    {admin_know=='true' ? (
                                      <TouchableOpacity onPress={()=>setmodal_img(true)}>
                                        <Image
                                          style={styles.img_size} 
                                          source={localImageUri!=null ? { uri: localImageUri } : default_img}
                                          contentFit="cover"
                                          cachePolicy="memory-disk"
                                        />
                                      </TouchableOpacity>
                                    ) : (
                                      <Image
                                        style={styles.img_size} 
                                        source={localImageUri!=null ? { uri: localImageUri } : default_img}
                                        contentFit="cover"
                                        cachePolicy="memory-disk"
                                      />
                                    )}
                                    <View style={styles.view_name}>
                                        {admin_know=='true'?<TextInput
                                            style={[styles.input,{
                                                fontFamily:'roboto',
                                                fontSize:20*scale,
                                            }]}
                                            value={edited.name}
                                            onChangeText={v=>edit('name',v)}
                                        />:<Text style={{fontFamily:'roboto',fontSize:20*scale}}>{name}</Text>
                                        }
                                    </View>
                                </View>
                                <View style={styles.second_column}>
                                    <Text style={styles.text_for_module}>Дата последнего использования: {`${last_up.getDate()}.${last_up.getMonth()}.${last_up.getFullYear()}`}</Text>
                                    <View style={styles.view_descr}>
                                        {admin_know=='true'?
                                        <View>
                                        <TextInput
                                            style={[styles.input,styles.text_for_module]}
                                            multiline
                                            onKeyPress={({ nativeEvent }) => {
                                                if (nativeEvent.key === 'Enter') {
                                                  Keyboard.dismiss();
                                                  return false;
                                                }
                                            }}
                                            value={edited.description}
                                            onChangeText={v=>edit('description',v.replace(/\n+$/, ''))}
                                        />
                                        </View>:
                                        <Text style={styles.text_for_module}>{description}</Text>}
                                    </View>
                                </View>
                                </View>
                                    <View style={styles.view_bt}>
                                        <Pressable
                                            style={styles.closeButton}
                                            onPress={() => {
                                                setvis(false);
                                                setedit(nach);
                                            }
                                            }>
                                            <Text style={{
                                                color:'#ffffff',
                                                fontFamily:'roboto',
                                                fontSize:17*scale,
                                                textAlign:'center',
                                                justifyContent:'center'
                                            }}>Закрыть</Text>
                                        </Pressable>
                                        {admin_know=='true'?
                                        <Pressable
                                            style={styles.closeButton}
                                            onPress={() => {
                                                setvis(false);
                                                setid_del(id);
                                                setid(prev=>({...prev,id_delete:prev.id_delete+1}));
                                            }}>
                                            <Text style={{
                                                color:'#ffffff',
                                                fontFamily:'roboto',
                                                fontSize:17*scale,
                                                textAlign:'center',
                                                justifyContent:'center'
                                            }}>Удалить</Text>
                                        </Pressable>:null}
                                        {admin_know=='true'?
                                        <Pressable
                                            style={styles.closeButton}
                                            onPress={() => {
                                                setedit_put(edited);
                                                setid(prev=>({...prev,id_put:prev.id_put+1}));
                                                setvis(false);
                                            }}>
                                            <Text style={{
                                                color:'#ffffff',
                                                fontFamily:'roboto',
                                                fontSize:17*scale,
                                                textAlign:'center',
                                                justifyContent:'center'
                                            }}>Обновить</Text>
                                        </Pressable>:null}
                                    </View>
                            </View>
                        </View>
                </Modal>
                <Modal
                    animationType="fade" 
                    transparent={true}
                    visible={modal_img}
                    onRequestClose={() => setmodal_img(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.imageUrlModalContent}>
                            <Text style={styles.modalTitle}>Изменить URL изображения</Text>
                            <TextInput
                                style={styles.imageUrlInput}
                                multiline
                                onKeyPress={({ nativeEvent }) => {
                                    if (nativeEvent.key === 'Enter') {
                                      Keyboard.dismiss();
                                      return false;
                                    }
                                }}
                                value={edited.image_url}
                                onChangeText={v=>edit('image_url',v.replace(/\n+$/, ''))}
                            />
                            <Pressable
                                style={styles.modalButton}
                                onPress={() => {
                                    setmodal_img(false);
                                }}>
                                <Text style={styles.buttonText}>Готово</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.all_body} edges={['top']}>
            <View style={styles.header}>
                {admin_know=='true'?
                <Pressable style={styles.bt_admin} onPress={()=>{setvis2(true)}}>
                    <Text style={styles.header_named}>+</Text>
                </Pressable>:null
                }
            </View>
            <View style={{paddingTop:'5%',backgroundColor:'#ffffff',flex:1}}>
                <FlatList
                    data={Data}
                    renderItem={({item}) => <Cars name={item.name} id={item.id} last={item.last_seen} 
                    image_url={item.image_url} description={item.description} on={item.name} />}
                    keyExtractor={item=>item.id}
                    onRefresh={handle}
                    refreshing={refreshing}
                />
            </View>
            <Modal
                animationType="fade" 
                transparent={true}
                visible={vis2}
                onRequestClose={() => setvis2(true)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={{
                                width:'100%',
                                flexDirection:'row',
                                justifyContent:'space-between',
                                alignItems:'center',
                                marginTop:'10%'
                            }}>
                                <View>
                                    <TouchableOpacity onPress={()=>setmodal_add_img(true)}>
                                        <Image 
                                            style={[styles.img_size,{marginBottom:'5%'}]}
                                            source={poster.image_url==''?default_img:{uri:poster.image_url}}
                                            placeholder={default_img}
                                            contentFit='cover'
                                            />
                                    </TouchableOpacity>
                                </View>
                                <View>
                                    <TextInput
                                        style={{
                                            borderRadius:10,
                                            backgroundColor:'#e8def8',
                                            paddingLeft:'5%',
                                            paddingVertical:'5%',
                                            width:width*0.3
                                        }} 
                                        onKeyPress={({ nativeEvent }) => {
                                            if (nativeEvent.key === 'Enter') {
                                              Keyboard.dismiss();
                                              return false;
                                            }
                                        }}
                                        placeholder="Имя"
                                        multiline
                                        placeholderTextColor='#000000'
                                        onChangeText={v=>change_post_information('name',v.replace(/\n+$/, ''))}
                                        value={poster.name}
                                    />
                                </View>
                            </View>
                            <View style={{
                                flexDirection:'column',
                                height:height*0.15,
                                alignItems:'center',
                                justifyContent:'space-around'
                            }}>
                                <TextInput
                                    style={{
                                        borderRadius:10,
                                        backgroundColor:'#e8def8',
                                        paddingLeft:'5%',
                                        paddingVertical:'5%',
                                        width:width*0.7
                                    }} 
                                    placeholder="Описание"
                                    multiline
                                    onKeyPress={({ nativeEvent }) => {
                                        if (nativeEvent.key === 'Enter') {
                                          Keyboard.dismiss();
                                          return false;
                                        }
                                    }}
                                    placeholderTextColor='#000000'
                                    onChangeText={v=>change_post_information('description',v.replace(/\n+$/, ''))}
                                    value={poster.description}
                                />
                                <TextInput
                                    style={{
                                        borderRadius:10,
                                        backgroundColor:'#e8def8',
                                        paddingLeft:'5%',
                                        paddingVertical:'5%',
                                        width:width*0.7
                                    }}
                                    onKeyPress={({ nativeEvent }) => {
                                        if (nativeEvent.key === 'Enter') {
                                          Keyboard.dismiss();
                                          return false;
                                        }
                                    }}
                                    placeholder="Пароль"
                                    multiline
                                    placeholderTextColor='#000000'
                                    onChangeText={v=>change_post_information('key',v.replace(/\n+$/, ''))}
                                    value={poster.key}
                                />
                            </View>
                            <View style={styles.view_bt}>
                                <Pressable
                                    style={styles.closeButton}
                                    onPress={() => {
                                        setvis2(false);
                                        setposter({name:'',description:'',image_url:'',key:''});
                                        }}>
                                    <Text style={{
                                        color:'#ffffff',
                                        fontFamily:'roboto',
                                        fontSize:17*scale,
                                        textAlign:'center',
                                        justifyContent:'center'
                                    }}>Закрыть</Text>
                                </Pressable>
                                <Pressable
                                    style={styles.closeButton}
                                    onPress={() => {
                                        setid(prev=>({...prev,id_post:prev.id_post+1}));
                                        setvis2(false);
                                    }}>
                                    <Text style={{
                                        color:'#ffffff',
                                        fontFamily:'roboto',
                                        fontSize:17*scale,
                                        textAlign:'center',
                                        justifyContent:'center'
                                    }}>Отправить</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                <Modal
                animationType="fade" 
                transparent={true}
                visible={modal_add_img}
                onRequestClose={() => setmodal_add_img(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.imageUrlModalContent}>
                            <Text style={styles.modalTitle}>Введите URL изображения</Text>
                            <TextInput
                                style={styles.imageUrlInput}
                                multiline
                                onKeyPress={({ nativeEvent }) => {
                                    if (nativeEvent.key === 'Enter') {
                                      Keyboard.dismiss();
                                      return false;
                                    }
                                }}
                                onChangeText={v=>change_post_information('image_url',v.replace(/\n+$/, ''))}
                                value={poster.image_url}
                            />
                            <Pressable
                                style={styles.modalButton}
                                onPress={() => {
                                    setmodal_add_img(false);
                                }}>
                                <Text style={styles.buttonText}>Готово</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>
            </Modal>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    all_body: {
        backgroundColor:'#f3edf7',
        width: '100%',
        height: '100%'
    },
    bt_admin:{
        width:'14%',
        aspectRatio:1,
        backgroundColor:'#e8def8',
        borderRadius:15,
        marginVertical:'auto',
        marginRight:'5%',
        marginLeft:'auto'
    },
    header: {
        width:'100%',
        height:'10%',
        backgroundColor: '#f3edf7'
    },
    header_named:{
        color: '#4a4459',
        fontFamily: 'roboto',
        fontSize: 22*scale,
        textAlign:'center',
        marginVertical:'auto'      
    },
    whole_box:{
        width:'100%',
        height:height*0.13,
        flexDirection: 'row',
        justifyContent:'space-between',
        alignItems:'center',
        marginLeft:width*0.05,
        marginBottom:height*0.02,
    },
    img_size:{
        width:width*0.27,
        aspectRatio:1,
        borderRadius:10,
    },
    img_position:{},
    text_position:{
        flexDirection:'column',
        marginLeft:width*0.05,
        justifyContent:'space-around',
    },
    text_name:{
        fontFamily:'Roboto',
        color:'#1d1b20',
        fontSize:22*scale
    },
    text_descr:{
        width:'95%',
        fontFamily:'Roboto',
        color:'#49454f',
        fontSize:14*scale,
        lineHeight:20,        
    },
    text_on:{},
    bt_choose:{
        marginRight:width*0.09*scale,
        flexGrow:1,
        justifyContent:'flex-end',
        marginBottom:'10%',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '90%',
        paddingHorizontal:'10%',
        backgroundColor: 'white',
        borderRadius: 10,
        flexDirection:'column',
        alignItems: 'center',
    },
    closeButton: {
        marginTop: '2%',
        backgroundColor: 'rgba(115, 85, 143, 0.82)',
        borderRadius: 20,
        padding:'5%'
    },
    text_for_module:{
        fontFamily:'Roboto',
        fontSize:15*scale
    },
    input:{
        borderRadius:10,
        backgroundColor:'#e8def8',
        padding:'10%'
    },
    first_column:{
        width:'50%',
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'flex-start'
    },
    second_column:{
        width:'70%',
        flexDirection:'column',
        alignItems:'flex-start',
        justifyContent:'flex-start'
    },
    view_name:{
        marginTop:'5%'
    },
    view_descr:{
        marginTop:'5%',
        width:'100%'
    },
    view_bt:{
        width:width*0.9,
        flexDirection:'row',
        justifyContent:'space-around',
        marginVertical:'5%',
    },
    first_row:{
        marginTop:'5%',
        flexDirection: 'row',
        justifyContent:'space-around',
    },
    imageUrlModalContent: {
        width: '90%',
        padding: '5%',
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontFamily: 'Roboto',
        fontSize: 15 * scale,
        marginBottom: '5%',
    },
    imageUrlInput: {
        fontFamily: 'Roboto',
        fontSize: 15 * scale,
        borderRadius: 10,
        backgroundColor: '#e8def8',
        padding: '3%',
        width: '100%',
    },
    modalButton: {
        width: width * 0.4,
        marginTop: '5%',
        backgroundColor: 'rgba(115, 85, 143, 0.82)',
        borderRadius: 20,
        padding: '3%',
    },
    buttonText: {
        color: '#ffffff',
        fontFamily: 'roboto',
        fontSize: 17 * scale,
        textAlign: 'center',
        justifyContent: 'center',
    },
})

const choose_car = (name:string,id:string)=>{
    router.push({
        pathname:'../manage_car/connection',
        params: {name:name,id:id}
    })
}