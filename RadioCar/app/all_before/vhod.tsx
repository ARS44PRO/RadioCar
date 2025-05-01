import { Text, View, TextInput, StyleSheet, TouchableOpacity,
  Dimensions, Image, Platform, KeyboardAvoidingView, Keyboard
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from 'react';
import {useRouter} from "expo-router";
import { save_store } from "@/assets/module_hooks/store";
import * as Font from "expo-font";
import Switcher from "@/assets/module_hooks/myswitch";
import {jwtDecode} from 'jwt-decode';
import {SERVER_URL} from '@/assets/module_hooks/names';
import { Ionicons } from '@expo/vector-icons';

const scale = Dimensions.get('screen').fontScale**-1
const {width, height} = Dimensions.get('window')
type fix = {sub:string,token_type:string,email:string,
    exp:string,is_super:string,iat:string,header:{typ:string,alg:string}}

export default function Index() {
    const [login, chlog] = useState('');
    const [password, chpass] = useState('');
    const router = useRouter();
    let [id, setid] = useState(0);
    const [sender, setsend] = useState('login');
    const [showPassword, setShowPassword] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    
    useEffect(() => {
      const loadFont = async () => {
        try {
          await Font.loadAsync({
            'roboto': require('../../assets/fonts/Roboto_500Medium.ttf'),
          });
        } catch (error) {
          console.error('Ошибка загрузки шрифта:', error);
        }
      };
  
      loadFont();
    }, []);

    useEffect(() => {
        const keyboardWillShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                setKeyboardHeight(e.endCoordinates.height);
            }
        );
        
        const keyboardWillHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardHeight(0);
            }
        );
        
        return () => {
            keyboardWillShowListener.remove();
            keyboardWillHideListener.remove();
        };
    }, []);

    useEffect(()=>{
    if (login!=''&&password!=''&&sender=='login'){
        fetch(`${SERVER_URL}/user/jwt`,{
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: login.replace(/\s+/g, ''),
            password: password.replace(/\s+/g, '')
        })
        }
        ).then(response=>{
        if (response.status == 200){
            return response.json();
        } else if (response.status == 401) {
            throw new Error("Такого пользователя нет, либо вас еще не одобрили")
        } else {
            throw new Error("Error with server");
        }
        }
        )
        .then(mass=>{
            save_store('jwt', mass.access_token);
            save_store('admin', jwtDecode<fix>(mass.access_token).is_super.toString()); 
            router.push("/(auth)/(main)/all_cars");
            chlog('');
            chpass('');
        }).catch(error=>{
            alert(error);
        })
    }else if (login!='' && password!='' && sender=='register'){
        fetch(`${SERVER_URL}/user`,{
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: login.replace(/\s+/g, ''),
                password: password.replace(/\s+/g, ''),
            })
            }
            ).then(response=>{
            if (response.status == 200){
                return response.json();
            } else {
                throw new Error(`Error with server (${response.status})`);
            }
            }
            )
            .then(mass=>{ 
                save_store('jwt','');
                save_store('admin','false');
                alert('Ждите уведомления когда вас примет админ')
                chlog('');
                chpass('');
            }).catch(error=>{
                alert(error);
            })
    }
    }, [id])

    const onpress_button = ()=>{
        if (login!='' && password!=''){
            setid(id+=1);
        }
    }

    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        style={{flex:1, backgroundColor:'#ffffff'}}
      >
        <SafeAreaView style={styles.all_body}>
          <View style={{
            height: keyboardHeight > 0 ? height * 0.17 : height * 0.35, 
            justifyContent: 'flex-start',
            paddingTop: keyboardHeight > 0 ? '2%' : '10%', 
          }}>
            <Image style={[
              styles.logo_img, 
              keyboardHeight > 0 && {width: 18, height: 18}
            ]} source={require('@/assets/images/car_welc.jpg')}/>
            
            <View style={{marginTop: keyboardHeight > 0 ? '1%' : '8%'}}>
              <Text style={[
                styles.text_1, 
                keyboardHeight > 0 && {fontSize: 22 * scale}
              ]}>Добро пожаловать</Text>
              
                <Text style={styles.text_2}>
                  Войдите в свой аккаунт или отправьте заявку на создание нового.
                </Text>
            </View>
          </View>
          
          <View style={{marginTop: keyboardHeight > 0 ? '15%' : '8%'}}>
            <Switcher voider={(value)=>{setsend(value)}}/>
            
            <View style={{marginTop: keyboardHeight > 0 ? '5%' : '14%'}}>
              <View style={styles.Login}>
                <TextInput
                  style={styles.inps} 
                  placeholder="Email"
                  placeholderTextColor='#000000'
                  onChangeText={chlog}
                  value={login}
                />
              </View>
              <View style={{alignItems:'center'}}>
                <View style={styles.passwordContainer}>
                  <TextInput 
                    style={styles.passwordInput} 
                    placeholder="Пароль"
                    placeholderTextColor='#000000'
                    onChangeText={chpass}
                    value={password}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#666565" />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity 
                style={[styles.bt, {marginTop: keyboardHeight > 0 ? 15 : height * 0.06}]} 
                activeOpacity={0.2} 
                onPress={onpress_button}
              >
                <Text style={{
                  fontFamily:'roboto', 
                  color:'#ffffff',
                  textAlign:'center', 
                  fontSize:16*scale
                }}>{sender=='login'?'Войти':'Регистрация'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
}


const styles = StyleSheet.create({

    all_body: {
        backgroundColor: '#ffffff',
        width: '100%',
        height: '100%',
    },
    logo_img: {
        width:25,
        height:25,
        alignSelf: 'center',
        marginTop: '18%'
    },
    view_text:{
        marginTop:'12%'
    },
    text_1:{
        fontFamily:'roboto',
        color:"#000000",
        fontSize: 32*scale,
        textAlign:'center'
    },
    text_2:{
        width:'95%',
        fontFamily:'roboto',
        color:"#666565",
        fontSize: 14*scale,
        textAlign:'center',
        marginTop:'7%',
        alignSelf:'center'
    },
    Login:{
        marginBottom: height*0.01,
        alignItems:'center'
    },
    inps:{
        boxSizing: 'border-box',
        backgroundColor: '#e8def8',
        width: width*0.6,
        height: height*0.06,
        marginTop: height*0.01,
        borderRadius: 10,
        paddingLeft: width*0.05,
    },
    bt:{
        width:width*0.8,
        height:height*0.06,
        marginTop:height*0.08,
        alignSelf: 'center',
        borderRadius:30,
        backgroundColor: '#65558f',
        justifyContent: 'center',
        alignItems: 'center'
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: width * 0.6,
        height: height * 0.06,
        marginTop: height * 0.01,
        backgroundColor: '#e8def8',
        borderRadius: 10,
        position: 'relative',
    },
    passwordInput: {
        flex: 1,
        height: '100%',
        paddingLeft: width * 0.05,
    },
    eyeButton: {
        position: 'absolute',
        right: '7%',
        height: '100%',
        justifyContent: 'center',
    }
})