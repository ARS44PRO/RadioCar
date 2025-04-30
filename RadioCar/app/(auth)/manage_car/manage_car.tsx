import { Dimensions, Text, Pressable, View, StyleSheet,
  Animated, PanResponder
 } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {orient_hor,orient_port} from '@/assets/module_hooks/orient';

const scale = Dimensions.get('screen').fontScale**-1;

export default function Manage() {
  const { name, id } = useLocalSearchParams<{name:string, id: string }>();

  const [activeButtons, setActiveButtons] = useState({
    left: false,
    right: false,
    circle: false,
    cross: false
  });
  
  const arrowPosition = useRef(new Animated.ValueXY()).current;
  const buttonsPosition = useRef(new Animated.ValueXY()).current;
  const [editMode, setEditMode] = useState(false);

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

  useEffect(() => {
    orient_hor();

    return () => {
      orient_port();
    };
  }, []);

  const handleGoBack = async () => {
    try {
      orient_port();
      router.push('../(main)/all_cars');
    } catch (error) {
      console.error('Ошибка при возврате:', error);
    }
  };

  const handleButtonPress = (button:string, isPressed:boolean) => {
    setActiveButtons(prev => ({
      ...prev,
      [button]: isPressed
    }));
    
    console.log(`Button ${button} ${isPressed ? 'pressed' : 'released'}`);
  };

  const toggleEditMode = () => {
    setEditMode(prev => !prev);
  };

  return (
    <SafeAreaView style={styles.container}>
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
      
      <View style={styles.controlsContainer}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.arrowsContainer,
            { transform: arrowPosition.getTranslateTransform() },
            editMode && styles.editModeContainer
          ]}
        >
          <Pressable 
            style={[styles.controlButton, activeButtons.left && styles.activeButton]}
            onPressIn={() => !editMode && handleButtonPress('left', true)}
            onPressOut={() => !editMode && handleButtonPress('left', false)}
            disabled={editMode}
          >
            <Ionicons name="chevron-back" size={40} color="white" />
          </Pressable>
          
          <View style={styles.buttonSpacer} />
          
          <Pressable 
            style={[styles.controlButton, activeButtons.right && styles.activeButton]}
            onPressIn={() => !editMode && handleButtonPress('right', true)}
            onPressOut={() => !editMode && handleButtonPress('right', false)}
            disabled={editMode}
          >
            <Ionicons name="chevron-forward" size={40} color="white" />
          </Pressable>
        </Animated.View>
        
        <Animated.View
          {...buttonsPanResponder.panHandlers}
          style={[
            styles.buttonsContainer,
            { transform: buttonsPosition.getTranslateTransform() },
            editMode && styles.editModeContainer
          ]}
        >
          <Pressable 
            style={[styles.controlButton, styles.circleButton, activeButtons.circle && styles.activeButton]}
            onPressIn={() => !editMode && handleButtonPress('circle', true)}
            onPressOut={() => !editMode && handleButtonPress('circle', false)}
            disabled={editMode}
          >
            <Ionicons name="ellipse-outline" size={36} color="white" />
          </Pressable>
          
          <View style={styles.buttonVerticalSpacer} />
          
          <Pressable 
            style={[styles.controlButton, styles.crossButton, activeButtons.cross && styles.activeButton]}
            onPressIn={() => !editMode && handleButtonPress('cross', true)}
            onPressOut={() => !editMode && handleButtonPress('cross', false)}
            disabled={editMode}
          >
            <Ionicons name="close" size={40} color="white" />
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
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
    // Для кнопки "Настроить" справа
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
    fontSize: 16,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: '10%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: '5%',
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
    backgroundColor: 'rgba(76, 175, 80, 0.3)', 
  },
  crossButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.3)', 
  },
  activeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    transform: [{ scale: 0.95 }],
  },
  editModeContainer: {
    borderWidth: 2,
    borderColor: '#ffcc00',
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 5,
  },
});