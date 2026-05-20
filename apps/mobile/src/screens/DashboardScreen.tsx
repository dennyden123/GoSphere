import React, { useEffect, useState, useMemo, memo } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { 
  Zap, 
  Plus, 
  Activity, 
  Sprout, 
  Droplets, 
  Wind,
  ChevronRight,
  Cpu,
  Scan,
  Clock,
  CloudRain,
  Sun,
  Users,
  MessageSquare,
  Network
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import withObservables from '@nozbe/with-observables';
import { database } from '../database';
import UserGarden from '../database/models/UserGarden';
import GardenLog from '../database/models/GardenLog';
import { useWeather } from '../hooks/useWeather';
import { registerForPushNotificationsAsync, scheduleWateringReminders } from '../lib/notifications';
import { useTranslation } from 'react-i18next';

import { TelemetryCard } from '../components/TelemetryCard';
import { SpecimenRow } from '../components/SpecimenRow';
import { Card } from '../components/Card';

const { width, height } = Dimensions.get('window');

import { supabase } from '../lib/supabase';

interface DashboardScreenProps {
  activeSpecimens: UserGarden[];
  recentLogs: GardenLog[];
  navigation: any;
}

const DashboardScreenBase = memo(({ activeSpecimens, recentLogs, navigation }: DashboardScreenProps) => {
  const { t } = useTranslation();
  const { weather, isLoading: isWeatherLoading } = useWeather();
  const [liveTelemetry, setLiveTelemetry] = useState<Record<string, { moisture?: number; light?: number }>>({});
  const [latestPost, setLatestPost] = useState<any>(null);
  
  const healthStats = useMemo(() => {
    const healthyCount = activeSpecimens.filter(s => s.status === 'Healthy').length;
    const percentage = activeSpecimens.length > 0 
      ? ((healthyCount / activeSpecimens.length) * 100).toFixed(1) 
      : "100";
    return { healthyCount, percentage };
  }, [activeSpecimens]);

  useEffect(() => {
    registerForPushNotificationsAsync();
    fetchSocialSnapshot();
  }, []);

  const fetchSocialSnapshot = async () => {
    try {
      const { data } = await supabase
        .from('social_posts')
        .select('*, profiles(username)')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (data) setLatestPost(data);
    } catch (e) {
      console.log('Error fetching social snapshot:', e);
    }
  };

  useEffect(() => {
    if (activeSpecimens.length > 0) {
      scheduleWateringReminders(activeSpecimens, weather);
    }
  }, [activeSpecimens, weather]);

  useEffect(() => {
    // Subscribe to IoT hardware telemetry
    const channel = supabase
      .channel('public:hardware_telemetry')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'hardware_telemetry' },
        (payload) => {
          const { user_garden_id, sensor_type, reading_value } = payload.new;
          setLiveTelemetry(prev => ({
            ...prev,
            [user_garden_id]: {
              ...prev[user_garden_id],
              [sensor_type === 'soil_moisture' ? 'moisture' : 'light']: reading_value
            }
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Cinematic Background Gradients */}
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={['rgba(6, 78, 59, 0.4)', 'transparent']}
          style={[styles.gradientCircle, { top: -height * 0.1, left: -width * 0.1 }]}
        />
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.2)', 'transparent']}
          style={[styles.gradientCircle, { top: height * 0.4, right: -width * 0.2, width: width * 1.2, height: width * 1.2 }]}
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.systemStatus}>
              <Zap size={14} color="#4ade80" />
              <Text style={styles.systemText}>{t('common.system_online')} • GROSPHERE CORE</Text>
            </View>
            <Text style={styles.title}>{t('common.mission_control')}</Text>
            <Text style={styles.subtitle}>{t('dashboard.subtitle')}</Text>
            
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('ARGuide', { specimenId: activeSpecimens[0]?.id })}
              >
                <Zap size={18} color="#4ade80" style={{ marginRight: 8 }} />
                <Text style={styles.secondaryButtonText}>{t('common.ar_guidance')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('Scan')}
              >
                <Scan size={18} color="#4ade80" style={{ marginRight: 8 }} />
                <Text style={styles.secondaryButtonText}>{t('common.ai_scanner')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Telemetry Grid */}
          <View style={styles.telemetryGrid}>
            <View style={styles.telemetryRow}>
              <TelemetryCard 
                title="Ecosystem Health" 
                value={`${healthStats.percentage}%`} 
                trend={activeSpecimens.length > 0 ? "Stable" : "Idle"} 
                icon={<Activity size={20} color="#34d399" />} 
                status={Number(healthStats.percentage) > 90 ? "optimal" : "warning"}
              />
              <TelemetryCard 
                title={t('common.active_flora')} 
                value={activeSpecimens.length.toString()} 
                trend="Live" 
                icon={<Sprout size={20} color="#4ade80" />} 
                status="optimal"
              />
            </View>
            <View style={styles.telemetryRow}>
              <TelemetryCard 
                title={t('common.recent_activity')} 
                value={recentLogs.length.toString()} 
                trend="24h" 
                icon={<Clock size={20} color="#60a5fa" />} 
                status="neutral"
              />
              <TelemetryCard 
                title="CO₂ Offset" 
                value={(activeSpecimens.length * 2.5).toFixed(1) + "kg"} 
                trend="est." 
                icon={<Wind size={20} color="#2dd4bf" />} 
                status="optimal"
              />
            </View>
          </View>

          {/* Active Specimens Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('dashboard.primary_specimens')}</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={16} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {activeSpecimens.slice(0, 3).map((specimen, idx) => {
            const telemetry = liveTelemetry[specimen.id];
            const displayMoisture = telemetry?.moisture ?? (specimen.status === 'Healthy' ? 45 : 22);
            
            return (
              <TouchableOpacity 
                key={specimen.id}
                onPress={() => navigation.navigate('GrowthHistory', { 
                  specimenId: specimen.id,
                  specimenName: specimen.customName 
                })}
              >
                <SpecimenRow 
                  name={specimen.customName} 
                  location={specimen.location || "Main Sector"}
                  health={specimen.status === 'Healthy' ? 98 : 65}
                  moisture={displayMoisture}
                  light="Optimized"
                  status={specimen.status}
                  warning={specimen.status !== 'Healthy' || displayMoisture < 30}
                  icon={idx % 2 === 0 ? "🌿" : "🌱"}
                />
              </TouchableOpacity>
            );
          })}

          {activeSpecimens.length === 0 && (
            <View style={styles.emptySpecimens}>
              <Text style={styles.emptyText}>{t('dashboard.no_telemetry')}</Text>
            </View>
          )}

          {/* Recent Activity Section */}
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <Text style={styles.sectionTitle}>{t('common.recent_activity')}</Text>
          </View>

          <Card style={styles.activityCard}>
            {recentLogs.length > 0 ? (
              recentLogs.slice(0, 5).map((log, idx) => (
                <View key={log.id} style={[styles.logItem, idx === recentLogs.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={styles.logIcon}>
                    <Droplets size={16} color="#60a5fa" />
                  </View>
                  <View style={styles.logContent}>
                    <Text style={styles.logTitle}>{log.activityType}</Text>
                    <Text style={styles.logDate}>{new Date(log.logDate).toLocaleTimeString()}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No recent activity logs.</Text>
            )}
          </Card>

          {/* Interactive Widgets Row */}
          <View style={styles.telemetryRow}>
            {/* IoT Quick View */}
            <Card style={styles.widgetCard}>
              <View style={styles.widgetHeader}>
                <Network size={16} color="#00AAFF" />
                <Text style={styles.widgetTitle}>IoT Nodes</Text>
              </View>
              <View style={styles.iotStats}>
                <View style={styles.iotStatItem}>
                  <Text style={styles.iotStatValue}>04</Text>
                  <Text style={styles.iotStatLabel}>Active</Text>
                </View>
                <View style={styles.iotStatDivider} />
                <View style={styles.iotStatItem}>
                  <Text style={styles.iotStatValue}>99%</Text>
                  <Text style={styles.iotStatLabel}>Signal</Text>
                </View>
              </View>
            </Card>

            {/* Social Snapshot */}
            <TouchableOpacity 
              style={[styles.widgetCard, styles.socialWidget]}
              onPress={() => navigation.navigate('Community')}
            >
              <View style={styles.widgetHeader}>
                <Users size={16} color="#f472b6" />
                <Text style={styles.widgetTitle}>Global Feed</Text>
              </View>
              {latestPost ? (
                <View style={styles.socialPreview}>
                  <Text style={styles.socialUsername} numberOfLines={1}>
                    @{latestPost.profiles.username}
                  </Text>
                  <Text style={styles.socialContent} numberOfLines={2}>
                    {latestPost.content}
                  </Text>
                </View>
              ) : (
                <View style={styles.socialEmpty}>
                  <MessageSquare size={14} color="#475569" />
                  <Text style={styles.socialEmptyText}>No signals...</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* AI Copilot Card */}
          <Card style={styles.copilotCard}>
            <View style={styles.copilotHeader}>
              <View style={styles.copilotIconContainer}>
                {weather?.isRainy ? (
                  <CloudRain size={24} color="#60a5fa" />
                ) : (
                  <Sun size={24} color="#fbbf24" />
                )}
              </View>
              <View>
                <Text style={styles.copilotTitle}>{t('dashboard.copilot_title')}</Text>
                <View style={styles.copilotStatus}>
                  <View style={[styles.pulseDot, isWeatherLoading && { backgroundColor: '#94a3b8' }]} />
                  <Text style={styles.copilotStatusText}>
                    {isWeatherLoading ? t('dashboard.copilot_status_sync') : t('dashboard.copilot_status_online')}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.copilotMessage}>
              <Text style={styles.copilotText}>
                {isWeatherLoading ? (
                  <ActivityIndicator size="small" color="#4ade80" />
                ) : (
                  <>
                    <Text style={styles.highlight}>Analysis complete:</Text> {weather?.isRainy 
                      ? `Heavy rain detected (${weather.precipitation}mm). I have paused all automated watering schedules to prevent over-hydration.`
                      : `Conditions are optimal (${weather?.currentTemp}°C). I have scheduled watering reminders for tomorrow at 09:00.`
                    }
                  </>
                )}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.copilotButton}
              onPress={() => navigation.navigate('Chat')}
            >
              <Text style={styles.copilotButtonText}>{t('common.open_intelligence')}</Text>
            </TouchableOpacity>
          </Card>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  gradientCircle: {
    position: 'absolute',
    width: width,
    height: width,
    borderRadius: width / 2,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
    marginTop: Platform.OS === 'android' ? 40 : 10,
  },
  systemStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  systemText: {
    color: '#4ade80',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginLeft: 6,
  },
  title: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -1,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 16,
    marginTop: 8,
    lineHeight: 22,
  },
  headerActions: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#22c55e',
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 15,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  telemetryGrid: {
    gap: 12,
    marginBottom: 32,
  },
  telemetryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: '#94a3b8',
    fontSize: 14,
    marginRight: 4,
  },
  emptySpecimens: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  emptyText: {
    color: '#475569',
    fontSize: 14,
  },
  activityCard: {
    padding: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    overflow: 'hidden',
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  logIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logContent: {
    flex: 1,
  },
  logTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  logDate: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  copilotCard: {
    padding: 20,
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  widgetCard: {
    flex: 1,
    padding: 16,
    minHeight: 110,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  widgetTitle: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  iotStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iotStatItem: {
    alignItems: 'center',
  },
  iotStatValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  iotStatLabel: {
    color: '#475569',
    fontSize: 9,
    marginTop: 2,
  },
  iotStatDivider: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  socialWidget: {
    borderWidth: 1,
    borderColor: 'rgba(244, 114, 182, 0.1)',
  },
  socialPreview: {
    marginTop: 2,
  },
  socialUsername: {
    color: '#f472b6',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  socialContent: {
    color: '#cbd5e1',
    fontSize: 11,
    lineHeight: 15,
    fontStyle: 'italic',
  },
  socialEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  socialEmptyText: {
    color: '#475569',
    fontSize: 10,
    fontStyle: 'italic',
  },
  copilotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  copilotIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  copilotTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  copilotStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
    marginRight: 6,
  },
  copilotStatusText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  copilotMessage: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  copilotText: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
  },
  highlight: {
    color: '#4ade80',
    fontWeight: '600',
  },
  copilotButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  copilotButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

const enhance = withObservables([], () => ({
  activeSpecimens: database.get<UserGarden>('user_gardens').query().observe(),
  recentLogs: database.get<GardenLog>('garden_logs').query().observe(),
}));

export const DashboardScreen = enhance(DashboardScreenBase);
