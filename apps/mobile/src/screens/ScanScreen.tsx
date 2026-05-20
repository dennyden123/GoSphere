import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Scan, Zap, Camera as CameraIcon, RefreshCcw } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { usePlantInference, ClassificationResult } from '../hooks/usePlantInference';

const { width, height } = Dimensions.get('window');

export function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<ClassificationResult[]>([]);
  const { classify, isLoading: isModelLoading } = usePlantInference();

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.centerContent}>
          <Text style={styles.title}>Camera Access</Text>
          <Text style={styles.instructionText}>
            We need your permission to use the camera for plant identification.
          </Text>
          <TouchableOpacity style={styles.scanButton} onPress={requestPermission}>
            <LinearGradient
              colors={['#00AAFF', '#0055FF']}
              style={styles.scanButtonGradient}
            >
              <Text style={styles.scanButtonText}>Grant Permission</Text>
            </LinearGradient>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  const handleScan = async () => {
    if (!cameraRef.current || isScanning || isModelLoading) return;

    try {
      setIsScanning(true);
      setResults([]);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: false,
      });

      if (photo) {
        const identification = await classify(photo.uri);
        setResults(identification);
      }
    } catch (error) {
      console.error('Scan failed:', error);
      Alert.alert('System Error', 'Failed to process image. Ensure the model is loaded.');
    } finally {
      setIsScanning(false);
    }
  };

  const resetScan = () => {
    setResults([]);
    setIsScanning(false);
  };

  return (
    <View style={styles.container}>
      {/* Cinematic Background */}
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={['rgba(0, 170, 255, 0.1)', 'transparent']}
          style={[styles.gradientCircle, { top: -height * 0.2, right: -width * 0.2 }]}
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.systemStatus}>
            <Zap size={14} color={isModelLoading ? "#94a3b8" : "#00AAFF"} />
            <Text style={[styles.systemText, isModelLoading && { color: "#94a3b8" }]}>
              {isModelLoading ? "INITIALIZING AI..." : "VISION SYSTEM ONLINE"}
            </Text>
          </View>
          
          <Text style={styles.title}>AI Scanner</Text>
          
          <View style={styles.scannerInterface}>
            {results.length > 0 ? (
              <View style={styles.resultsContainer}>
                <View style={styles.cornerTopLeft} />
                <View style={styles.cornerTopRight} />
                <View style={styles.cornerBottomLeft} />
                <View style={styles.cornerBottomRight} />
                
                <Text style={styles.resultsTitle}>ANALYSIS COMPLETE</Text>
                {results.map((res, i) => (
                  <View key={i} style={styles.resultItem}>
                    <Text style={styles.resultLabel}>{res.label.toUpperCase()}</Text>
                    <View style={styles.confidenceBarContainer}>
                      <View style={[styles.confidenceBar, { width: `${res.confidence * 100}%` }]} />
                    </View>
                    <Text style={styles.confidenceText}>{(res.confidence * 100).toFixed(1)}%</Text>
                  </View>
                ))}
                
                <TouchableOpacity style={styles.resetButton} onPress={resetScan}>
                  <RefreshCcw size={16} color="#00AAFF" />
                  <Text style={styles.resetButtonText}>New Scan</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.scanTargetContainer}>
                <CameraView 
                  ref={cameraRef}
                  style={styles.camera} 
                  facing="back"
                  autofocus="on"
                />
                <View style={styles.overlay}>
                  <View style={styles.cornerTopLeft} />
                  <View style={styles.cornerTopRight} />
                  <View style={styles.cornerBottomLeft} />
                  <View style={styles.cornerBottomRight} />
                  {isScanning && <ActivityIndicator size="large" color="#00AAFF" />}
                </View>
              </View>
            )}
            
            <Text style={styles.instructionText}>
              {results.length > 0 
                ? "Diagnostic results based on local Edge AI inference."
                : "Align plant leaf within the target area for high-precision diagnostic analysis."}
            </Text>
          </View>

          {results.length === 0 && (
            <TouchableOpacity 
              style={[styles.scanButton, (isScanning || isModelLoading) && styles.disabledButton]} 
              onPress={handleScan}
              disabled={isScanning || isModelLoading}
            >
              <LinearGradient
                colors={['#00AAFF', '#0055FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.scanButtonGradient}
              >
                <CameraIcon size={20} color="#fff" style={{ marginRight: 10 }} />
                <Text style={styles.scanButtonText}>
                  {isScanning ? "ANALYZING..." : "Initiate Scan"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050A10',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  gradientCircle: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: (width * 1.5) / 2,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 120,
  },
  systemStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  systemText: {
    color: '#00AAFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginLeft: 6,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
    marginTop: 10,
  },
  scannerInterface: {
    alignItems: 'center',
    width: '100%',
  },
  scanTargetContainer: {
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 30,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsContainer: {
    width: width * 0.75,
    padding: 20,
    backgroundColor: 'rgba(0, 170, 255, 0.05)',
    borderRadius: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(0, 170, 255, 0.1)',
  },
  resultsTitle: {
    color: '#00AAFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 20,
  },
  resultItem: {
    marginBottom: 15,
  },
  resultLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  confidenceBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginBottom: 4,
  },
  confidenceBar: {
    height: '100%',
    backgroundColor: '#00AAFF',
    borderRadius: 2,
  },
  confidenceText: {
    color: '#94a3b8',
    fontSize: 10,
    textAlign: 'right',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    padding: 10,
  },
  resetButtonText: {
    color: '#00AAFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
  cornerTopLeft: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 20,
    height: 20,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#00AAFF',
    borderTopLeftRadius: 10,
  },
  cornerTopRight: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#00AAFF',
    borderTopRightRadius: 10,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 20,
    height: 20,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#00AAFF',
    borderBottomLeftRadius: 10,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#00AAFF',
    borderBottomRightRadius: 10,
  },
  instructionText: {
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  scanButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.6,
  },
  scanButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
