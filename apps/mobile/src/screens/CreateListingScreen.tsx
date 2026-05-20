import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity, 
  Image,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Camera, Image as ImageIcon, Send, Zap, Tag, Sprout, Layers } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

export function CreateListingScreen({ navigation }: any) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'swap' | 'giveaway' | 'sale'>('swap');
  const [quantity, setQuantity] = useState('1');
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is needed to document your seed stock.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleCreateListing = async () => {
    if (!name.trim() || !description.trim()) {
      Alert.alert('Incomplete Data', 'Please provide a name and description for your seed listing.');
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = null;

      if (image) {
        const fileExt = image.split('.').pop();
        const fileName = `${user?.id}/listings/${Date.now()}.${fileExt}`;
        
        const response = await fetch(image);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from('user-uploads')
          .upload(fileName, blob);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('user-uploads')
          .getPublicUrl(fileName);
          
        imageUrl = publicUrl;
      }

      const { error: dbError } = await supabase
        .from('seed_listings')
        .insert([
          {
            user_id: user?.id,
            name: name.trim(),
            description: description.trim(),
            listing_type: type,
            quantity_available: parseInt(quantity, 10) || 1,
            image_url: imageUrl,
          }
        ]);

      if (dbError) throw dbError;

      Alert.alert('Listing Active', 'Your seeds are now available for trade in the community network.');
      navigation.goBack();
    } catch (error: any) {
      console.error('Listing failed:', error);
      Alert.alert('System Error', `Failed to initialize listing: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={['rgba(0, 170, 255, 0.05)', 'transparent']}
          style={[styles.gradientCircle, { top: -height * 0.1, right: -width * 0.2 }]}
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <X size={24} color="#94a3b8" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Sprout size={16} color="#00AAFF" />
            <Text style={styles.headerTitle}>Seed Swap Listing</Text>
          </View>
          <TouchableOpacity 
            style={[styles.postButton, !name.trim() && styles.postButtonDisabled]}
            onPress={handleCreateListing}
            disabled={isSubmitting || !name.trim()}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={styles.postButtonText}>Initialize</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <TextInput
            style={styles.nameInput}
            placeholder="SEED VARIETY NAME..."
            placeholderTextColor="#475569"
            value={name}
            onChangeText={setName}
            maxLength={100}
          />

          <View style={styles.typeSelector}>
            {(['swap', 'giveaway', 'sale'] as const).map((t) => (
              <TouchableOpacity 
                key={t}
                style={[styles.typeButton, type === t && styles.typeButtonActive]}
                onPress={() => setType(t)}
              >
                <Text style={[styles.typeText, type === t && styles.typeTextActive]}>{t.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.descriptionInput}
            placeholder="Describe the seeds, growth conditions, and lineage..."
            placeholderTextColor="#475569"
            multiline
            value={description}
            onChangeText={setDescription}
            maxLength={1000}
          />

          <View style={styles.quantityRow}>
            <Layers size={18} color="#94a3b8" />
            <Text style={styles.quantityLabel}>AVAILABLE PACKETS:</Text>
            <TextInput
              style={styles.quantityInput}
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
              placeholder="1"
              placeholderTextColor="#475569"
            />
          </View>

          {image ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeImageButton} onPress={() => setImage(null)}>
                <X size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.mediaActions}>
              <TouchableOpacity style={styles.mediaButton} onPress={takePhoto}>
                <Camera size={24} color="#00AAFF" />
                <Text style={styles.mediaButtonText}>Capture Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
                <ImageIcon size={24} color="#60a5fa" />
                <Text style={styles.mediaButtonText}>Attach Media</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
  postButton: {
    backgroundColor: '#00AAFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 90,
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: '#1e293b',
    opacity: 0.5,
  },
  postButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  nameInput: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 10,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  typeButtonActive: {
    borderColor: '#00AAFF',
    backgroundColor: 'rgba(0, 170, 255, 0.1)',
  },
  typeText: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '800',
  },
  typeTextActive: {
    color: '#00AAFF',
  },
  descriptionInput: {
    color: '#cbd5e1',
    fontSize: 16,
    lineHeight: 24,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 12,
    borderRadius: 12,
  },
  quantityLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  quantityInput: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'center',
  },
  mediaActions: {
    flexDirection: 'row',
    gap: 16,
  },
  mediaButton: {
    flex: 1,
    height: 90,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mediaButtonText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});
