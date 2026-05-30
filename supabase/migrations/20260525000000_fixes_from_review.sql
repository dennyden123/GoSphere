-- 1. Add missing INSERT policy on order_items
CREATE POLICY "Users can insert items for their own orders." ON public.order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id
            AND o.user_id = auth.uid()
        )
    );

-- 2. Add requester cancellation policy on swap_requests
CREATE POLICY "Requesters can cancel their own requests." ON public.swap_requests
    FOR UPDATE USING (auth.uid() = requester_id);

-- 3. Optimize check_iot_achievements trigger function to avoid high-frequency overhead
CREATE OR REPLACE FUNCTION public.check_iot_achievements() 
RETURNS TRIGGER AS $$
DECLARE
    user_owner_id UUID;
BEGIN
    -- Get the user who owns this garden
    SELECT user_id INTO user_owner_id FROM public.user_gardens WHERE id = NEW.user_garden_id;
    
    IF user_owner_id IS NOT NULL THEN
        -- Check if the user already has the badge to avoid calling award_badge (which executes extra queries)
        IF NOT EXISTS (
            SELECT 1 FROM public.user_badges ub
            JOIN public.badges b ON ub.badge_id = b.id
            WHERE ub.user_id = user_owner_id AND b.icon_slug = 'iot_linked'
        ) THEN
            -- Award 'High-Tech Gardener'
            PERFORM public.award_badge(user_owner_id, 'iot_linked');
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Fix overly restrictive profiles SELECT policy to allow community feature username display
DROP POLICY IF EXISTS "Users can view own profile." ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone." ON public.profiles 
    FOR SELECT USING (true);
