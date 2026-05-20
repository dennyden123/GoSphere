-- Phase 4: Community Seed Swap Migration

-- 1. Seed Listings Table (P2P)
CREATE TABLE public.seed_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'Seeds',
    listing_type VARCHAR(50) DEFAULT 'swap', -- 'swap', 'giveaway', 'sale'
    image_url TEXT,
    quantity_available INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'traded', 'withdrawn'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Swap Requests Table
CREATE TABLE public.swap_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES public.seed_listings(id) ON DELETE CASCADE,
    requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'completed'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.seed_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swap_requests ENABLE ROW LEVEL SECURITY;

-- Policies: Seed Listings
CREATE POLICY "Listings are viewable by everyone." ON public.seed_listings FOR SELECT USING (true);
CREATE POLICY "Users can create their own listings." ON public.seed_listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage their own listings." ON public.seed_listings FOR ALL USING (auth.uid() = user_id);

-- Policies: Swap Requests
CREATE POLICY "Users can see requests they sent or received." ON public.swap_requests 
    FOR SELECT USING (
        auth.uid() = requester_id OR 
        auth.uid() = (SELECT user_id FROM public.seed_listings WHERE id = listing_id)
    );

CREATE POLICY "Users can create swap requests." ON public.swap_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Owners can update requests (accept/reject)." ON public.swap_requests 
    FOR UPDATE USING (
        auth.uid() = (SELECT user_id FROM public.seed_listings WHERE id = listing_id)
    );

-- Realtime enablement
ALTER PUBLICATION supabase_realtime ADD TABLE seed_listings;
ALTER PUBLICATION supabase_realtime ADD TABLE swap_requests;

-- Trigger for swap notifications
CREATE OR REPLACE FUNCTION public.handle_new_swap_request() 
RETURNS TRIGGER AS $$
DECLARE
    listing_owner_id UUID;
    requester_name TEXT;
BEGIN
    SELECT user_id INTO listing_owner_id FROM public.seed_listings WHERE id = NEW.listing_id;
    SELECT username INTO requester_name FROM public.profiles WHERE id = NEW.requester_id;
    
    INSERT INTO public.notifications (user_id, type, title, body, data)
    VALUES (
        listing_owner_id,
        'system_alert',
        'Incoming Swap Request',
        requester_name || ' wants to trade for your "' || (SELECT name FROM public.seed_listings WHERE id = NEW.listing_id) || '".',
        jsonb_build_object('swap_id', NEW.id, 'listing_id', NEW.listing_id)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_swap_request
    AFTER INSERT ON public.swap_requests
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_swap_request();
