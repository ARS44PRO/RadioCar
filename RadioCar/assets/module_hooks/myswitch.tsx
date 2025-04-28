import { Text, View, StyleSheet, Pressable,
    Animated, Dimensions, Image
} from 'react-native';
import {useRef, useState} from 'react';

const {width, height} = Dimensions.get('window')
const scale = Dimensions.get('screen').fontScale**-1

type props = {
    voider: (value:string)=>void;
}

const Switcher = ({voider}:props)=>{
    const fadeanim_1 = useRef(new Animated.Value(1)).current
    const fadeanim_2 = useRef(new Animated.Value(0)).current

    const togle_anim = (showfirst: boolean)=>{
        Animated.parallel([
            Animated.timing(fadeanim_1, {
              toValue: showfirst ? 1 : 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(fadeanim_2, {
              toValue: showfirst ? 0 : 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();
    };

    return (
        <View style={styles.all}>
            <Pressable onPress={()=>{
                voider('login');
                togle_anim(true);
            }}>
                <Animated.View
                    style={[styles.left, {
                        backgroundColor: fadeanim_1.interpolate({
                            inputRange:[0,1],
                            outputRange: ['rgba(232,222,248,0)','rgba(232,222,248,1)']
                        })
                    }]}
                >
                    <Image style={styles.img_style} source={require('@/assets/images/tick.png')}/>
                    <Text style={[
                        styles.text,
                        {
                            paddingLeft:'7%'
                        }
                    ]}>Войти</Text>
                </Animated.View>
            </Pressable>
            <View style={styles.line}/>
            <Pressable onPress={
                ()=>{
                    voider('register');
                    togle_anim(false);
                }
            }>
                <Animated.View
                    style={[styles.right, {
                        backgroundColor: fadeanim_2.interpolate({
                            inputRange:[0,1],
                            outputRange:['rgba(232,222,248,0)', 'rgba(232,222,248,1)']
                        })
                    }]}
                >
                    <Text style={styles.text}>Регистрация</Text>
                </Animated.View>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    all:{
        width:'80%',
        height:'11%',
        marginHorizontal:'auto',
        borderWidth:1,
        borderColor:'#79747e',
        borderRadius:30,
        flexDirection:'row',
        justifyContent: 'flex-start',
    },
    img_style:{
        height:height*0.012,
        width:height*0.015,
        marginVertical:'auto',
    },
    left:{
        flexDirection:'row',
        height:'100%',
        width: width*0.8*0.5,
        borderTopLeftRadius:30,
        borderBottomLeftRadius:30,
        justifyContent:'center'
    },
    right:{
        height:'100%',
        width:width*0.80*0.49,
        borderTopRightRadius:30,
        borderBottomRightRadius:30,
        alignItems:'center',
    },
    text:{
        fontFamily:'roboto',
        fontSize:14*scale,
        marginVertical:'auto',
    },
    line:{
        height:'100%',
        width:1,
        backgroundColor:'#79747e'
    }
})


export default Switcher;