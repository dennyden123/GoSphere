import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Edge Function to ingest IoT Telemetry
// This endpoint is optimized for low-power microcontrollers (ESP32, Arduino)
// It accepts a simple JSON payload and a pre-shared hardware token.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Basic auth check. For hardware, we often use a specific "hardware key" or the service_role key
    // if we trust the network, or we map an API key to a specific user/garden.
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { user_garden_id, sensor_type, value, unit } = await req.json()

    if (!user_garden_id || !sensor_type || value === undefined || !unit) {
      return new Response(JSON.stringify({ error: 'Missing required telemetry fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create a Supabase client with the Auth context of the logged in user / hardware device.
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Alternatively, if the hardware passes a device-specific key, we might use the service_role
    // client to bypass RLS, but authenticate the device manually. Here we assume the device
    // is authenticated as a valid user or service via the Authorization header.

    const { data, error } = await supabaseClient
      .from('hardware_telemetry')
      .insert([
        {
          user_garden_id,
          sensor_type,
          reading_value: value,
          reading_unit: unit,
        },
      ])
      .select()

    if (error) throw error

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
