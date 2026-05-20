import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Dimensions,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Search, 
  Users, 
  UserPlus, 
  UserMinus, 
  X,
  ChevronLeft,
  UserCircle2,
  Zap
} from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

interface Profile {
  id: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  is_following?: boolean;
}

export function NetworkScreen({ navigation }: any) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFollowingMap, setIsFollowingMap] = useState<Record<string, boolean>>({});

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setProfiles([]);
      return;
    }

    setIsLoading(true);
    try {
      // 1. Fetch profiles matching query
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${query}%`)
        .neq('id', user?.id) // Don't show current user
        .limit(20);

      if (profileError) throw profileError;

      // 2. Check which ones the current user is already following
      if (profileData && profileData.length > 0) {
        const profileIds = profileData.map(p => p.id);
        const { data: followData, error: followError } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user?.id)
          .in('following_id', profileIds);

        if (followError) throw followError;

        const followingSet = new Set(followData?.map(f => f.following_id));
        const newFollowingMap: Record<string, boolean> = {};
        
        const enhancedProfiles = profileData.map(p => {
          const isFollowing = followingSet.has(p.id);
          newFollowingMap[p.id] = isFollowing;
          return { ...p, is_following: isFollowing };
        });

        setIsFollowingMap(newFollowingMap);
        setProfiles(enhancedProfiles);
      } else {
        setProfiles([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchQuery);
    }, 500); // Debounce search

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleFollow = async (targetUserId: string) => {
    const currentlyFollowing = isFollowingMap[targetUserId];
    
    // Optimistic UI update
    setIsFollowingMap(prev => ({ ...prev, [targetUserId]: !currentlyFollowing }));

    try {
      if (currentlyFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .match({ follower_id: user?.id, following_id: targetUserId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('follows')
          .insert([{ follower_id: user?.id, following_id: targetUserId }]);
        if (error) throw error;
      }
    } catch (error) {
      console.error('Follow toggle failed:', error);
      // Revert optimistic update
      setIsFollowingMap(prev => ({ ...prev, [targetUserId]: currentlyFollowing }));
      Alert.alert('Link Error', 'Failed to update neural garden connection.');
    }
  };

  const renderProfile = ({ item }: { item: Profile }) => {
    const isFollowing = isFollowingMap[item.id];
    
    return (
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <UserCircle2 size={40} color="rgba(255, 255, 255, 0.1)" />
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={styles.username}>{item.username || 'Anonymous Gardener'}</Text>
          <Text style={styles.bio} numberOfLines={1}>{item.bio || 'Synthesizing ecosystem data...'}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.followButton, isFollowing && styles.followingButton]}
          onPress={() => toggleFollow(item.id)}
        >
          {isFollowing ? (
            <UserMinus size={18} color="#94a3b8" />
          ) : (
            <UserPlus size={18} color="#000" />
          )}
          <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
            {isFollowing ? 'Unlink' : 'Link'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={['rgba(0, 170, 255, 0.05)', 'transparent']}
          style={[styles.gradientCircle, { top: -height * 0.1, right: -width * 0.2 }]}
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.searchContainer}>
            <Search size={18} color="#475569" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="SEARCH GARDENER NETWORK..."
              placeholderTextColor="#475569"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={18} color="#475569" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00AAFF" />
            <Text style={styles.loadingText}>SCANNING FREQUENCIES...</Text>
          </View>
        ) : (
          <FlatList
            data={profiles}
            keyExtractor={(item) => item.id}
            renderItem={renderProfile}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              searchQuery.length > 0 ? (
                <View style={styles.emptyState}>
                  <Zap size={48} color="rgba(255, 255, 255, 0.05)" />
                  <Text style={styles.emptyText}>No signals matching this identification code.</Text>
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Users size={48} color="rgba(0, 170, 255, 0.1)" />
                  <Text style={styles.emptyText}>Enter a username to establish a new garden link.</Text>
                </View>
              )
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flex: 1,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  listContent: {
    padding: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  bio: {
    color: '#64748b',
    fontSize: 12,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00AAFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    gap: 6,
  },
  followingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  followButtonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
  },
  followingButtonText: {
    color: '#94a3b8',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#00AAFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
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
    lineHeight: 20,
  },
});
