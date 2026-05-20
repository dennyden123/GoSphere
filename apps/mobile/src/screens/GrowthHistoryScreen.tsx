import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { 
  ChevronLeft, 
  Activity, 
  Droplets, 
  Sun, 
  Thermometer,
  Zap,
  RefreshCcw
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import { supabase } from '../lib/supabase';
import { Card } from '../components/Card';

const { width } = Dimensions.get('window');

interface GrowthHistoryScreenProps {
  route: any;
  navigation: any;
}

interface TelemetryData {
  time: string;
  value: number;
}

export function GrowthHistoryScreen({ route, navigation }: GrowthHistoryScreenProps) {
  const { specimenId, specimenName } = route.params;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [telemetry, setTelemetry] = useState<Record<string, TelemetryData[]>>({
    soil_moisture: [],
    light_lux: [],
    temperature: []
  });

  useEffect(() => {
    fetchHistory();
  }, [specimenId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('hardware_telemetry')
        .select('sensor_type, reading_value, recorded_at')
        .eq('user_garden_id', specimenId)
        .order('recorded_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      const grouped: Record<string, TelemetryData[]> = {
        soil_moisture: [],
        light_lux: [],
        temperature: []
      };

      data.forEach((item: any) => {
        if (grouped[item.sensor_type]) {
          grouped[item.sensor_type].push({
            time: new Date(item.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            value: parseFloat(item.reading_value)
          });
        }
      });

      setTelemetry(grouped);
    } catch (e) {
      console.error('Error fetching telemetry history:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderChart = (type: string, title: string, color: string, icon: React.ReactNode, unit: string) => {
    const data = telemetry[type] || [];
    
    // Fallback if no data
    if (data.length === 0) {
      return (
        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}10`, borderColor: `${color}20` }]}>
              {icon}
            </View>
            <Text style={styles.chartTitle}>{title}</Text>
          </View>
          <View style={styles.emptyChart}>
            <Activity size={24} color="#475569" />
            <Text style={styles.emptyText}>Waiting for sensor broadcast...</Text>
          </View>
        </Card>
      );
    }

    // Limit to last 10 points for the chart display to keep it clean
    const chartData = data.slice(-8);

    return (
      <Card style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View style={[styles.iconContainer, { backgroundColor: `${color}10`, borderColor: `${color}20` }]}>
            {icon}
          </View>
          <View>
            <Text style={styles.chartTitle}>{title}</Text>
            <Text style={styles.chartSubtitle}>Last 8 transmissions</Text>
          </View>
          <View style={styles.currentValueContainer}>
            <Text style={[styles.currentValue, { color }]}>{chartData[chartData.length - 1].value}{unit}</Text>
          </View>
        </View>

        <LineChart
          data={{
            labels: chartData.map(d => d.time),
            datasets: [{ data: chartData.map(d => d.value) }]
          }}
          width={width - 72}
          height={180}
          chartConfig={{
            backgroundColor: '#000',
            backgroundGradientFrom: 'rgba(0,0,0,0)',
            backgroundGradientTo: 'rgba(0,0,0,0)',
            decimalPlaces: 1,
            color: (opacity = 1) => color,
            labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: {
              r: "4",
              strokeWidth: "2",
              stroke: color
            },
            propsForBackgroundLines: {
              strokeDasharray: "", // solid background lines
              stroke: "rgba(255, 255, 255, 0.05)"
            }
          }}
          bezier
          style={styles.chart}
          withHorizontalLines={true}
          withVerticalLines={false}
          withDots={true}
          withShadow={true}
          withScrollableDot={false}
        />
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={['rgba(30, 41, 59, 0.5)', 'transparent']}
          style={styles.gradient}
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <View style={styles.systemStatus}>
              <Zap size={10} color="#4ade80" />
              <Text style={styles.systemText}>ANALYTICS ENGINE V2.0</Text>
            </View>
            <Text style={styles.title}>{specimenName || 'Specimen'} History</Text>
          </View>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={() => {
              setRefreshing(true);
              fetchHistory();
            }}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color="#4ade80" />
            ) : (
              <RefreshCcw size={20} color="#94a3b8" />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loading && !refreshing ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#4ade80" />
              <Text style={styles.loaderText}>Decrypting Telemetry Stream...</Text>
            </View>
          ) : (
            <>
              <View style={styles.insightSummary}>
                <Card style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Growth Velocity</Text>
                  <Text style={styles.summaryValue}>+12.4%</Text>
                  <Text style={styles.summaryTrend}>vs last period</Text>
                </Card>
                <Card style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Vitality Score</Text>
                  <Text style={styles.summaryValue}>Optimal</Text>
                  <Text style={[styles.summaryTrend, { color: '#4ade80' }]}>98/100</Text>
                </Card>
              </View>

              {renderChart('soil_moisture', 'Soil Moisture', '#60a5fa', <Droplets size={20} color="#60a5fa" />, '%')}
              {renderChart('light_lux', 'Light Intensity', '#fbbf24', <Sun size={20} color="#fbbf24" />, 'lx')}
              {renderChart('temperature', 'Ambient Temp', '#f87171', <Thermometer size={20} color="#f87171" />, '°C')}
              
              <View style={styles.aiInsightCard}>
                <LinearGradient
                  colors={['rgba(74, 222, 128, 0.1)', 'rgba(74, 222, 128, 0.02)']}
                  style={styles.aiInsightGradient}
                >
                  <View style={styles.aiHeader}>
                    <Activity size={16} color="#4ade80" />
                    <Text style={styles.aiTitle}>AI PROJECTION</Text>
                  </View>
                  <Text style={styles.aiText}>
                    Based on current telemetry trends, this specimen is expected to reach its next growth phase in 4.2 days. Moisture levels are fluctuating within optimal parameters.
                  </Text>
                </LinearGradient>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050A10',
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: Platform.OS === 'android' ? 40 : 0,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 15,
  },
  systemStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  systemText: {
    color: '#4ade80',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  refreshButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  loaderContainer: {
    height: 400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    color: '#94a3b8',
    marginTop: 16,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  insightSummary: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  summaryLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginVertical: 4,
  },
  summaryTrend: {
    color: '#94a3b8',
    fontSize: 10,
  },
  chartCard: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  chartTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  chartSubtitle: {
    color: '#475569',
    fontSize: 10,
    marginTop: 1,
  },
  currentValueContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  currentValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    marginLeft: -16, // Align labels better
  },
  emptyChart: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    color: '#475569',
    fontSize: 12,
    fontStyle: 'italic',
  },
  aiInsightCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.2)',
    marginTop: 8,
  },
  aiInsightGradient: {
    padding: 16,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  aiTitle: {
    color: '#4ade80',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  aiText: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 20,
  },
});
