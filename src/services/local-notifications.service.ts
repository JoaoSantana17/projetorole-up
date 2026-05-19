import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { addLocalAppNotification } from './local-app-notifications.service';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function setupLocalNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Notificações do Rolé',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }

  if (!Device.isDevice) {
    return false;
  }

  const { status: currentStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = currentStatus;

  if (currentStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export async function notifyRoleCreated(roleName: string) {
  const title = 'Rolê criado com sucesso 🎉';
  const body = `Seu rolê "${roleName}" foi publicado e já está disponível para a galera.`;

  await addLocalAppNotification({
    titulo: title,
    mensagem: body,
    tipo: 'role_created',
  });

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
      data: {
        type: 'ROLE_CREATED',
      },
    },
    trigger: null,
  });
}