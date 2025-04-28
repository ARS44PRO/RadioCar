import * as ScreenOrientation from 'expo-screen-orientation';

export const orient_port = async () => {
  try {
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT
    );
  } catch (error) {
    console.error('Ошибка при возврате к вертикальной ориентации:', error);
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