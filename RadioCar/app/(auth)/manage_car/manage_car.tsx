import { Dimensions, Text, Pressable, View, StyleSheet,
  Animated, PanResponder, ActivityIndicator,
} from 'react-native';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {orient_hor, orient_port} from '@/assets/module_hooks/orient';
import {
  RTCView, 
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  MediaStream
} from 'react-native-webrtc';
import { runOnJS } from 'react-native-reanimated';
import { get_store } from '@/assets/module_hooks/store';
import { jwtDecode } from 'jwt-decode';
import { WS_PATH } from '@/assets/module_hooks/names';

const scale = Dimensions.get('screen').fontScale**-1;
type props_bt = {
  left: boolean,
  right: boolean,
  circle: boolean,
  cross: boolean
}

type fix = {sub:string,token_type:string,email:string,
  exp:string,is_super:string,iat:string,header:{typ:string,alg:string}}


// Для типа dataChannel используйте более точный тип или сделайте свой интерфейс
interface RTCDataChannelWithEvents {
  send: (data: string) => void;
  close: () => void;
  readyState: string;
  onopen: ((this: any, ev: any) => any) | null;
  onclose: ((this: any, ev: any) => any) | null;
  onmessage: ((this: any, ev: any) => any) | null;
  onerror: ((this: any, ev: any) => any) | null;
}

interface RTCPeerConnectionWithHandlers extends RTCPeerConnection {
  onicecandidate: (event: RTCPeerConnectionIceEvent) => void;
  ontrack: (event: RTCTrackEvent) => void;
}

const peerConnectionConfig = {
  'iceServers': [
		{'urls': 'stun:stun.stunprotocol.org:3478'},
		{'urls': 'stun:stun.l.google.com:19302'},
  ]
};

