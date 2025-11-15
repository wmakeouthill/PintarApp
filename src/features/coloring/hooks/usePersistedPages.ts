import {useCallback, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {ColoringPage} from '../models/coloringTypes';

const STORAGE_KEY = '@PintarApp:importedPages';

export const usePersistedPages = () => {
  const [pages, setPages] = useState<ColoringPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setPages(parsed);
          }
        }
      } catch (err) {
        console.warn('Failed to load persisted pages:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const addPage = useCallback(async (page: ColoringPage) => {
    const updated = [page, ...pages.filter(p => p.id !== page.id)];
    setPages(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to persist page:', err);
    }
  }, [pages]);

  const removePage = useCallback(async (pageId: string) => {
    const updated = pages.filter(p => p.id !== pageId);
    setPages(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to remove persisted page:', err);
    }
  }, [pages]);

  const clearPages = useCallback(async () => {
    setPages([]);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('Failed to clear persisted pages:', err);
    }
  }, []);

  return {pages, isLoading, addPage, removePage, clearPages};
};

