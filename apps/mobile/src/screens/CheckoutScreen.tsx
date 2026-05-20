import React, { useState } from 'react';
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
  Alert,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Trash2, CreditCard, ShieldCheck, Zap, ChevronLeft } from 'lucide-react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const { width, height } = Dimensions.get('window');

export function CheckoutScreen({ navigation }: any) {
  const { user } = useAuth();
  const { cart, totalAmount, removeFromCart, clearCart } = useCart();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initializePayment = async () => {
    try {
      // 1. Fetch Payment Intent client secret from Edge Function
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: { amount: Math.round(totalAmount * 100) } // Stripe expects amounts in cents
      });

      if (error || !data) throw new Error(error?.message || 'Failed to initialize payment');

      const { paymentIntent } = data;

      // 2. Initialize the Payment Sheet
      const { error: sheetError } = await initPaymentSheet({
        merchantDisplayName: 'GroSphere Urban Gardening',
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: user?.user_metadata?.username || '',
          email: user?.email || '',
        }
      });

      if (sheetError) throw new Error(sheetError.message);

      return true;
    } catch (e: any) {
      console.error('Payment initialization failed:', e);
      Alert.alert('Payment Error', `Could not initialize secure link: ${e.message}`);
      return false;
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    setIsSubmitting(true);
    try {
      // 1. Initialize Stripe Payment Sheet
      const isInitialized = await initializePayment();
      if (!isInitialized) {
        setIsSubmitting(false);
        return;
      }

      // 2. Present the Payment Sheet
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        if (paymentError.code !== 'Canceled') {
          Alert.alert('Payment Failed', paymentError.message);
        }
        setIsSubmitting(false);
        return;
      }

      // 3. Payment Successful - Persist Order to Database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user?.id,
            total_amount: totalAmount,
            status: 'paid',
          }
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Clear cart and notify
      clearCart();
      Alert.alert(
        'Transaction Finalized',
        'Your acquisition has been confirmed. Supplies are being dispatched to your sector.',
        [{ text: 'Acknowledged', onPress: () => navigation.navigate('Main') }]
      );
    } catch (error: any) {
      console.error('Order failed:', error);
      Alert.alert('System Error', `Failed to finalize transaction: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image_url }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>${item.price.toFixed(2)} x {item.quantity}</Text>
      </View>
      <TouchableOpacity onPress={() => removeFromCart(item.id)}>
        <Trash2 size={20} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={['rgba(0, 255, 65, 0.05)', 'transparent']}
          style={[styles.gradientCircle, { top: -height * 0.1, right: -width * 0.2 }]}
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Review</Text>
          <View style={{ width: 24 }} />
        </View>

        {cart.length > 0 ? (
          <>
            <FlatList
              data={cart}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
            />

            <View style={styles.footer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>${totalAmount.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Logistics</Text>
                <Text style={styles.summaryValue}>$0.00 (CREDIT)</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>TOTAL ACQUISITION COST</Text>
                <Text style={styles.totalValue}>${totalAmount.toFixed(2)}</Text>
              </View>

              <TouchableOpacity 
                style={[styles.placeOrderButton, isSubmitting && styles.disabledButton]}
                onPress={handlePlaceOrder}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <>
                    <ShieldCheck size={20} color="#000" />
                    <Text style={styles.placeOrderText}>Finalize Acquisition</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <View style={styles.securityNote}>
                <CreditCard size={12} color="#475569" />
                <Text style={styles.securityText}>SECURE NEURAL ENCRYPTION ACTIVE</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Zap size={48} color="rgba(0, 255, 65, 0.1)" />
            <Text style={styles.emptyText}>Acquisition buffer is currently empty.</Text>
            <TouchableOpacity 
              style={styles.returnButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.returnButtonText}>Return to Marketplace</Text>
            </TouchableOpacity>
          </View>
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
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  listContent: {
    padding: 20,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  itemPrice: {
    color: '#00FF41',
    fontSize: 14,
    marginTop: 4,
  },
  footer: {
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#94a3b8',
    fontSize: 14,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 14,
  },
  totalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 24,
  },
  totalLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  totalValue: {
    color: '#00FF41',
    fontSize: 20,
    fontWeight: '800',
  },
  placeOrderButton: {
    backgroundColor: '#00FF41',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  placeOrderText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  disabledButton: {
    opacity: 0.5,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 6,
  },
  securityText: {
    color: '#475569',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
    fontStyle: 'italic',
  },
  returnButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 65, 0.3)',
    backgroundColor: 'rgba(0, 255, 65, 0.05)',
  },
  returnButtonText: {
    color: '#00FF41',
    fontSize: 14,
    fontWeight: '600',
  },
});
