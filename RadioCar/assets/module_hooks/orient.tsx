import * as ScreenOrientation from 'expo-screen-orientation';
import { Platform } from 'react-native';

export const orient_port = async () => {
  try {    
    if (Platform.OS === 'ios') {
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      } catch (error) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
        alert('Сбой, ориентациия вернулась к адаптивной');
      }
    } else {
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      } catch(e) {
        alert('Сбой, ориентациия вернулась к адаптивной');
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
      }
    }
  } catch (error) {
    alert('Сбой, ориентациия вернулась к адаптивной');
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
  }
};

export const orient_hor = async () => {
  try {
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE
    );
  } catch (error) {
    console.error('Ошибка при установке горизонтальной ориентации:', error);
  }
};