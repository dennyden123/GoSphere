-- Add Hardware Telemetry Table for IoT sensors

CREATE TABLE public.hardware_telemetry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_garden_id UUID REFERENCES public.user_gardens(id) ON DELETE CASCADE,
    sensor_type VARCHAR(50) NOT NULL, -- e.g., 'soil_moisture', 'light_lux', 'temperature', 'humidity'
    reading_value NUMERIC NOT NULL,
    reading_unit VARCHAR(20) NOT NULL, -- e.g., '%', 'lux', 'celsius'
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for efficient time-series querying
CREATE INDEX idx_hardware_telemetry_garden_type_time ON public.hardware_telemetry(user_garden_id, sensor_type, recorded_at DESC);

-- Enable RLS
ALTER TABLE public.hardware_telemetry ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view telemetry for their gardens." ON public.hardware_telemetry 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_gardens ug 
            WHERE ug.id = hardware_telemetry.user_garden_id 
            AND ug.user_id = auth.uid()
        )
    );

-- Allow service role to insert (IoT devices would use service key or specific scoped token)
-- For simplicity, let's allow inserts if the user owns the garden (if IoT authenticates as user)
CREATE POLICY "Users can insert telemetry for their gardens." ON public.hardware_telemetry 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_gardens ug 
            WHERE ug.id = hardware_telemetry.user_garden_id 
            AND ug.user_id = auth.uid()
        )
    );

-- Add to replication publication so clients can listen to real-time updates
ALTER PUBLICATION supabase_realtime ADD TABLE hardware_telemetry;
