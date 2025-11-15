import {useCallback, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@PintarApp:customColors';

export const usePersistedColors = () => {
  const [colors, setColors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setColors(parsed);
          }
        }
      } catch (err) {
        console.warn('Failed to load persisted colors:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const addColor = useCallback(async (hex: string) => {
    if (colors.includes(hex)) {
      return;
    }
    const updated = [hex, ...colors].slice(0, 20);
    setColors(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to persist color:', err);
    }
  }, [colors]);

  const removeColor = useCallback(async (hex: string) => {
    const updated = colors.filter(c => c !== hex);
    setColors(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to remove persisted color:', err);
    }
  }, [colors]);

  const clearColors = useCallback(async () => {
    setColors([]);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('Failed to clear persisted colors:', err);
    }
  }, []);

  return {colors, isLoading, addColor, removeColor, clearColors};
};

