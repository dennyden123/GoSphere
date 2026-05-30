-- Add index to plants name for faster searching and identification lookups
CREATE INDEX IF NOT EXISTS idx_plants_name ON public.plants (name);

-- Add index to garden_logs log_date for faster telemetry history queries
CREATE INDEX IF NOT EXISTS idx_garden_logs_date ON public.garden_logs (log_date DESC);

-- Add index to user_gardens status for faster dashboard filtering
CREATE INDEX IF NOT EXISTS idx_user_gardens_status ON public.user_gardens (status);
