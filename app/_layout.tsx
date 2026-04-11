import { AuthProvider } from '@/src/contexts/AuthContext';
import { ThemeProvider, useAppTheme } from '@/src/contexts/ThemeContext';
import { queryClient } from '@/src/lib/query-client';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

function LayoutContent() {
  const { mode } = useAppTheme();

  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="cadastro" />
        <Stack.Screen name="home" />
        <Stack.Screen name="criar-role" />
        <Stack.Screen name="detalhes/[id]" />
        <Stack.Screen name="editar-role/[id]" />
        <Stack.Screen name="perfil" />
        <Stack.Screen name="apex-presencas/[roleId]" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <LayoutContent />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
