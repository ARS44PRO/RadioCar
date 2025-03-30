import {Text, FlatList, StyleSheet, View, Image, TextInput, Dimensions,
    Pressable, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import BouncyCheckbox from "react-native-bouncy-checkbox";


let data = [
    {
        name: 'Bigcar',
        admin: 'user',
    },
    {
        name: 'Pavel',
        admin: 'admin'
    },
    {
        name: 'Arsenii',
        admin: 'user'
    },
    {
        name: 'Gleb',
        admin:'admin'
    }
]

const scale = Dimensions.get('screen').fontScale**-1

export default function MainSelect(){
    const [modal_add, setModalAdd] = useState(false);
    const [Data, setData] = useState([{name:'',admin:''}]);
    const [refresh, setrefresh] = useState(false);
    const [login, setlogin] = useState('');
    const [password, setpass] = useState('');
    const [admin, setadmin] = useState(false);
    const router = useRouter();

    const update=()=>{
        setrefresh(true);
        setData(data)
        setrefresh(false);
    }

    return (
        <SafeAreaView style={styles.all_body}>
            <View style={styles.header}>
                <Pressable style={{flexDirection:'row', marginLeft:15}} onPress={()=>{router.back()}}>
                    <Image style={styles.header_arrow} source={require('C:/Android/Projects/RadioCar/assets/images/arrow.png')}/>
                    <Text style={styles.header_named}> Exit</Text>
                </Pressable>
                <Pressable style={{flexDirection:'row', marginRight:15, marginLeft:'auto'}} onPress={()=>setModalAdd(true)}>
                    <Text style={styles.header_named}>New user</Text>
                </Pressable>
            </View>
            <Pressable onPress={update}>
                <Text style={styles.name_of}>Users</Text>
            </Pressable>
            <View style={styles.all_boxes}>
                <FlatList
                    onRefresh={update}
                    refreshing={refresh}
                    data={Data}
                    renderItem={({item}) => <Cars name={item.name} admin={item.admin} />}
                    keyExtractor={item=>item.name}
                />
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modal_add}
                >
                <View style={styles.centeredView}>
                    <View style={styles.modalView_1}>
                        <TextInput style={{
                            borderWidth:2,
                            borderColor:'#000000',
                            width:'80%',
                            height:'25%',
                            borderRadius:10,
                            paddingLeft:15,
                        }} onChangeText={setlogin} value={login} placeholder='Login' placeholderTextColor='#000000' />
                        <TextInput style={{
                            borderWidth:2,
                            borderColor:'#000000',
                            width:'80%',
                            borderRadius:10,
                            paddingLeft:15,
                            marginTop:'5%',
                            height:'25%'
                        }} onChangeText={setpass} value={password} placeholder='Password' placeholderTextColor='#000000' />
                        <BouncyCheckbox 
                            onPress={()=>setadmin(!admin)}
                            text='admin'
                            fillColor="black"
                            textStyle={{color:'black', textDecorationLine:'none'}}
                            style={{marginTop:13, marginLeft:'25%'}}
                        />
                        <Pressable
                            style={[styles.button_1, styles.buttonClose]}
                            onPress={() => {
                                if (login!='' && password!='')
                                add_name(login, password, admin)
                                setModalAdd(false);
                                setlogin('');
                                setpass('');
                                setadmin(false);
                                update();
                            }}>
                            <Text style={styles.textStyle_1}>Add</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
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
        height: 100,
        backgroundColor: 'rgb(254, 255, 221)',
        borderWidth: 10,
        borderColor: 'rgb(0,55,255)',
        borderRadius: 10,
        marginTop: 20,
        alignItems:'center',
        justifyContent:'center'
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView_1: {
        width:'70%',
        height:'30%',
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button_1: {
        borderRadius: 20,
        padding: 9,
        width:'40%',
        elevation: 2,
    },
    buttonOpen: {
        backgroundColor: '#F194FF',
    },
    buttonClose: {
        backgroundColor: '#2196F3',
        marginTop:9
    },
    textStyle_1: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
    },
        textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize:20*scale
    },
})

const del_name = (name:string, admin:string)=>{
    data = data.filter(n=>(n.name!=name || n.admin!= admin));
}
const add_name = (name:string, password:string, admin:boolean)=>{
    let pas = admin==true ? 'admin':'user'
    data.push({name:name, admin:pas})
}

type props={name:string, admin:string}

const Cars = ({name, admin}: props)=>{
    const [modalVis, setModalVis] = useState(false);
    if (name!='' && admin!=''){
        return(
        <View>
            <Pressable onPress={()=>setModalVis(true)}> 
                <View style={styles.ever_box}>
                    <Text style={{
                        fontSize: 30*scale,
                    }}>{name} ({admin})</Text>
                </View>
            </Pressable>
            <Modal
                animationType='slide'
                transparent={true}
                visible={modalVis}
            >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                <Text style={{marginBottom: 15,fontSize:25*scale,
                    textAlign: 'center',}}>Delete {name}?</Text>
                <Pressable
                    style={[styles.button, styles.buttonClose]}
                    onPress={() => {
                        setModalVis(false);
                        del_name(name, admin);
                    }}>
                    <Text style={styles.textStyle}>Delete</Text>
                </Pressable>
                </View>
            </View>
            </Modal>
        </View>            
        );
    }
}
