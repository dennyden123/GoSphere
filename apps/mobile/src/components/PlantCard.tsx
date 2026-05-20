import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Dimensions, 
  TouchableOpacity,
  Image
} from 'react-native';
import withObservables from '@nozbe/with-observables';
import UserGarden from '../database/models/UserGarden';
import Plant from '../database/models/Plant';
import { Sprout, Trash2, Calendar } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface PlantCardProps {
  userGarden: UserGarden;
  plant: Plant;
  onDelete: (id: string) => void;
}

const PlantCardBase: React.FC<PlantCardProps> = ({ userGarden, plant, onDelete }) => {
  return (
    <View style={styles.card}>
      <View style={styles.imagePlaceholder}>
        <Sprout size={32} color="#00FF41" />
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.customName}>{userGarden.customName}</Text>
          <TouchableOpacity onPress={() => onDelete(userGarden.id)}>
            <Trash2 size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.plantType}>{plant.name}</Text>
        
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Calendar size={12} color="#94a3b8" />
            <Text style={styles.metaText}>{new Date(userGarden.datePlanted).toLocaleDateString()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: userGarden.status === 'Healthy' ? 'rgba(0, 255, 65, 0.1)' : 'rgba(255, 170, 0, 0.1)' }]}>
            <Text style={[styles.statusText, { color: userGarden.status === 'Healthy' ? '#00FF41' : '#FFAA00' }]}>
              {userGarden.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  customName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  plantType: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: '#94a3b8',
    fontSize: 12,
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

// Observe the userGarden and fetch the related plant
const enhance = withObservables(['userGarden'], ({ userGarden }: { userGarden: UserGarden }) => ({
  userGarden: userGarden,
  plant: userGarden.plant.observe(),
}));

export const PlantCard = enhance(PlantCardBase);
