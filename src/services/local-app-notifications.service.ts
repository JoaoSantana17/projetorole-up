import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@role-app:local-notifications';

export type LocalAppNotification = {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: 'role_created' | 'info';
  dataHora: string;
  lida: boolean;
};

export async function getLocalAppNotifications(): Promise<
  LocalAppNotification[]
> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return [];
  }

  return JSON.parse(stored);
}

export async function addLocalAppNotification(
  notification: Omit<
    LocalAppNotification,
    'id' | 'dataHora' | 'lida'
  >
) {
  const current = await getLocalAppNotifications();

  const newNotification: LocalAppNotification = {
    id: String(Date.now()),
    dataHora: new Date().toISOString(),
    lida: false,
    ...notification,
  };

  const updated = [newNotification, ...current];

  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updated)
  );

  return newNotification;
}

export async function markAllNotificationsAsRead() {
  const current = await getLocalAppNotifications();

  const updated = current.map((item) => ({
    ...item,
    lida: true,
  }));

  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updated)
  );

  return updated;
}

export async function clearLocalAppNotifications() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}