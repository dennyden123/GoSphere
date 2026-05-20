-- GroSphere Initial Database Schema (PostgreSQL for Supabase)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Plants Dictionary (Global database of plants)
CREATE TABLE public.plants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    description TEXT,
    is_edible BOOLEAN DEFAULT false,
    is_toxic BOOLEAN DEFAULT false,
    sunlight_requirement VARCHAR(100), -- e.g., 'Full Sun', 'Partial Shade'
    water_requirement VARCHAR(100), -- e.g., 'High', 'Moderate', 'Low'
    difficulty_level VARCHAR(50), -- e.g., 'Beginner', 'Intermediate', 'Expert'
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. User Profiles
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(255),
    experience_level VARCHAR(50), -- e.g., 'Beginner'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. User Gardens (The plants the user is actively growing)
CREATE TABLE public.user_gardens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    plant_id UUID REFERENCES public.plants(id) ON DELETE SET NULL,
    custom_name VARCHAR(255), -- User's nickname for the plant
    date_planted DATE,
    status VARCHAR(100) DEFAULT 'Healthy',
    location VARCHAR(100), -- e.g., 'Balcony', 'Kitchen Window'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Garden Logs (Watering, Fertilizing, Harvesting events)
CREATE TABLE public.garden_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_garden_id UUID REFERENCES public.user_gardens(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL, -- e.g., 'Watered', 'Fertilized', 'Harvested', 'Disease Detected'
    notes TEXT,
    log_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Plant Guides (Structured data for growing plants)
CREATE TABLE public.plant_guides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plant_id UUID REFERENCES public.plants(id) ON DELETE CASCADE,
    difficulty VARCHAR(50),
    sunlight TEXT,
    water_schedule TEXT,
    soil_type TEXT,
    phases JSONB, -- Array of growth phases with nested tasks
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Set up Row Level Security (RLS) policies

-- Plants table is readable by everyone
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plants are viewable by everyone." ON public.plants FOR SELECT USING (true);

-- Plant Guides are readable by everyone
ALTER TABLE public.plant_guides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plant guides are viewable by everyone." ON public.plant_guides FOR SELECT USING (true);

-- Profiles are readable and editable only by the user
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User Gardens are readable and editable only by the user
ALTER TABLE public.user_gardens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own gardens." ON public.user_gardens FOR ALL USING (auth.uid() = user_id);

-- Garden Logs are readable and editable only by the user
ALTER TABLE public.garden_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own logs." ON public.garden_logs 
    FOR ALL USING (
        auth.uid() = (SELECT user_id FROM public.user_gardens WHERE id = user_garden_id)
    );
