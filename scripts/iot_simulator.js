import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
// Replace with your local Supabase credentials or set as ENV vars
const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/iot-ingest`;

async function simulateTelemetry() {
  console.log('🚀 IoT Simulation Engine Started...');

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // 1. Find a target garden specimen
  const { data: specimens, error: fetchError } = await supabase
    .from('user_gardens')
    .select('id, custom_name')
    .limit(1);

  if (fetchError || !specimens || specimens.length === 0) {
    console.error('❌ Error: No garden specimens found to target.');
    return;
  }

  const target = specimens[0];
  console.log(`📡 Targeting specimen: ${target.custom_name} (${target.id})`);

  // 2. Simulate sensor readings
  const sensorTypes = [
    { type: 'soil_moisture', unit: '%', range: [20, 80] },
    { type: 'light_lux', unit: 'lux', range: [100, 5000] },
    { type: 'temperature', unit: '°C', range: [18, 32] }
  ];

  for (const sensor of sensorTypes) {
    const value = Math.floor(Math.random() * (sensor.range[1] - sensor.range[0] + 1)) + sensor.range[0];
    
    console.log(`📡 Broadcasting ${sensor.type}: ${value}${sensor.unit}...`);

    try {
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          user_garden_id: target.id,
          sensor_type: sensor.type,
          value: value,
          unit: sensor.unit
        })
      });

      const result = await response.json();
      if (response.ok) {
        console.log(`✅ Success: Telemetry ingested. Status: ${response.status}`);
      } else {
        console.error(`❌ Failed: ${result.error}`);
      }
    } catch (err) {
      console.error(`❌ Network Error: ${err.message}`);
    }
  }

  console.log('🏁 Simulation Cycle Complete.');
}

simulateTelemetry();
