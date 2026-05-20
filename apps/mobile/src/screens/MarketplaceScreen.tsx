import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity, 
  Image,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ShoppingCart, Tag, Filter, Search, Zap, Star, ChevronRight, Sprout, Plus, Users } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  stock_quantity: number;
}

export function MarketplaceScreen({ navigation }: any) {
  const { user } = useAuth();
  const [officialProducts, setOfficialProducts] = useState<Product[]>([]);
  const [communityListings, setCommunityListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setCategory] = useState('All');
  const [activeSource, setActiveSource] = useState<'Official' | 'Community'>('Official');
  const { addToCart, totalItems } = useCart();

  const categories = ['All', 'Seeds', 'Tools', 'Hardware', 'Fertilizer'];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeSource === 'Official') {
        let query = supabase.from('products').select('*').order('created_at', { ascending: false });
        if (activeCategory !== 'All') {
          query = query.eq('category', activeCategory);
        }
        const { data, error } = await query;
        if (error) throw error;
        setOfficialProducts(data || []);
      } else {
        // Fetch Community P2P Listings
        let query = supabase.from('seed_listings')
          .select('*, profiles(username)')
          .eq('status', 'active')
          .order('created_at', { ascending: false });
        
        const { data, error } = await query;
        if (error) throw error;
        setCommunityListings(data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeCategory, activeSource]);

  const renderOfficialProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productCard}>
      <View style={styles.imageContainer}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.productImage} />
        ) : (
          <View style={styles.imagePlaceholder}><Tag size={32} color="rgba(255,255,255,0.1)" /></View>
        )}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
        
        <View style={styles.ratingRow}>
          <Star size={10} color="#fbbf24" fill="#fbbf24" />
          <Star size={10} color="#fbbf24" fill="#fbbf24" />
          <Star size={10} color="#fbbf24" fill="#fbbf24" />
          <Star size={10} color="#fbbf24" fill="#fbbf24" />
          <Text style={styles.stockText}>{item.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}</Text>
        </View>

        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={() => addToCart(item)}
        >
          <Zap size={14} color="#000" />
          <Text style={styles.addToCartText}>Acquire</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const handleSwapRequest = async (listing: any) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('swap_requests')
        .insert([
          {
            listing_id: listing.id,
            requester_id: user.id,
            notes: `Interested in trading for ${listing.name}.`,
          }
        ]);

      if (error) throw error;
      
      Alert.alert('Transmission Sent', 'Listing owner has been notified of your interest via neural link.');
    } catch (error: any) {
      console.error('Swap request failed:', error);
      Alert.alert('Link Error', 'Failed to establish connection with listing owner.');
    }
  };

  const renderCommunityListing = ({ item }: any) => (
    <TouchableOpacity style={styles.productCard}>
      <View style={styles.imageContainer}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.productImage} />
        ) : (
          <View style={styles.imagePlaceholder}><Sprout size={32} color="rgba(255,255,255,0.1)" /></View>
        )}
        <View style={[styles.categoryBadge, { backgroundColor: item.listing_type === 'swap' ? '#00AAFF' : '#4ade80' }]}>
          <Text style={styles.categoryText}>{item.listing_type.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.listingOwner}>@{item.profiles?.username || 'Gardener'}</Text>
        
        <View style={styles.ratingRow}>
          <Text style={[styles.stockText, { marginLeft: 0 }]}>{item.quantity_available} available</Text>
        </View>

        <TouchableOpacity 
          style={[styles.addToCartButton, { backgroundColor: '#00AAFF' }]}
          onPress={() => handleSwapRequest(item)}
        >
          <Users size={14} color="#fff" />
          <Text style={[styles.addToCartText, { color: '#fff' }]}>Request</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={['rgba(0, 255, 65, 0.03)', 'transparent']}
          style={[styles.gradientCircle, { top: -height * 0.1, left: -width * 0.2 }]}
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Marketplace</Text>
            <Text style={styles.subtitle}>Equipping your urban ecosystem.</Text>
          </View>
          <View style={styles.headerBtns}>
            {activeSource === 'Community' && (
              <TouchableOpacity 
                style={styles.listSeedsBtn}
                onPress={() => navigation.navigate('CreateListing')}
              >
                <Plus size={20} color="#000" />
                <Text style={styles.listSeedsBtnText}>List</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.cartButton}
              onPress={() => navigation.navigate('Checkout')}
            >
              <ShoppingCart size={24} color="#fff" />
              {totalItems > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{totalItems}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchBar}>
          <Search size={18} color="#475569" />
          <Text style={styles.searchPlaceholder}>Search supplies...</Text>
        </View>

        <View style={styles.categoryContainer}>
          {/* Source Switcher */}
          <View style={styles.sourceSwitcher}>
            <TouchableOpacity 
              style={[styles.sourceButton, activeSource === 'Official' && styles.sourceButtonActive]}
              onPress={() => setActiveSource('Official')}
            >
              <Text style={[styles.sourceText, activeSource === 'Official' && styles.sourceTextActive]}>GroSphere Store</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.sourceButton, activeSource === 'Community' && styles.sourceButtonActive]}
              onPress={() => setActiveSource('Community')}
            >
              <Text style={[styles.sourceText, activeSource === 'Community' && styles.sourceTextActive]}>Community Swap</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {categories.map((cat) => (
              <TouchableOpacity 
                key={cat} 
                style={[styles.categoryButton, activeCategory === cat && styles.categoryButtonActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.categoryButtonText, activeCategory === cat && styles.categoryButtonTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00FF41" />
          </View>
        ) : (
          <FlatList
            data={activeSource === 'Official' ? officialProducts : communityListings}
            keyExtractor={(item) => item.id}
            renderItem={activeSource === 'Official' ? renderOfficialProduct : renderCommunityListing}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.columnWrapper}
            showsVerticalScrollIndicator={false}
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
    paddingVertical: 20,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  headerBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listSeedsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00AAFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  listSeedsBtnText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  cartButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#00FF41',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '900',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  searchPlaceholder: {
    color: '#475569',
    fontSize: 14,
  },
  categoryContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  categoryScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  categoryButtonActive: {
    backgroundColor: 'rgba(0, 255, 65, 0.1)',
    borderColor: 'rgba(0, 255, 65, 0.3)',
  },
  categoryButtonText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: '#00FF41',
  },
  sourceSwitcher: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  sourceButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  sourceButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  sourceText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sourceTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 14,
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    gap: 12,
  },
  productCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 12,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#000',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  categoryText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listingOwner: {
    color: '#00AAFF',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  productPrice: {
    color: '#00FF41',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 8,
  },
  stockText: {
    color: '#475569',
    fontSize: 9,
    marginLeft: 6,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 8,
    marginTop: 12,
    gap: 6,
  },
  addToCartText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
