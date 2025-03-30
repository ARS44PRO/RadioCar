import { Text, View, TextInput, StyleSheet, TouchableOpacity,
  Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from 'expo-font';
import { useState } from 'react';
import {useRouter} from "expo-router";
import { save_store } from "@/assets/module_hooks/store";

const scale = Dimensions.get('screen').fontScale**-1
const answer_from_server = (login:string, password:string)=>{
  if (login=='arsenii' && password=='gleb'){
    return (
      {admin:'1', jwt: '44', error:0}
    );
  }else if (login=='gleb' && password=='arsenii'){
    return (
      {admin:'0',jwt:'55', error:0}
    );
  }else{
    return (
      {admin:'0', jwt:'', error:1}
    );
  }
}


export default function Index() {
  const [login, chlog] = useState('');
  const [password, chpass] = useState('');
  const router = useRouter();
  
  const onpress_button = ()=>{
    if (login!='' && password!=''){
      let mass = answer_from_server(login, password);
      if (mass.error==0){
        save_store('jwt', mass.jwt);
        save_store('admin', mass.admin);
        chlog('');
        chpass('');
        router.push("/(auth)/all_cars");
      }else{
        alert('Такого пользователя нету');
      }
    }
  }

  return (
    <SafeAreaView style={styles.all_body}>
      <Text style={styles.name_welcome}>Welcome!</Text>
      <View style={styles.Inputs}>
        <View style={styles.Login}>
          <Text style={styles.named}>login:</Text>
            <TextInput 
              style={styles.inps} 
              placeholder="Enter.."
              placeholderTextColor='rgb(133,131,131)'
              onChangeText={chlog}
              value={login}
            />
        </View>
        <View>
          <Text style={styles.named}>password:</Text>
            <TextInput 
              style={styles.inps} 
              placeholder="Enter.."
              placeholderTextColor='rgb(133,131,131)'
              onChangeText={chpass}
              value={password}
            />
        </View>
        <TouchableOpacity style={styles.logo} activeOpacity={0.2} onPress={(onpress_button)}>
          <Text style={styles.text_logo}>RC</Text>
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  all_body: {
    backgroundColor: '#666565',
    width: '100%',
    height: '100%',
  },
  name_welcome: {
    fontSize: 50*scale,
    color: '#ffffff',
    textAlign: 'center',
    top: 150,
    fontFamily: 'Inter'
  },
  Inputs: {
    left: 92,
    top: 180,
  },
  Login:{
    marginBottom: 10,
  },
  named:{
    color: '#ffffff',
    fontFamily: 'Inter',
    fontSize: 25*scale
  },
  inps:{
    boxSizing: 'border-box',
    backgroundColor: 'rgb(217, 217, 217)',
    width: 180,
    height: 50,
    marginTop: 10,
    marginLeft: 15,
    borderRadius: 10,
    paddingLeft: 20,
  },
  logo:{
    boxSizing: 'border-box',
    width: 85,
    height: 85,
    backgroundColor: 'rgb(85, 169, 253)',
    borderWidth: 5,
    borderColor: 'rgb(0, 55, 255)',
    borderRadius: '50%',
    marginTop: 20,
    marginLeft: 60
  },
  text_logo:{
    color: 'rgb(0,55,255)',
    fontFamily: 'Inter',
    fontSize: 30*scale,
    paddingLeft: '25%',
    paddingTop: '25%'
  }
})