-- Phase 4: Notification Center Migration

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- e.g., 'like', 'follow', 'system_alert', 'achievement'
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    data JSONB, -- For deep linking (e.g., post_id, follower_id)
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for efficient querying of user notifications
CREATE INDEX idx_notifications_user_id_created ON public.notifications(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own notifications." ON public.notifications 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications (mark as read)." ON public.notifications 
    FOR UPDATE USING (auth.uid() = user_id);

-- Realtime enablement
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Function to automatically create a notification when a follow occurs
CREATE OR REPLACE FUNCTION public.handle_new_follow() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notifications (user_id, type, title, body, data)
    VALUES (
        NEW.following_id,
        'follow',
        'New Network Link',
        (SELECT username FROM public.profiles WHERE id = NEW.follower_id) || ' has established a connection with your garden.',
        jsonb_build_object('follower_id', NEW.follower_id)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_follow
    AFTER INSERT ON public.follows
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_follow();

-- Function to automatically create a notification when a like occurs
CREATE OR REPLACE FUNCTION public.handle_new_like() 
RETURNS TRIGGER AS $$
DECLARE
    post_owner_id UUID;
BEGIN
    SELECT user_id INTO post_owner_id FROM public.social_posts WHERE id = NEW.post_id;
    
    -- Don't notify if liking own post
    IF post_owner_id != NEW.user_id THEN
        INSERT INTO public.notifications (user_id, type, title, body, data)
        VALUES (
            post_owner_id,
            'like',
            'Transmission Signal',
            (SELECT username FROM public.profiles WHERE id = NEW.user_id) || ' acknowledged your garden transmission.',
            jsonb_build_object('post_id', NEW.post_id)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_like
    AFTER INSERT ON public.post_likes
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_like();