export default function Manage() {
  const params = useLocalSearchParams();
  const name = params.name as string;
  const id = params.id as string;
  const speed = params.speed ? Number(params.speed) : 0;

  // Состояния и рефы для WebRTC
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [recData, setRecData] = useState<{ads:number|string}>({ads:''});
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const serverConnectionRef = useRef<WebSocket | null>(null);
  const dataChannelRef = useRef<RTCDataChannelWithEvents | null>(null);
  const uuidRef = useRef<string>(jwtDecode<fix>(get_store('jwt')).sub);
  const remoteDescriptionRef = useRef<string | null>(null);
  const pendingIceRef = useRef<RTCIceCandidate[]>([]);
  const meltingIceRef = useRef<RTCIceCandidate[]>([]);
  const jwt = useRef(get_store('jwt'));

  // Состояния для UI
  const [activeButtons, setActiveButtons] = useState<props_bt>({
    left: false,
    right: false,
    circle: false,
    cross: false
  });
  
  const arrowPosition = useRef(new Animated.ValueXY()).current;
  const buttonsPosition = useRef(new Animated.ValueXY()).current;
  const [editMode, setEditMode] = useState(false);
  // Обработчики WebRTC
  const errorHandler = useCallback((error: any) => {
    console.log('Error:', error);
  }, []);

  const gotRemoteStream = useCallback((event: any) => {
    console.log('got remote stream');
    setRemoteStream(event.streams[0]);
  }, []);

  const gotIceCandidate = useCallback((event: any) => {
    if (event.candidate != null) {
      if (remoteDescriptionRef.current) {
        serverConnectionRef.current?.send(JSON.stringify({
          'type': 'ice-candidate',
          'ice': event.candidate,
          'uuid': uuidRef.current,
          'to': remoteDescriptionRef.current
        }));
      } else {
        meltingIceRef.current.push(event.candidate);
      }
    }
  }, []);

  const gotMessageFromServer = useCallback((message: any) => {
    if (!peerConnectionRef.current) {
      startWebRTC();
      return;
    }

    try {
      const signal = JSON.parse(message.data);

      if (signal.type === 'error') {
        console.error(signal.msg);
        handleGoBack();
        return;
      }

      if (signal.sdp) {
        console.log('Получен SDP:', signal.sdp);
        peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(signal)
        ).catch(errorHandler);
        
        // Добавляем ожидающие ICE-кандидаты
        for (const ice of pendingIceRef.current) {
          peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(ice));
        }
        pendingIceRef.current = [];
        
        // Отправляем накопленные ICE-кандидаты
        for (const ice of meltingIceRef.current) {
          serverConnectionRef.current?.send(JSON.stringify({
            uuid: uuidRef.current,
            type: 'ice-candidate',
            to: signal.uuid,
            candidate: ice
          }));
        }
        meltingIceRef.current = [];
        
        remoteDescriptionRef.current = signal.uuid;
      } else if (signal.ice) {
        if (remoteDescriptionRef.current) {
          peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(signal.ice)
          ).catch(errorHandler);
        } else {
          pendingIceRef.current.push(signal.ice);
        }
      }
    } catch (e) {
      console.error('Ошибка при разборе сообщения:', e);
    }
  }, [errorHandler]);

  // Функция для запуска WebRTC
  const startWebRTC = useCallback(async () => {
    try {
      const peerConnection = new RTCPeerConnection(peerConnectionConfig) as RTCPeerConnectionWithHandlers;
      peerConnectionRef.current = peerConnection;

      peerConnection.onicecandidate = gotIceCandidate;
      peerConnection.ontrack = gotRemoteStream;

      // Создаем dataChannel и приводим к нашему типу
      const dataChannel = peerConnection.createDataChannel("json") as unknown as RTCDataChannelWithEvents;
      dataChannelRef.current = dataChannel;

      // Используем прямое присваивание для обработчиков
      dataChannel.onopen = function() {
        console.log("Data channel открыт");
        try {
          if (dataChannel.readyState === 'open') {
            dataChannel.send(JSON.stringify({ hello: "from viewer" }));
          }
        } catch (e) {
          console.error("Ошибка при отправке hello:", e);
        }
      };

      dataChannel.onclose = function() {
        console.log("Data channel закрыт");
      };

      dataChannel.onerror = function(error) {
        console.error("Data channel ошибка:", error);
      };

      dataChannel.onmessage = function(event) {
        try {
          const data = JSON.parse(event.data);
          setRecData(data);
          console.log("Получен JSON от стримера:", data);
        } catch (e) {
          console.warn("Получен не-JSON:", event.data);
        }
      };

      peerConnection.addTransceiver('video', { direction: 'recvonly' });

      // Создаем оффер и устанавливаем локальное описание для регистрации
      const registerOffer = await peerConnection.createOffer({});
      await peerConnection.setLocalDescription(registerOffer);

      // Отправляем регистрационное сообщение
      if (serverConnectionRef.current && serverConnectionRef.current.readyState === WebSocket.OPEN) {
        serverConnectionRef.current.send(JSON.stringify({
          'role': 'viewer',
          'type': 'register',
          'uuid': uuidRef.current,
          'jwt': jwt.current
        }));
        
        // Сразу вызываем функцию connect, так как ID стримера уже известен
        await connect(id);
      } else {
        console.error('WebSocket не открыт при попытке отправки регистрации');
      }
    } catch (err) {
      console.error("Ошибка при запуске WebRTC:", err);
    }
  }, [gotIceCandidate, gotRemoteStream, id]); // Добавляем id в зависимости

  // Функция connect для установления соединения со стримером
  const connect = useCallback(async (streamerId: string) => {
    console.log('Соединение со стримером:', streamerId);
    
    if (!peerConnectionRef.current) {
      console.error('Попытка соединения без инициализации peerConnection');
      return;
    }
    
    try {
      // Создаем новый SDP оффер специально для подключения к стримеру
      const offer = await peerConnectionRef.current.createOffer({});
      
      // Устанавливаем локальное описание с предложением
      await peerConnectionRef.current.setLocalDescription(offer);
      
      // Отправляем оффер стримеру
      if (serverConnectionRef.current && serverConnectionRef.current.readyState === WebSocket.OPEN) {
        serverConnectionRef.current.send(JSON.stringify({
          uuid: uuidRef.current,
          to: streamerId,
          type: 'offer',
          sdp: peerConnectionRef.current.localDescription?.sdp
        }));
        console.log('Отправлен оффер стримеру');
      } else {
        console.error('WebSocket не открыт при попытке отправки оффера');
      }
    } catch (err) {
      console.error('Ошибка при установлении соединения:', err);
    }
  }, []);

  // Добавляем функцию для корректного закрытия всех соединений
  const cleanupConnections = useCallback(() => {
    console.log('Очистка всех соединений...');
    
    // Закрываем dataChannel
    if (dataChannelRef.current) {
      try {
        if (dataChannelRef.current.readyState === 'open') {
          // Отправляем сообщение о закрытии соединения, если нужно
          dataChannelRef.current.send(JSON.stringify({ command: 'disconnect' }));
        }
        dataChannelRef.current.onopen = null;
        dataChannelRef.current.onmessage = null;
        dataChannelRef.current.onerror = null;
        dataChannelRef.current.onclose = null;
        dataChannelRef.current.close();
        console.log('DataChannel закрыт');
      } catch (e) {
        console.error('Ошибка при закрытии DataChannel:', e);
      }
    }
    
    // Закрываем RTCPeerConnection
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.onicecandidate = null;
        peerConnectionRef.current.ontrack = null;
        
        // Удаляем все транссиверы
        const transceivers = peerConnectionRef.current.getTransceivers();
        if (transceivers) {
          transceivers.forEach(transceiver => {
            try {
              transceiver.stop();
            } catch (e) {
              console.warn('Ошибка при остановке трансивера:', e);
            }
          });
        }
        
        peerConnectionRef.current.close();
        console.log('PeerConnection закрыт');
      } catch (e) {
        console.error('Ошибка при закрытии PeerConnection:', e);
      }
    }
    
    // Закрываем WebSocket
    if (serverConnectionRef.current) {
      try {
        // Отправляем прощальное сообщение, если соединение открыто
        if (serverConnectionRef.current.readyState === WebSocket.OPEN) {
          serverConnectionRef.current.send(JSON.stringify({
            'type': 'disconnect',
            'uuid': uuidRef.current
          }));
        }
        
        serverConnectionRef.current.onopen = null;
        serverConnectionRef.current.onmessage = null;
        serverConnectionRef.current.onerror = null;
        serverConnectionRef.current.onclose = null;
        serverConnectionRef.current.close();
        console.log('WebSocket закрыт');
      } catch (e) {
        console.error('Ошибка при закрытии WebSocket:', e);
      }
    }
    
    // Освобождаем медиапотоки
    if (remoteStream) {
      try {
        const tracks = remoteStream.getTracks();
        tracks.forEach(track => {
          track.stop();
        });
        console.log('Медиапотоки остановлены');
      } catch (e) {
        console.error('Ошибка при остановке медиапотока:', e);
      }
      setRemoteStream(null);
    }
    
    // Очищаем буферы
    pendingIceRef.current = [];
    meltingIceRef.current = [];
    remoteDescriptionRef.current = null;
    
    // Возвращаем ориентацию экрана
    orient_port();
  }, [remoteStream]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => editMode,
    onMoveShouldSetPanResponder: () => editMode,
    onPanResponderGrant: () => {
      arrowPosition.extractOffset();
    },
    onPanResponderMove: (evt, gestureState) => {
      arrowPosition.setValue({
        x: gestureState.dx,
        y: gestureState.dy
      });
    },
    onPanResponderRelease: () => {
      arrowPosition.flattenOffset();
    },
  });

  const buttonsPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => editMode,
    onMoveShouldSetPanResponder: () => editMode,
    onPanResponderGrant: () => {
      buttonsPosition.extractOffset();
    },
    onPanResponderMove: (evt, gestureState) => {
      buttonsPosition.setValue({
        x: gestureState.dx,
        y: gestureState.dy
      });
    },
    onPanResponderRelease: () => {
      buttonsPosition.flattenOffset();
    },
  });

  // Инициализация WebRTC и ориентации экрана
  useEffect(() => {
    orient_hor();

    // Создаем WebSocket соединение
    const wsConnection = new WebSocket(WS_PATH);
    serverConnectionRef.current = wsConnection;
    
    // Настраиваем обработчики WebSocket
    wsConnection.onopen = () => {
      console.log('WebSocket соединение установлено');
      startWebRTC();
    };
    
    wsConnection.onmessage = gotMessageFromServer;
    
    wsConnection.onerror = (error) => {
      console.error('WebSocket ошибка:', error);
      handleGoBack();
    };
    
    wsConnection.onclose = () => {
      console.log('WebSocket соединение закрыто');
    };

    // Очистка при размонтировании компонента
    return () => {
      // Используем выделенную функцию очистки
      cleanupConnections();
    };
  }, []);

  const handleGoBack = async () => {
    try {
      // Вызываем функцию очистки перед переходом на другую страницу
      cleanupConnections();
      
      // Небольшая задержка для завершения процессов очистки
      setTimeout(() => {
        router.push('../(main)/all_cars');
      }, 100);
    } catch (error) {
      console.error('Ошибка при возврате:', error);
      // В случае ошибки все равно пытаемся перейти на главную страницу
      router.push('../(main)/all_cars');
    }
  };

  const sendCommand = useCallback((currentState: props_bt) => {
    console.log('Отправка команды:', 
      'L:', currentState.left, 
      'R:', currentState.right, 
      'C:', currentState.circle, 
      'X:', currentState.cross,
      'Speed:', speed
    );

    // Отправка команд через DataChannel
    if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      try {
        dataChannelRef.current.send(JSON.stringify({
          command: 'control',
          buttons: currentState,
          speed: speed,
          timestamp: Date.now() // Добавляем временную метку для трассировки
        }));
      } catch (error) {
        console.error('Ошибка при отправке команды:', error);
      }
    }
  }, [speed]);

  // ЕДИНЫЙ ОБРАБОТЧИК ДЛЯ ВСЕХ КНОПОК
  const activeButtonsRef = useRef<props_bt>({
    left: false,
    right: false,
    circle: false,
    cross: false
  });

  const handleButtonStateChange = useCallback((button: keyof props_bt, isPressed: boolean) => {
    // Сначала обновляем ref для мгновенного доступа
    activeButtonsRef.current = {
      ...activeButtonsRef.current,
      [button]: isPressed,
    };
    
    // Затем обновляем состояние React для UI
    setActiveButtons(activeButtonsRef.current);
    
    // Отправляем команду с актуальным состоянием
    sendCommand(activeButtonsRef.current);
  }, []); // Зависимость только от sendCommand

  const turn_right = editMode ? Gesture.Tap().enabled(false) : Gesture.LongPress()
    .minDuration(0)
    .onBegin(() => runOnJS(handleButtonStateChange)('right', true))
    .onEnd(()=>runOnJS(handleButtonStateChange)('right',false))
    .onFinalize(()=>runOnJS(handleButtonStateChange)('right',false));

  const turn_left = editMode ? Gesture.Tap().enabled(false) : Gesture.LongPress()
    .minDuration(0)
    .onBegin(() => runOnJS(handleButtonStateChange)('left', true))
    .onEnd(()=>runOnJS(handleButtonStateChange)('left',false))
    .onFinalize(()=>runOnJS(handleButtonStateChange)('left',false));

  const go = editMode ? Gesture.Tap().enabled(false) : Gesture.LongPress()
    .minDuration(0)
    .onBegin(() => runOnJS(handleButtonStateChange)('circle', true))
    .onEnd(()=>runOnJS(handleButtonStateChange)('circle',false))
    .onFinalize(()=>runOnJS(handleButtonStateChange)('circle',false));

  const back = editMode ? Gesture.Tap().enabled(false) : Gesture.LongPress()
    .minDuration(0)
    .onBegin(() => runOnJS(handleButtonStateChange)('cross', true))
    .onEnd(()=>runOnJS(handleButtonStateChange)('cross',false))
    .onFinalize(()=>runOnJS(handleButtonStateChange)('cross',false));

  const toggleEditMode = () => {
    setEditMode(prev => !prev);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={[styles.all, {zIndex:remoteStream==null?20:0}]}>
          <Text style={{
              color: '#000000',
              fontSize: 25*scale,
          }}>Connect to {name}</Text>
          <ActivityIndicator style={{marginTop:'10%'}} size="large" color='#000000' />
      </View>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Pressable 
            style={styles.headerButton} 
            onPress={handleGoBack}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
            <Text style={styles.headerButtonText}>Назад</Text>
          </Pressable>
        </View>

        <View style={styles.headerRight}>
          <View style={{flexDirection:'column',justifyContent:'center'}}>
            <Text 
              style={styles.carNameText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {name}
            </Text>
            <Text style={[styles.carNameText,{textAlign:'center'}]} numberOfLines={1} ellipsizeMode='tail'>
              {recData.ads}V
            </Text>
          </View>
          <Pressable 
            style={[styles.settingsButton, editMode && styles.settingsButtonActive]} 
            onPress={toggleEditMode}
          >
            <Ionicons name="move-outline" size={24} color="white" /> 
            <Text style={styles.headerButtonText}>
              {editMode ? "Готово" : "Настроить"}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Добавляем видеопоток от машины */}
      {remoteStream && (
        <View style={styles.videoContainer}>
          <RTCView 
            streamURL={remoteStream.toURL()} 
            style={styles.remoteVideo}
            objectFit="cover"
          />
        </View>
      )}

      <View style={styles.content}>
        <Text style={[styles.carIdText, { fontSize: 24 * scale }]}>
          Управление машиной #{name}
        </Text>
        
        {editMode && (
          <Text style={styles.editModeText}>
            Режим настройки активен
          </Text>
        )}
      </View>
      
      <View 
        style={styles.controlsContainer}
      >
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.arrowsContainer,
            { transform: arrowPosition.getTranslateTransform() },
            editMode && styles.editModeContainer
          ]}
          pointerEvents={editMode ? "auto" : "box-none"} 
        >
          <GestureDetector gesture={turn_left}>
          <View
            style={[styles.controlButton, activeButtons.left && styles.activeButton]}
          >
            <Ionicons name="chevron-back" size={40} color="white" />
          </View>
          </GestureDetector>
          
          <View style={styles.buttonSpacer} />

          <GestureDetector gesture={turn_right}>          
          <View
            style={[styles.controlButton, activeButtons.right && styles.activeButton]}
          >
            <Ionicons name="chevron-forward" size={40} color="white" />
          </View>
          </GestureDetector>
        </Animated.View>
        
        <Animated.View
          {...buttonsPanResponder.panHandlers}
          style={[
            styles.buttonsContainer,
            { transform: buttonsPosition.getTranslateTransform() },
            editMode && styles.editModeContainer
          ]}
          pointerEvents={editMode ? "auto" : "box-none"}
        >
          <GestureDetector gesture={go}>
          <View
            style={[styles.controlButton, styles.circleButton, activeButtons.circle && styles.activeButton]}
          >
            <Ionicons name="ellipse-outline" size={36} color="white" />
          </View>
          </GestureDetector>
          
          <View style={styles.buttonVerticalSpacer} />
          
          <GestureDetector gesture={back}>
          <View 
            style={[styles.controlButton, styles.crossButton, activeButtons.cross && styles.activeButton]}
          >
            <Ionicons name="close" size={40} color="white" />
          </View>
          </GestureDetector>

        </Animated.View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    position: 'absolute',
    top: '3%',
    left: '3%',
    right: '3%',
    zIndex: 10,
  },
  header: {
    // Для кнопки "Назад" слева
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#800080',
    padding: 8,
    borderRadius: 8,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 8,
  },
  settingsButtonActive: {
    backgroundColor: '#4CAF50',
  },
  headerButtonText: {
    color: 'white',
    marginLeft: 5,
  },
  carNameText: {
    color: 'white',
    fontSize: 16*scale,
    marginRight: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
    maxWidth: 150,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carIdText: {
    color: 'white',
  },
  editModeText: {
    color: '#ffcc00',
    marginTop: 10,
    fontSize: 16*scale,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: '10%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: '5%',
    zIndex:10
  },
  arrowsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  controlButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonSpacer: {
    width: 20,
  },
  buttonVerticalSpacer: {
    height: 20,
  },
  circleButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.7)', 
  },
  crossButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.7)', 
  },
  activeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ scale: 0.95 }],
  },
  editModeContainer: {
    borderWidth: 2,
    borderColor: '#ffcc00',
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 5,
  },
  videoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  remoteVideo: {
    flex: 1,
  },
  all:{
    backgroundColor: '#ffffff',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width:'100%',
    height:'100%',
    flex:1,
    justifyContent:'center',
    alignItems:'center'
  },
  speedContainer: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    right: '10%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    zIndex: 15,
  },
  speedText: {
    color: 'white',
    fontSize: 18*scale,
    marginBottom: 10,
  },
  speedSlider: {
    width: '100%',
    height: 40,
  },
});