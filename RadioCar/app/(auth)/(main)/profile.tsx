import { save_store } from "@/assets/module_hooks/store";
import { router } from "expo-router";
import {View, Text, Pressable} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile(){
    return (
        <SafeAreaView style={{flex:1,alignItems:'center',justifyContent:'center'}}>
            <Pressable style={{
                width:'20%',
                backgroundColor:'black',
                justifyContent:'center',
                alignItems:'center'
            }} onPress={()=>{
                save_store('jwt','')
                router.push('../../all_before/vhod');
            }}>
                <Text style={{
                    color:'white',
                    textAlign:'center'
                }}>Exit</Text>
            </Pressable>
        </SafeAreaView>
    );
}