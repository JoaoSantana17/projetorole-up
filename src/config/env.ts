const fallbackBackend = 'http://10.0.2.2:8080/api';
const fallbackApex = 'http://10.0.2.2:8080/apex';

export const env = {
  backendBaseUrl: process.env.EXPO_PUBLIC_BACKEND_URL ?? fallbackBackend,
  apexBaseUrl: process.env.EXPO_PUBLIC_APEX_URL ?? fallbackApex,
};
