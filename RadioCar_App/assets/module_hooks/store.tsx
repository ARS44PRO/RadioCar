import * as SecureStore from 'expo-secure-store';

export function save_store(key:string, value:string) {
  SecureStore.setItem(key, value);
}

export function get_store(key: string) {
  let result = SecureStore.getItem(key);
  if (result) {
    return result;
  } else {
    return 'NaN';
  }
}
