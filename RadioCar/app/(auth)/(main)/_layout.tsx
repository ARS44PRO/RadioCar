import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {View, StyleSheet, Animated, Dimensions, Pressable} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { get_store } from '@/assets/module_hooks/store';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

const scale = Dimensions.get('screen').fontScale**-1;
const {width, height} = Dimensions.get('window');

export default function TabLayout() {
    const anim = useRef(new Animated.Value(0)).current;
    const [tabCount, setTabCount] = useState(2);
    const [tabWidth, setTabWidth] = useState(width / 2);
    
    useEffect(() => {
        const ad = get_store('admin');
        const newCount = ad === 'true' ? 3 : 2;
        setTabCount(newCount);
        setTabWidth(width / newCount);
    }, []);

    const go = (index:number)=>{
        Animated.spring(anim, {
            toValue:(index-1)*tabWidth,
            damping:15,
            stiffness:90,
            useNativeDriver:true
        }).start();
    };
    return (
        <View style={{flex:1}}>
        <Animated.View style={[
            styles.line,
            {
                transform: [{translateX:anim}],
                width:tabWidth*0.5,
                left:(tabWidth*0.25)
            }
        ]}/>
        <Tabs
            screenOptions={{
            tabBarActiveTintColor: '#000000',
            tabBarInactiveTintColor: '#000000',
            tabBarStyle: {
                elevation: 0,
                shadowColor: 'transparent',
                shadowOpacity: 0,
                shadowOffset: { width: 0, height: 0 },
                shadowRadius: 0,
                borderTopWidth: 0,
                borderTopColor: 'transparent',
                backgroundColor: 'transparent',
                height: height*0.1,
            },
            }}
        >
            <View style={styles.line}/>
            <Tabs.Screen
            name="all_cars"
            options={{
                title: 'Машины',
                tabBarLabelStyle:{
                    fontFamily:'roboto',
                    fontSize: 13*scale
                },
                tabBarIcon: ({ color }) => (
                <Ionicons name="car-outline" size={23} color={color} />
                ),
                headerShown:false,
            }}
            listeners={{
                focus: ()=>go(1)
            }}
            />
            <Tabs.Screen
            name="all_users"
            options={{
                title: 'Пользователи',
                href: tabCount>2?'./(auth)/(main)/all_users':null,
                tabBarLabelStyle:{
                    fontFamily:'roboto',
                    fontSize: 13*scale
                },
                tabBarIcon: ({ color }) => (
                <Ionicons name="people-outline" size={23} color={color} />
                ),
                headerShown:false
            }}
            listeners={{
                focus: ()=>go(2)
            }}
            />
            <Tabs.Screen
            name="profile"
            options={{
                title: 'Профиль',
                tabBarLabelStyle:{
                    fontFamily:'roboto',
                    fontSize: 13*scale
                },
                tabBarIcon: ({ color }) => (
                <Ionicons name="person-circle-outline" size={23} color={color} />
                ),
                headerShown:false
            }}
            listeners={{
                focus: ()=>go(tabCount)
            }}
            />
        </Tabs>
        </View>
    );
}

const styles = StyleSheet.create({
    line:{
        position:'absolute',
        height:height*0.035,
        backgroundColor:'#e8def8',
        borderRadius:30,
        bottom:height*0.06,
    }
})