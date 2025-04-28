import { Dimensions, Text, Pressable, View, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {orient_hor,orient_port} from '@/assets/module_hooks/orient';

const scale = Dimensions.get('screen').fontScale**-1;

export default function Manage() {
  const { name, id } = useLocalSearchParams<{name:string, id: string }>();
  // Состояние для отслеживания нажатия на кнопки
  const [activeButtons, setActiveButtons] = useState({
    left: false,
    right: false,
    circle: false,
    cross: false
  });
  
  // Состояние для режима настройки
  const [editMode, setEditMode] = useState(false);

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

  // Обработчики нажатий для элементов управления
  const handleButtonPress = (button, isPressed) => {
    setActiveButtons(prev => ({
      ...prev,
      [button]: isPressed
    }));
    
    // Здесь можно добавить логику отправки команд на машину
    console.log(`Button ${button} ${isPressed ? 'pressed' : 'released'}`);
  };

  // Переключение режима настройки
  const toggleEditMode = () => {
    setEditMode(prev => !prev);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Шапка с кнопкой назад и настройками */}
      <View style={styles.headerContainer}>
        {/* Кнопка "Назад" (слева) */}
        <View style={styles.header}>
          <Pressable 
            style={styles.headerButton} 
            onPress={handleGoBack}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
            <Text style={styles.headerButtonText}>Назад</Text>
          </Pressable>
        </View>

        {/* Кнопка "Настроить" (справа) */}
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
      
      {/* Элементы управления */}
      <View style={styles.controlsContainer}>
        {/* Левая группа - стрелки */}
        <View style={styles.arrowsContainer}>
          <Pressable 
            style={[styles.controlButton, activeButtons.left && styles.activeButton]}
            onPressIn={() => handleButtonPress('left', true)}
            onPressOut={() => handleButtonPress('left', false)}
          >
            <Ionicons name="chevron-back" size={40} color="white" />
          </Pressable>
          
          <View style={styles.buttonSpacer} />
          
          <Pressable 
            style={[styles.controlButton, activeButtons.right && styles.activeButton]}
            onPressIn={() => handleButtonPress('right', true)}
            onPressOut={() => handleButtonPress('right', false)}
          >
            <Ionicons name="chevron-forward" size={40} color="white" />
          </Pressable>
        </View>
        
        {/* Правая группа - круг и крест (вертикально) */}
        <View style={styles.buttonsContainer}>
          <Pressable 
            style={[styles.controlButton, styles.circleButton, activeButtons.circle && styles.activeButton]}
            onPressIn={() => handleButtonPress('circle', true)}
            onPressOut={() => handleButtonPress('circle', false)}
          >
            <Ionicons name="ellipse-outline" size={36} color="white" />
          </Pressable>
          
          <View style={styles.buttonVerticalSpacer} />
          
          <Pressable 
            style={[styles.controlButton, styles.crossButton, activeButtons.cross && styles.activeButton]}
            onPressIn={() => handleButtonPress('cross', true)}
            onPressOut={() => handleButtonPress('cross', false)}
          >
            <Ionicons name="close" size={40} color="white" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
  },
  // Новый контейнер для шапки с кнопками по краям
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Разместит элементы по краям
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
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
  // Стили для элементов управления
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 40,
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
    backgroundColor: 'rgba(76, 175, 80, 0.3)', // зеленоватый
  },
  crossButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.3)', // красноватый
  },
  activeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    transform: [{ scale: 0.95 }],
  }
});