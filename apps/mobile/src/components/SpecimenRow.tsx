import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle, Zap } from 'lucide-react-native';

interface SpecimenRowProps {
  name: string;
  location: string;
  health: number;
  moisture: number;
  light: string;
  status: string;
  warning?: boolean;
  icon: string;
  phase?: string; // New: Growth phase from Guidance Engine
}

export const SpecimenRow: React.FC<SpecimenRowProps> = ({
  name,
  location,
  health,
  moisture,
  light,
  status,
  warning,
  icon,
  phase
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
        <View style={styles.titleInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{name}</Text>
            {phase && (
              <View style={styles.phaseBadge}>
                <Zap size={10} color="#4ade80" />
                <Text style={styles.phaseText}>{phase.toUpperCase()}</Text>
              </View>
            )}
          </View>
          <Text style={styles.location}>{location}</Text>
        </View>
      </View>

      <View style={styles.metrics}>
        <View style={styles.metricItem}>
          <View style={styles.metricLabelRow}>
            <Text style={styles.metricLabel}>Health</Text>
            <Text style={[styles.metricValue, warning ? styles.textWarning : styles.textSuccess]}>
              {health}%
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[
              styles.progressBarFill, 
              { width: `${health}%` },
              warning ? styles.bgWarning : styles.bgSuccess
            ]} />
          </View>
        </View>

        <View style={styles.metricItem}>
          <View style={styles.metricLabelRow}>
            <Text style={styles.metricLabel}>Moisture</Text>
            <Text style={[styles.metricValue, styles.textInfo]}>
              {moisture}%
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[
              styles.progressBarFill, 
              { width: `${moisture}%` },
              styles.bgInfo
            ]} />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.lightBadge}>
          <Text style={styles.lightLabel}>Light: </Text>
          <Text style={styles.lightValue}>{light}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          warning ? styles.statusBadgeWarning : styles.statusBadgeSuccess
        ]}>
          {warning && <AlertCircle size={12} color="#fb923c" style={{ marginRight: 4 }} />}
          <Text style={[
            styles.statusText,
            warning ? styles.textWarning : styles.textSuccess
          ]}>
            {status}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  titleInfo: {
    marginLeft: 12,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  phaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  phaseText: {
    color: '#4ade80',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  location: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 2,
  },
  metrics: {
    gap: 12,
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
  },
  metricLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 12,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 12,
  },
  lightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lightLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  lightValue: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusBadgeSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  statusBadgeWarning: {
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderColor: 'rgba(249, 115, 22, 0.2)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  textSuccess: {
    color: '#4ade80',
  },
  textWarning: {
    color: '#fb923c',
  },
  textInfo: {
    color: '#60a5fa',
  },
  bgSuccess: {
    backgroundColor: '#22c55e',
  },
  bgWarning: {
    backgroundColor: '#f97316',
  },
  bgInfo: {
    backgroundColor: '#3b82f6',
  },
});
