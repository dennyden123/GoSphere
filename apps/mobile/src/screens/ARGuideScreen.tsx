import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  Dimensions,
  ActivityIndicator,
  Platform,
  PanResponder,
  Alert
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { GLView } from 'expo-gl';
import { Accelerometer } from 'expo-sensors';
import { database } from '../database';
import GardenLog from '../database/models/GardenLog';
import { usePlantInference, ClassificationResult } from '../hooks/usePlantInference';
import { hfInference } from '../lib/ai/huggingFace';
import { 
  X, 
  Zap, 
  Scissors, 
  Ruler, 
  Info,
  Layers,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  Scan,
  CheckCircle2
} from 'lucide-react-native';
import Svg, { Line, Rect, Circle as SvgCircle, G, Text as SvgText, Defs, LinearGradient as SvgGradient, Stop, Path } from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  useAnimatedProps, 
  withRepeat, 
  withTiming, 
  interpolate,
  withSequence,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedG = Animated.createAnimatedComponent(G);

const { width, height } = Dimensions.get('window');

type ARMode = 'pruning' | 'measuring' | 'diagnostics';
type PruningType = 'structural' | 'deadheading' | 'harvesting';

interface PruningConfig {
  label: string;
  color: string;
  instruction: string;
  icon: any;
}

const PRUNING_CONFIGS: Record<PruningType, PruningConfig> = {
  structural: {
    label: 'STRUCTURAL CUT',
    color: '#4ade80',
    instruction: 'Identify main stem nodes. Cut at a 45° angle to promote outward growth.',
    icon: Scissors
  },
  deadheading: {
    label: 'DEADHEAD',
    color: '#fbbf24',
    instruction: 'Remove spent blooms. Cut just above the first set of healthy leaves.',
    icon: Zap
  },
  harvesting: {
    label: 'HARVEST',
    color: '#22d3ee',
    instruction: 'Target mature fruit/leaves. Use clean snips at the base of the pedicel.',
    icon: Layers
  }
};

