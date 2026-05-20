import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card'; // We'll create this next

interface TelemetryCardProps {
  title: string;
  value: string;
  trend: string;
  icon: React.ReactNode;
  status?: 'optimal' | 'warning' | 'neutral';
}

export const TelemetryCard: React.FC<TelemetryCardProps> = ({ 
  title, 
  value, 
  trend, 
  icon, 
  status = 'neutral' 
}) => {
  const isWarning = status === 'warning';
  
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <View style={[
          styles.badge, 
          isWarning ? styles.badgeWarning : styles.badgeNeutral
        ]}>
          <Text style={[
            styles.badgeText,
            isWarning ? styles.textWarning : styles.textNeutral
          ]}>
            {trend}
          </Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeNeutral: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  badgeWarning: {
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'System', // Fallback for monospace if needed
  },
  textNeutral: {
    color: '#94a3b8',
  },
  textWarning: {
    color: '#fb923c',
  },
  content: {
    marginTop: 'auto',
  },
  title: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  value: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
});
