import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sprout, Plus, ShoppingBag } from 'lucide-react-native';
import withObservables from '@nozbe/with-observables';
import { database } from '../database';
import UserGarden from '../database/models/UserGarden';
import Plant from '../database/models/Plant';
import { PlantCard } from '../components/PlantCard';

const { width, height } = Dimensions.get('window');

interface GardenScreenProps {
  userGardens: UserGarden[];
  navigation: any;
}

function GardenScreenBase({ userGardens, navigation }: GardenScreenProps) {
  const handleAddPlant = async () => {
    // In a real flow, this would open a modal or navigate to a search screen.
    // For now, let's create a quick "Quick Add" to demonstrate CRUD.
    try {
      await database.write(async () => {
        // Find or create a default plant type
        const plantsCollection = database.get<Plant>('plants');
        let defaultPlant = await plantsCollection.query().fetch().then(ps => ps[0]);
        
        if (!defaultPlant) {
          defaultPlant = await plantsCollection.create(p => {
            p.name = 'Basil';
            p.isEdible = true;
            p.isToxic = false;
          });
        }

        await database.get<UserGarden>('user_gardens').create(ug => {
          ug.plantId = defaultPlant.id;
          ug.customName = `Specimen #${userGardens.length + 1}`;
          ug.datePlanted = new Date().toISOString();
          ug.status = 'Healthy';
          ug.userId = 'current-user-uuid';
        });
      });
    } catch (error) {
      console.error('Failed to add plant:', error);
      Alert.alert('System Error', 'Failed to initialize new specimen.');
    }
  };

  const handleDeletePlant = async (id: string) => {
    Alert.alert(
      'Decommission Specimen',
      'Are you sure you want to remove this plant from your garden?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              await database.write(async () => {
                const specimen = await database.get<UserGarden>('user_gardens').find(id);
                await specimen.markAsDeleted(); // Soft delete for sync
              });
            } catch (error) {
              console.error('Failed to delete plant:', error);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Cinematic Background */}
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={['rgba(34, 197, 94, 0.15)', 'transparent']}
          style={[styles.gradientCircle, { top: -height * 0.1, left: -width * 0.2 }]}
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>My Garden</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.navigate('Marketplace')}>
                <ShoppingBag size={22} color="#94a3b8" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.headerIconBtn, { marginLeft: 12 }]} onPress={handleAddPlant}>
                <Plus size={24} color="#00FF41" />
              </TouchableOpacity>
            </View>
          </View>

          {userGardens.length > 0 ? (
            <View style={styles.listContainer}>
              {userGardens.map(specimen => (
                <PlantCard 
                  key={specimen.id} 
                  userGarden={specimen} 
                  onDelete={handleDeletePlant} 
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.iconContainer}>
                <Sprout size={48} color="rgba(255, 255, 255, 0.1)" />
              </View>
              <Text style={styles.emptyTitle}>No Flora Detected</Text>
              <Text style={styles.emptySubtitle}>
                Initialize your urban ecosystem by adding your first plant specimen.
              </Text>
              
              <TouchableOpacity style={styles.actionButton} onPress={handleAddPlant}>
                <Text style={styles.actionButtonText}>Add Plant</Text>
              </TouchableOpacity>
            </View>
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
    overflow: 'hidden',
  },
  gradientCircle: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: (width * 1.2) / 2,
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
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  listContainer: {
    width: '100%',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height * 0.1,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptySubtitle: {
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 40,
    marginBottom: 32,
  },
  actionButton: {
    backgroundColor: 'rgba(0, 255, 65, 0.1)',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 65, 0.3)',
  },
  actionButtonText: {
    color: '#00FF41',
    fontSize: 16,
    fontWeight: '600',
  },
});

const enhance = withObservables([], () => ({
  userGardens: database.get<UserGarden>('user_gardens').query().observe(),
}));

export const GardenScreen = enhance(GardenScreenBase);
