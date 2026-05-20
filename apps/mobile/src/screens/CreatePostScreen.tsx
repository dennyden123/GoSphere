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
import { X, Camera, Image as ImageIcon, Send, Zap } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

export function CreatePostScreen({ navigation }: any) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsRefreshing] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is needed to capture garden photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!content.trim() && !image) {
      Alert.alert('Empty Transmission', 'Please add some text or a photo to share your garden progress.');
      return;
    }

    setIsRefreshing(true);
    try {
      let imageUrl = null;

      // 1. Upload image if present
      if (image) {
        const fileExt = image.split('.').pop();
        const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
        
        // Convert URI to Blob for upload
        const response = await fetch(image);
        const blob = await response.blob();

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('user-uploads')
          .upload(fileName, blob);

        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('user-uploads')
          .getPublicUrl(fileName);
          
        imageUrl = publicUrl;
      }

      // 2. Create database record
      const { error: dbError } = await supabase
        .from('social_posts')
        .insert([
          {
            user_id: user?.id,
            content: content.trim(),
            image_url: imageUrl,
          }
        ]);

      if (dbError) throw dbError;

      Alert.alert('Transmission Sent', 'Your garden progress has been broadcast to the community.');
      navigation.goBack();
    } catch (error: any) {
      console.error('Post failed:', error);
      Alert.alert('System Error', `Failed to broadcast transmission: ${error.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={['rgba(0, 255, 65, 0.05)', 'transparent']}
          style={[styles.gradientCircle, { top: -height * 0.1, right: -width * 0.2 }]}
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <X size={24} color="#94a3b8" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Zap size={16} color="#00FF41" />
            <Text style={styles.headerTitle}>New Transmission</Text>
          </View>
          <TouchableOpacity 
            style={[styles.postButton, (!content.trim() && !image) && styles.postButtonDisabled]}
            onPress={handlePost}
            disabled={isSubmitting || (!content.trim() && !image)}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={styles.postButtonText}>Broadcast</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <TextInput
            style={styles.input}
            placeholder="What's happening in your ecosystem today?"
            placeholderTextColor="#475569"
            multiline
            value={content}
            onChangeText={setContent}
            maxLength={1000}
          />

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
                <Camera size={24} color="#00FF41" />
                <Text style={styles.mediaButtonText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
                <ImageIcon size={24} color="#00AAFF" />
                <Text style={styles.mediaButtonText}>Gallery</Text>
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
    backgroundColor: '#00FF41',
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
  input: {
    color: '#fff',
    fontSize: 18,
    lineHeight: 26,
    minHeight: 150,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  mediaActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20,
  },
  mediaButton: {
    flex: 1,
    height: 100,
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
    fontSize: 12,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    width: '100%',
    height: 250,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 10,
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