export function ARGuideScreen({ navigation, route }: any) {
  const { specimenId } = route.params || {};
  const [permission, requestPermission] = useCameraPermissions();
  const [targetName, setTargetName] = useState<string | null>(null);
  const [mode, setMode] = useState<ARMode>('pruning');
  const [pruningType, setPruningType] = useState<PruningType>('structural');
  const [isInitializing, setIsInitializing] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cutLineY, setCutLineY] = useState(height / 2);
  
  // Measuring State
  const [measureY1, setMeasureY1] = useState(height * 0.4);
  const [measureY2, setMeasureY2] = useState(height * 0.6);
  const activeHandle = useRef<'y1' | 'y2' | 'cut' | null>(null);

  // Diagnostics State
  const cameraRef = useRef<CameraView>(null);
  const { classify, isLoading: isPlantLoading } = usePlantInference();
  const [diagnosticResults, setDiagnosticResults] = useState<ClassificationResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // HUD Animations
  const pulse = useSharedValue(0);
  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);
  const scanLinePos = useSharedValue(-height * 0.1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0, { duration: 1500 })
      ),
      -1,
      true
    );
    
    // Sensor integration
    Accelerometer.setUpdateInterval(32);
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      tiltX.value = withSpring(x * 15, { damping: 20 });
      tiltY.value = withSpring(y * 15, { damping: 20 });
    });

    if (specimenId) {
      database.get('user_gardens').find(specimenId).then((s: any) => {
        setTargetName(s.customName);
      }).catch(err => console.error('Failed to fetch specimen:', err));
    }

    const timer = setTimeout(() => setIsInitializing(false), 2000);
    return () => {
      subscription.remove();
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (isAnalyzing) {
      scanLinePos.value = withRepeat(
        withTiming(height * 1.1, { duration: 2000 }),
        -1,
        false
      );
    } else {
      scanLinePos.value = -height * 0.1;
    }
  }, [isAnalyzing]);

  const handleCapture = async () => {
    if (!specimenId && mode !== 'diagnostics') {
      Alert.alert('No Specimen Detected', 'Please select a plant from the dashboard first.');
      return;
    }

    if (mode === 'diagnostics') {
      runDiagnostics();
      return;
    }

    setIsCapturing(true);
    try {
      const pixelDist = Math.abs(measureY2 - measureY1);
      const cmDist = Number((pixelDist * 0.05).toFixed(1));
      
      await database.write(async () => {
        await database.get<GardenLog>('garden_logs').create(log => {
          log.userGardenId = specimenId;
          log.activityType = mode === 'pruning' ? `AR Pruning (${pruningType})` : 'AR Measurement';
          log.telemetryValue = mode === 'measuring' ? cmDist : undefined;
          log.telemetryUnit = mode === 'measuring' ? 'cm' : undefined;
          log.notes = mode === 'pruning' 
            ? `Pruned at height ${((height - cutLineY) * 0.05).toFixed(1)}cm equivalent.`
            : `Measured dimension: ${cmDist}cm.`;
        });
      });

      Alert.alert('Telemetry Synced', 'Data has been persisted to the Mission Control logs.');
    } catch (error) {
      console.error('Capture failed:', error);
      Alert.alert('Sync Error', 'Failed to persist AR data to database.');
    } finally {
      setIsCapturing(false);
    }
  };

  const runDiagnostics = async () => {
    if (!cameraRef.current || isAnalyzing) return;

    setIsAnalyzing(true);
    setDiagnosticResults([]);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: true,
      });

      if (photo.base64) {
        // Run both plant ID and disease detection
        const [idResults, diseaseResults] = await Promise.all([
          hfInference.identifyPlant(photo.base64),
          hfInference.detectDisease(photo.base64)
        ]);

        const combined = [
          ...idResults.map(r => ({ label: r.label, confidence: r.score })),
          ...diseaseResults.map(r => ({ label: `Condition: ${r.label}`, confidence: r.score }))
        ].filter(r => r.confidence > 0.15)
         .sort((a, b) => b.confidence - a.confidence)
         .slice(0, 3);

        setDiagnosticResults(combined);
      }
    } catch (error) {
      console.error('Diagnostics failed:', error);
      Alert.alert('AI Core Offline', 'Failed to reach diagnostic servers. Check neural link.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const touchY = evt.nativeEvent.pageY;
        if (mode === 'pruning') {
          activeHandle.current = 'cut';
        } else if (mode === 'measuring') {
          const dist1 = Math.abs(touchY - measureY1);
          const dist2 = Math.abs(touchY - measureY2);
          activeHandle.current = dist1 < dist2 ? 'y1' : 'y2';
        }
      },
      onPanResponderMove: (_, gestureState) => {
        if (activeHandle.current === 'cut') {
          setCutLineY(gestureState.moveY);
        } else if (activeHandle.current === 'y1') {
          setMeasureY1(gestureState.moveY);
        } else if (activeHandle.current === 'y2') {
          setMeasureY2(gestureState.moveY);
        }
      },
      onPanResponderRelease: () => {
        activeHandle.current = null;
      }
    })
  ).current;

  const animatedHudStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(pulse.value, [0, 1], [0.6, 1]),
      transform: [
        { translateX: tiltX.value },
        { translateY: tiltY.value },
        { rotateZ: `${tiltX.value / 2}deg` }
      ],
    };
  });

  const animatedScanLineStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: scanLinePos.value }],
      opacity: isAnalyzing ? 0.8 : 0,
    };
  });

  const pruningHUD = useMemo(() => {
    const config = PRUNING_CONFIGS[pruningType];
    
    return (
      <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers}>
        <Svg height="100%" width="100%" style={styles.svgOverlay}>
          {/* @ts-ignore */}
          <AnimatedG style={animatedHudStyle as any}>
            {/* Holographic Cut Line */}
            <G transform={`translate(0, ${cutLineY})`}>
              {/* Main Cut Line */}
              <Line 
                x1="40" y1="0" x2={width - 40} y2="0" 
                stroke={config.color} strokeWidth="2" strokeDasharray="8, 4" 
              />
              
              {/* Interactive Handles */}
              <SvgCircle cx="40" cy="0" r="4" fill={config.color} />
              <SvgCircle cx={width - 40} cy="0" r="4" fill={config.color} />
              
              {/* Label Box */}
              <Rect 
                x={width / 2 - 80} y="-35" width="160" height="24" 
                fill="rgba(0,0,0,0.6)" 
                stroke={config.color} strokeWidth="1"
                rx="4"
              />
              <SvgText 
                x={width / 2} y="-20" 
                fill={config.color} 
                fontSize="10" 
                fontWeight="bold" 
                textAnchor="middle"
                letterSpacing="1"
              >
                {config.label}
              </SvgText>

              {/* Angle Indicator (Visual Guide) */}
              <Path 
                d={`M ${width / 2 + 90} -20 L ${width / 2 + 110} 0 L ${width / 2 + 90} 20`}
                fill="none"
                stroke={config.color}
                strokeWidth="1"
                opacity="0.5"
              />
            </G>

            {/* Target Reticle - Follows Cut Line */}
            <G transform={`translate(${width / 2}, ${cutLineY})`}>
              <SvgCircle r="15" stroke={config.color} strokeWidth="1" fill="transparent" opacity="0.3" />
              <Line x1="-25" y1="0" x2="-10" y2="0" stroke={config.color} strokeWidth="2" />
              <Line x1="10" y1="0" x2="25" y2="0" stroke={config.color} strokeWidth="2" />
              <Line x1="0" y1="-25" x2="0" y2="-10" stroke={config.color} strokeWidth="2" />
              <Line x1="0" y1="10" x2="0" y2="25" stroke={config.color} strokeWidth="2" />
            </G>
          </AnimatedG>

          {/* Depth/Spatial Grid (Decorative) */}
          <G opacity="0.1">
            <Line x1={width * 0.2} y1="0" x2={width * 0.2} y2={height} stroke="#fff" strokeWidth="0.5" />
            <Line x1={width * 0.8} y1="0" x2={width * 0.8} y2={height} stroke="#fff" strokeWidth="0.5" />
          </G>
        </Svg>
        
        {/* Dynamic Instruction Overlay */}
        <View style={[styles.instructionOverlay, { borderColor: config.color }]}>
          <View style={[styles.instructionHeader, { backgroundColor: config.color }]}>
            <config.icon size={14} color="#000" />
            <Text style={styles.instructionTitle}>GUIDANCE ACTIVE</Text>
          </View>
          <Text style={styles.instructionDetail}>{config.instruction}</Text>
          <View style={styles.dragIndicator}>
            <ChevronUp size={12} color={config.color} />
            <Text style={[styles.dragText, { color: config.color }]}>DRAG TO ALIGN</Text>
            <ChevronDown size={12} color={config.color} />
          </View>
        </View>
      </View>
    );
  }, [pruningType, cutLineY, animatedHudStyle]);

  const measuringHUD = useMemo(() => {
    // Basic pixel-to-cm conversion (placeholder heuristic)
    const pixelDist = Math.abs(measureY2 - measureY1);
    const cmDist = (pixelDist * 0.05).toFixed(1); // 0.05cm per pixel as a rough baseline
    const midY = (measureY1 + measureY2) / 2;

    return (
      <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers}>
        <Svg height="100%" width="100%" style={styles.svgOverlay}>
          {/* @ts-ignore */}
          <AnimatedG style={animatedHudStyle as any}>
            {/* Caliper Markers */}
            <G transform={`translate(0, ${measureY1})`}>
              <Line x1="60" y1="0" x2={width - 60} y2="0" stroke="#60a5fa" strokeWidth="2" />
              <Rect x="40" y="-10" width="20" height="20" fill="#60a5fa" rx="4" />
              <SvgText x="50" y="5" fill="#000" fontSize="10" fontWeight="bold" textAnchor="middle">A</SvgText>
            </G>
            
            <G transform={`translate(0, ${measureY2})`}>
              <Line x1="60" y1="0" x2={width - 60} y2="0" stroke="#60a5fa" strokeWidth="2" />
              <Rect x="40" y="-10" width="20" height="20" fill="#60a5fa" rx="4" />
              <SvgText x="50" y="5" fill="#000" fontSize="10" fontWeight="bold" textAnchor="middle">B</SvgText>
            </G>

            {/* Connecting Dimension Line */}
            <Line 
              x1={width - 80} y1={measureY1} 
              x2={width - 80} y2={measureY2} 
              stroke="#60a5fa" strokeWidth="1" strokeDasharray="4, 2" 
            />
            
            {/* Dimension Label */}
            <G transform={`translate(${width - 100}, ${midY})`}>
              <Rect x="-50" y="-12" width="100" height="24" fill="rgba(0,0,0,0.8)" stroke="#60a5fa" strokeWidth="1" rx="12" />
              <SvgText 
                x="0" y="4" 
                fill="#60a5fa" 
                fontSize="14" 
                fontWeight="bold" 
                textAnchor="middle"
              >
                {cmDist} cm
              </SvgText>
            </G>
          </AnimatedG>
        </Svg>

        {/* Measuring Instructions */}
        <View style={[styles.instructionOverlay, { borderColor: '#60a5fa' }]}>
          <View style={[styles.instructionHeader, { backgroundColor: '#60a5fa' }]}>
            <Ruler size={14} color="#000" />
            <Text style={styles.instructionTitle}>SPATIAL TELEMETRY</Text>
          </View>
          <Text style={styles.instructionDetail}>
            Align markers A and B with the edges of the leaf or stem to calculate growth metrics.
          </Text>
          <View style={styles.dragIndicator}>
            <Text style={[styles.dragText, { color: '#60a5fa' }]}>DRAG MARKERS TO MEASURE</Text>
          </View>
        </View>
      </View>
    );
  }, [measureY1, measureY2, animatedHudStyle]);

  const diagnosticsHUD = useMemo(() => {
    return (
      <View style={StyleSheet.absoluteFill}>
        <Svg height="100%" width="100%" style={styles.svgOverlay}>
          {/* Target Reticle (Static for Scanning) */}
          <G transform={`translate(${width / 2}, ${height / 2})`}>
            <SvgCircle r="60" stroke="#f472b6" strokeWidth="1" strokeDasharray="4, 4" fill="transparent" opacity="0.3" />
            <Line x1="-70" y1="0" x2="-50" y2="0" stroke="#f472b6" strokeWidth="2" />
            <Line x1="50" y1="0" x2="70" y2="0" stroke="#f472b6" strokeWidth="2" />
            <Line x1="0" y1="-70" x2="0" y2="-50" stroke="#f472b6" strokeWidth="2" />
            <Line x1="0" y1="50" x2="0" y2="70" stroke="#f472b6" strokeWidth="2" />
          </G>

          {/* AR Callouts for Results */}
          {/* @ts-ignore */}
          <AnimatedG style={animatedHudStyle as any}>
            {diagnosticResults.map((res, i) => {
              const offsetX = (i - (diagnosticResults.length - 1) / 2) * 120;
              const offsetY = -100 - (i % 2 === 0 ? 20 : 0);
              
              return (
                <G key={i} transform={`translate(${width / 2 + offsetX}, ${height / 2 + offsetY})`}>
                  {/* Connector Line */}
                  <Line x1={-offsetX} y1={-offsetY} x2="0" y2="0" stroke="#f472b6" strokeWidth="1" opacity="0.4" />
                  
                  {/* Holographic Tag */}
                  <Rect x="-55" y="-15" width="110" height="30" fill="rgba(0,0,0,0.8)" stroke="#f472b6" strokeWidth="1" rx="8" />
                  <SvgText 
                    x="0" y="-2" 
                    fill="#f472b6" 
                    fontSize="9" 
                    fontWeight="bold" 
                    textAnchor="middle"
                    letterSpacing="0.5"
                  >
                    {res.label.toUpperCase()}
                  </SvgText>
                  <SvgText 
                    x="0" y="10" 
                    fill="#fff" 
                    fontSize="8" 
                    textAnchor="middle"
                    opacity="0.6"
                  >
                    {(res.confidence * 100).toFixed(1)}% CONFIDENCE
                  </SvgText>
                </G>
              );
            })}
          </AnimatedG>
        </Svg>

        {/* Diagnostic Instructions */}
        <View style={[styles.instructionOverlay, { borderColor: '#f472b6' }]}>
          <View style={[styles.instructionHeader, { backgroundColor: '#f472b6' }]}>
            <Scan size={14} color="#000" />
            <Text style={styles.instructionTitle}>NEURAL SCAN ACTIVE</Text>
          </View>
          <Text style={styles.instructionDetail}>
            Align the neural reticle with a plant leaf and initiate scan for multi-spectral diagnostic analysis.
          </Text>
        </View>

        {/* Animated Scan Line */}
        <AnimatedRect 
          x="0" y="0" width={width} height="4" 
          fill="#f472b6" 
          // @ts-ignore
          style={animatedScanLineStyle as any}
        />
      </View>
    );
  }, [diagnosticResults, isAnalyzing, animatedHudStyle, animatedScanLineStyle]);

  const onContextCreate = async (gl: any) => {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  };

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.permissionContent}>
          <Text style={styles.title}>Camera Required</Text>
          <Text style={styles.instructionText}>
            AR guidance requires camera access to overlay digital instructions onto your physical plants.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
            <Text style={styles.primaryButtonText}>Grant Access</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <GLView style={styles.glOverlay} onContextCreate={onContextCreate} />
        {mode === 'pruning' && pruningHUD}
        {mode === 'measuring' && measuringHUD}
        {mode === 'diagnostics' && diagnosticsHUD}
        
        <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={() => navigation.goBack()}
            >
              <X size={24} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.statusBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.statusText}>
                {targetName ? `TRACKING: ${targetName.toUpperCase()}` : 'AR CORE v3.2 ACTIVE'}
              </Text>
            </View>
            
            <TouchableOpacity style={styles.iconButton}>
              <Info size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Pruning Type Switcher (Only visible in pruning mode) */}
          {mode === 'pruning' && (
            <View style={styles.typeSwitcher}>
              {(Object.keys(PRUNING_CONFIGS) as PruningType[]).map((type) => (
                <TouchableOpacity 
                  key={type}
                  style={[
                    styles.typeButton, 
                    pruningType === type && { borderColor: PRUNING_CONFIGS[type].color, backgroundColor: 'rgba(255,255,255,0.05)' }
                  ]}
                  onPress={() => setPruningType(type)}
                >
                  <View style={[styles.typeDot, { backgroundColor: PRUNING_CONFIGS[type].color }]} />
                  <Text style={[styles.typeText, pruningType === type && { color: '#fff' }]}>
                    {type.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Mode Selector */}
          <View style={styles.bottomControls}>
            <TouchableOpacity 
              style={[
                styles.captureButton, 
                (isCapturing || isAnalyzing) && styles.captureButtonDisabled,
                mode === 'diagnostics' && { shadowColor: '#f472b6' }
              ]}
              onPress={handleCapture}
              disabled={isCapturing || isAnalyzing}
            >
              {isCapturing || isAnalyzing ? (
                <ActivityIndicator color="#000" />
              ) : (
                <View style={styles.captureInner}>
                  {mode === 'diagnostics' ? <Scan size={24} color="#000" /> : <Zap size={24} color="#000" />}
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.modeSelector}>
              <TouchableOpacity 
                style={[styles.modeButton, mode === 'pruning' && styles.modeButtonActive]}
                onPress={() => setMode('pruning')}
              >
                <Scissors size={20} color={mode === 'pruning' ? '#000' : '#fff'} />
                {mode === 'pruning' && <Text style={styles.modeButtonText}>Pruning</Text>}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modeButton, mode === 'measuring' && styles.modeButtonActive]}
                onPress={() => setMode('measuring')}
              >
                <Ruler size={20} color={mode === 'measuring' ? '#000' : '#fff'} />
                {mode === 'measuring' && <Text style={styles.modeButtonText}>Measure</Text>}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modeButton, mode === 'diagnostics' && styles.modeButtonActive]}
                onPress={() => setMode('diagnostics')}
              >
                <Layers size={20} color={mode === 'diagnostics' ? '#000' : '#fff'} />
                {mode === 'diagnostics' && <Text style={styles.modeButtonText}>Scan</Text>}
              </TouchableOpacity>
            </View>
          </View>

          {/* Initializing Overlay */}
          {isInitializing && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#4ade80" />
              <Text style={styles.loadingText}>CALIBRATING SPATIAL SENSORS...</Text>
            </View>
          )}
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  glOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  svgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.4)',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ade80',
  },
  statusText: {
    color: '#4ade80',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginLeft: 8,
  },
  typeSwitcher: {
    position: 'absolute',
    right: 20,
    top: height * 0.2,
    gap: 12,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 8,
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typeText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  instructionOverlay: {
    position: 'absolute',
    left: 20,
    top: height * 0.2,
    width: width * 0.6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
  },
  instructionTitle: {
    color: '#000',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  instructionDetail: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
    padding: 12,
  },
  dragIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
    gap: 4,
  },
  dragText: {
    fontSize: 9,
    fontWeight: '800',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    alignSelf: 'center',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  captureButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#94a3b8',
  },
  captureInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomControls: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 30,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'space-between',
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    gap: 8,
  },
  modeButtonActive: {
    backgroundColor: '#4ade80',
  },
  modeButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  loadingText: {
    color: '#4ade80',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  permissionContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  instructionText: {
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
  },
  primaryButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
});
