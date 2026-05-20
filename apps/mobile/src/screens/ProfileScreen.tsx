import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { UserCircle2, Settings, Shield, Bell, ChevronRight, Award, Users as UsersIcon, Zap } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const { width, height } = Dimensions.get('window');

export function ProfileScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<{ followers: number; following: number; badges: any[] }>({ 
    followers: 0, 
    following: 0, 
    badges: [] 
  });

  useEffect(() => {
    const fetchSocialStats = async () => {
      if (!user) return;
      
      const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', user.id);

      const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', user.id);

      const { data: badges } = await supabase
        .from('user_badges')
        .select('*, badges(*)')
        .eq('user_id', user.id);

      setStats({
        followers: followersCount || 0,
        following: followingCount || 0,
        badges: badges || []
      });
    };

    fetchSocialStats();
  }, [user]);

  return (
    <View style={styles.container}>
      {/* Cinematic Background */}
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.05)', 'transparent']}
          style={[styles.gradientCircle, { top: -height * 0.2, right: -width * 0.1 }]}
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>User Profile</Text>
            <TouchableOpacity style={styles.settingsButton}>
              <Settings size={22} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <UserCircle2 size={80} color="rgba(0, 255, 65, 0.2)" />
            </View>
            <Text style={styles.userName}>{user?.user_metadata?.username || 'Senior Gardener'}</Text>
            <Text style={styles.userStatus}>{user?.email}</Text>
          </View>

          <View style={styles.socialStatsRow}>
            <View style={styles.socialStat}>
              <Text style={styles.socialStatValue}>{stats.followers}</Text>
              <Text style={styles.socialStatLabel}>Followers</Text>
            </View>
            <View style={styles.socialStat}>
              <Text style={styles.socialStatValue}>{stats.following}</Text>
              <Text style={styles.socialStatLabel}>Following</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Plants</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>84</Text>
              <Text style={styles.statLabel}>Logs</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>98%</Text>
              <Text style={styles.statLabel}>Health</Text>
            </View>
          </View>

          {/* Badges Section */}
          <View style={styles.sectionHeader}>
            <Award size={18} color="#00FF41" />
            <Text style={styles.sectionTitle}>Achievements</Text>
          </View>
          <View style={styles.badgesGrid}>
            {stats.badges.length > 0 ? stats.badges.map((ub: any) => (
              <View key={ub.badge_id} style={styles.badgeIcon}>
                <Zap size={24} color="#00FF41" />
              </View>
            )) : (
              <View style={styles.emptyBadges}>
                <Text style={styles.emptyBadgesText}>No achievements unlocked yet.</Text>
              </View>
            )}
          </View>

          <View style={styles.menuSection}>
            <MenuButton 
              icon={<UsersIcon size={20} color="#f472b6" />} 
              label="Community Network" 
              onPress={() => navigation.navigate('Network')}
            />
            <MenuButton 
              icon={<Bell size={20} color="#00AAFF" />} 
              label="Notifications" 
              onPress={() => navigation.navigate('Notifications')}
            />
            <MenuButton icon={<Shield size={20} color="#00FF41" />} label="Security & Privacy" />
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={() => signOut()}>
            <Text style={styles.logoutText}>Terminate Session</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function MenuButton({ icon, label, onPress }: any) {
  return (
    <TouchableOpacity style={styles.menuButton} onPress={onPress}>
      <View style={styles.menuIconLabel}>
        {icon}
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <ChevronRight size={18} color="rgba(255, 255, 255, 0.2)" />
    </TouchableOpacity>
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
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  userName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  userStatus: {
    color: '#00FF41',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  socialStatsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 32,
  },
  socialStat: {
    alignItems: 'center',
  },
  socialStatValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  socialStatLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 40,
    paddingHorizontal: 4,
  },
  badgeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 255, 65, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 65, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBadges: {
    width: '100%',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emptyBadgesText: {
    color: '#475569',
    fontSize: 12,
    fontStyle: 'italic',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignSelf: 'center',
  },
  menuSection: {
    gap: 12,
    marginBottom: 40,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuIconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuLabel: {
    color: '#cbd5e1',
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
