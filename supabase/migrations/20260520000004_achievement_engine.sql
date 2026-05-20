-- Phase 4: Achievement Engine Migration

-- 1. Seed Initial Badges
INSERT INTO public.badges (name, description, icon_slug, rarity) VALUES
('First Transmission', 'Broadcasted your first garden update to the global network.', 'first_transmission', 'Common'),
('Neural Link Established', 'Connected with your first fellow gardener.', 'first_follow', 'Common'),
('Community Pioneer', 'Established 5 or more horticultural connections.', 'community_pioneer', 'Uncommon'),
('High-Tech Gardener', 'Linked your first hardware sensor to Mission Control.', 'iot_linked', 'Rare');

-- 2. Helper function to award badges safely
CREATE OR REPLACE FUNCTION public.award_badge(target_user_id UUID, badge_slug VARCHAR)
RETURNS VOID AS $$
DECLARE
    target_badge_id UUID;
BEGIN
    -- Get badge ID from slug
    SELECT id INTO target_badge_id FROM public.badges WHERE icon_slug = badge_slug;
    
    IF target_badge_id IS NOT NULL THEN
        -- Insert into user_badges if not already earned
        INSERT INTO public.user_badges (user_id, badge_id)
        VALUES (target_user_id, target_badge_id)
        ON CONFLICT (user_id, badge_id) DO NOTHING;
        
        -- Create a notification if the row was actually inserted
        IF FOUND THEN
            INSERT INTO public.notifications (user_id, type, title, body, data)
            VALUES (
                target_user_id,
                'achievement',
                'Achievement Unlocked',
                'You have earned the "' || (SELECT name FROM public.badges WHERE id = target_badge_id) || '" badge.',
                jsonb_build_object('badge_slug', badge_slug)
            );
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger for First Transmission (social_posts)
CREATE OR REPLACE FUNCTION public.check_transmission_achievements() 
RETURNS TRIGGER AS $$
BEGIN
    -- Award 'First Transmission'
    PERFORM public.award_badge(NEW.user_id, 'first_transmission');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_first_post
    AFTER INSERT ON public.social_posts
    FOR EACH ROW EXECUTE FUNCTION public.check_transmission_achievements();

-- 4. Trigger for Follow Achievements (follows)
CREATE OR REPLACE FUNCTION public.check_follow_achievements() 
RETURNS TRIGGER AS $$
DECLARE
    follow_count INTEGER;
BEGIN
    -- Count how many people the user follows
    SELECT count(*) INTO follow_count FROM public.follows WHERE follower_id = NEW.follower_id;
    
    -- Award 'Neural Link Established'
    IF follow_count = 1 THEN
        PERFORM public.award_badge(NEW.follower_id, 'first_follow');
    END IF;
    
    -- Award 'Community Pioneer'
    IF follow_count >= 5 THEN
        PERFORM public.award_badge(NEW.follower_id, 'community_pioneer');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_follow_achievement
    AFTER INSERT ON public.follows
    FOR EACH ROW EXECUTE FUNCTION public.check_follow_achievements();

-- 5. Trigger for IoT Achievements (hardware_telemetry)
-- Note: hardware_telemetry is high frequency, so we use a more efficient check
CREATE OR REPLACE FUNCTION public.check_iot_achievements() 
RETURNS TRIGGER AS $$
DECLARE
    user_owner_id UUID;
BEGIN
    -- Get the user who owns this garden
    SELECT user_id INTO user_owner_id FROM public.user_gardens WHERE id = NEW.user_garden_id;
    
    IF user_owner_id IS NOT NULL THEN
        -- Award 'High-Tech Gardener'
        PERFORM public.award_badge(user_owner_id, 'iot_linked');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_first_iot_telemetry
    AFTER INSERT ON public.hardware_telemetry
    FOR EACH ROW EXECUTE FUNCTION public.check_iot_achievements();
