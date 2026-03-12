import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

let pendingNavigation: {
  name: keyof RootStackParamList;
  params?: RootStackParamList[keyof RootStackParamList];
} | null = null;

export function navigate(
  name: keyof RootStackParamList,
  params?: RootStackParamList[keyof RootStackParamList]
) {
  if (navigationRef.isReady()) {
    (navigationRef as any).navigate(name, params);
    return;
  }

  pendingNavigation = { name, params };
}

export function flushPendingNavigation() {
  if (!pendingNavigation || !navigationRef.isReady()) {
    return;
  }

  const { name, params } = pendingNavigation;
  pendingNavigation = null;
  (navigationRef as any).navigate(name, params);
}
