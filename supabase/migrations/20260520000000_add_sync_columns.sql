-- Migration to add sync-related columns to existing tables

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Update 'plants' table
ALTER TABLE public.plants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.plants ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
DROP TRIGGER IF EXISTS set_updated_at ON public.plants;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.plants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update 'user_gardens' table
ALTER TABLE public.user_gardens ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.user_gardens ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
DROP TRIGGER IF EXISTS set_updated_at ON public.user_gardens;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.user_gardens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update 'garden_logs' table
ALTER TABLE public.garden_logs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.garden_logs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
DROP TRIGGER IF EXISTS set_updated_at ON public.garden_logs;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.garden_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update 'plant_guides' table
ALTER TABLE public.plant_guides ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.plant_guides ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
DROP TRIGGER IF EXISTS set_updated_at ON public.plant_guides;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.plant_guides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update 'profiles' table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
