import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Bell, 
  Zap, 
  Heart, 
  UserPlus, 
  Award, 
  ShieldAlert,
  X,
  ChevronRight
} from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

interface AppNotification {
  id: string;
  type: 'like' | 'follow' | 'system_alert' | 'achievement';
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
  data?: any;
}

export function NotificationScreen({ navigation }: any) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Realtime subscription
    const channel = supabase
      .channel(`public:notifications:user=${user?.id}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user?.id}`
        },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart size={18} color="#f472b6" />;
      case 'follow': return <UserPlus size={18} color="#00AAFF" />;
      case 'achievement': return <Award size={18} color="#fbbf24" />;
      default: return <ShieldAlert size={18} color="#ef4444" />;
    }
  };

  const renderNotification = ({ item }: { item: AppNotification }) => (
    <TouchableOpacity 
      style={[styles.notificationCard, !item.is_read && styles.unreadCard]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${getColor(item.type)}20` }]}>
        {getIcon(item.type)}
      </View>
      
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.notifTitle}>{item.title}</Text>
          {!item.is_read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notifBody}>{item.body}</Text>
        <Text style={styles.timestamp}>{new Date(item.created_at).toLocaleTimeString()}</Text>
      </View>
      
      <ChevronRight size={16} color="rgba(255, 255, 255, 0.1)" />
    </TouchableOpacity>
  );

  const getColor = (type: string) => {
    switch (type) {
      case 'like': return '#f472b6';
      case 'follow': return '#00AAFF';
      case 'achievement': return '#fbbf24';
      default: return '#ef4444';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={['rgba(239, 68, 68, 0.05)', 'transparent']}
          style={[styles.gradientCircle, { top: -height * 0.1, right: -width * 0.2 }]}
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <X size={24} color="#94a3b8" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Bell size={18} color="#00FF41" />
            <Text style={styles.headerTitle}>System Alerts</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00FF41" />
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={renderNotification}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl 
                refreshing={isRefreshing} 
                onRefresh={() => { setIsRefreshing(true); fetchNotifications(); }} 
                tintColor="#00FF41" 
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Zap size={48} color="rgba(255, 255, 255, 0.05)" />
                <Text style={styles.emptyText}>Neural link quiet. No active alerts in this sector.</Text>
              </View>
            }
          />
        )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  placeholder: {
    width: 24,
  },
  listContent: {
    padding: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  unreadCard: {
    backgroundColor: 'rgba(0, 255, 65, 0.03)',
    borderColor: 'rgba(0, 255, 65, 0.1)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notifTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FF41',
  },
  notifBody: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  timestamp: {
    color: '#475569',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height * 0.2,
    gap: 16,
  },
  emptyText: {
    color: '#475569',
    textAlign: 'center',
    paddingHorizontal: 40,
    fontSize: 14,
  },
});
