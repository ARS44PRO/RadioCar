import {Text, FlatList, StyleSheet, View, Image, TextInput, Dimensions,
    Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import React from 'react';
import { useRouter } from 'expo-router';
import { get_store } from '@/assets/module_hooks/store';

const Data = [
    {
        name: 'Bigcar',
        ip: '189.12.1.43',
        last: '09.02.2024',
        url: require('C:/Android/Projects/RadioCar/assets/images/image 1.png')
    },
    {
        name: 'Pavel',
        ip: '189.14.1.43',
        last: '25.02.2024',
        url: require('C:/Android/Projects/RadioCar/assets/images/image 2.png')
    },
    {
        name: 'Arsenii',
        ip: '255.179.34.52',
        last: '28.03.2025',
        url: require('C:/Android/Projects/RadioCar/assets/images/image 2.png')
    }
]


const scale = Dimensions.get('screen').fontScale**-1

export default function MainSelect(){
    const router = useRouter();

    return (
        <SafeAreaView style={styles.all_body}>
            <View style={styles.header}>
                <Pressable style={{flexDirection:'row', marginLeft:15}} onPress={()=>{router.push('/all_before/vhod')}}>
                    <Image style={styles.header_arrow} source={require('C:/Android/Projects/RadioCar/assets/images/arrow.png')}/>
                    <Text style={styles.header_named}> Exit</Text>
                </Pressable>
                {get_store('admin')=='1' ?
                <Pressable style={{flexDirection:'row', marginRight:15, marginLeft:'auto'}} onPress={()=>router.push('/(auth)/admin_panel')}>
                    <Text style={styles.header_named}>Admin</Text>
                    <Image style={{marginLeft:10, marginTop:'5%', width:25, height:20}} source={require('C:/Android/Projects/RadioCar/assets/images/lines.png')}/>
                </Pressable>:null
                }
            </View>
            <Text style={styles.name_of}>В сети</Text>
            <View style={styles.all_boxes}>
                <FlatList
                    data={Data}
                    renderItem={({item}) => <Cars name={item.name} ip={item.ip} last={item.last} url={item.url} />}
                    keyExtractor={item=>item.ip}
                />
            </View>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    all_body: {
        backgroundColor: 'rgb(102,101,101)',
        width: '100%',
        height: '100%'
    },
    header: {
        marginTop: 20,
        flexDirection: 'row'
    },
    header_named:{
        color: '#ffffff',
        fontFamily: 'Inter',
        fontSize: 20*scale      
    },
    header_arrow:{
        width: 20,
        height: 10,
        top: '33%'
    },
    name_of:{
        color: '#ffffff',
        fontFamily: 'Inter',
        fontSize: 40*scale,
        top: 20,
        textAlign: 'center'
    },
    all_boxes: {
        marginTop: 30,
        marginLeft: '10%'
    },
    ever_box:{
        width: '90%',
        height: 160,
        backgroundColor: 'rgb(254, 255, 221)',
        borderWidth: 10,
        borderColor: 'rgb(0,55,255)',
        borderRadius: 10,
        marginTop: 20,
        flexDirection:'row'
    },
})

const al = (name:string)=>{alert("choose"+' '+name)}

type props={name:string, ip:string, last:string, url:string}

const Cars = ({name, ip, last, url}: props)=>{
    return(
    <Pressable onPress={()=>al(name)}> 
        <View style={styles.ever_box}>
            <Image style={{
                    width:75*scale,
                    height:75*scale,
                    marginTop:10,
                    marginLeft:10,
                    borderRadius:10
                }} source={url}/>
            <View style={{flexDirection:'column', marginLeft:'4%',marginTop:'7%'}}>
                <Text style={{fontFamily:'Inter', fontSize:20*scale,textAlign:'right'
                        }}>Name:</Text>
                <Text style={{fontFamily:'Inter', fontSize:20*scale,marginTop:12,textAlign:'right'
                    }}>IP:</Text>
                <Text style={{fontFamily:'Inter', fontSize:20*scale,marginTop:'2%',textAlign:'right'
                    }}>Last:</Text>            
            </View>
            <View style={{flexDirection:'column'}}>
                <Text style={{fontFamily:'Inter',
                    fontSize: 35*scale,
                    marginTop: '6%',
                    marginLeft: '10%'
                }}>{name}</Text>
                <Text style={{fontFamily:'Inter',
                        fontSize: 20*scale,
                        textAlign:'center',
                        marginTop:'5%'
                    }}>{ip}</Text>
                <Text style={{fontFamily:'Inter',
                        fontSize: 20*scale,
                        textAlign: 'center',
                        marginTop: '1%'
                    }}>{last}</Text>
            </View>
        </View>
    </Pressable>
);
}