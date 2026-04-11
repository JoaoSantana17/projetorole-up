import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface RoleCardProps {
  nome: string;
  tipo: string;
  endereco: string;
  status: string;
  eta: string;
  transporte: string;
  started?: boolean;
  finished?: boolean;
  onPress: () => void;
}

export default function RoleCard({
  nome,
  tipo,
  endereco,
  status,
  eta,
  transporte,
  started,
  finished,
  onPress,
}: RoleCardProps) {
  const phase = getPhase({ status, started, finished });
  const phaseColor = getPhaseColor(phase);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>{nome}</Text>


        <View style={[styles.statusBadge, { backgroundColor: phaseColor }]}>
          <Feather name="activity" size={12} color="#000" />
          <Text style={styles.statusText}>{phase}</Text>
        </View>
      </View>

      <Text style={styles.tipo}>{tipo}</Text>
      <Text style={styles.endereco} numberOfLines={2}>{endereco}</Text>

      <View style={styles.footer}>

        <View style={styles.footerChip}>
          <Feather name="clock" size={16} color="#fff" />
          <Text style={styles.footerChipText}>{eta}</Text>
        </View>


        <View style={styles.footerChip}>
          <Feather name="navigation" size={16} color="#fff" />
          <Text style={styles.footerChipText}>{transporte}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function getPhase({
  status,
  started,
  finished,
}: {
  status: string;
  started?: boolean;
  finished?: boolean;
}) {
  if (finished) return 'ENCERRADO';
  if (started) return 'ACONTECENDO';
  return status?.toUpperCase?.() || 'N/A';
}

function getPhaseColor(phase: string) {
  const p = phase.toLowerCase();
  if (p.includes('encerr')) return '#ff4500';
  if (p.includes('acontec')) return '#32cd32'; 
  if (p.includes('desloc')) return '#ffd700';       
  if (p.includes('presente')) return '#32cd32';
  if (p.includes('ausente')) return '#ff4500';
  return '#9aa0a6'; // cinza
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2a0d4f',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  name: { color: '#fff', fontSize: 18, fontWeight: 'bold', flexShrink: 1, marginRight: 8 },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 6,
  },
  statusText: { color: '#000', fontWeight: '700', fontSize: 12 },

  tipo: { color: '#fff6', fontSize: 14, fontWeight: '600', marginBottom: 2 },
  endereco: { color: '#fff6', fontSize: 13, marginBottom: 12 },

  footer: { flexDirection: 'row', justifyContent: 'space-between' },
  footerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  footerChipText: { color: '#fff', fontWeight: '600' },
});
