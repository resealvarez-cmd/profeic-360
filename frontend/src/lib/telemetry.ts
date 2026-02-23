import { supabase } from './supabaseClient';

export interface TelemetryEvent {
    eventName: string;
    module?: string;
    metadata?: Record<string, any>;
}

/**
 * Tracks a silent telemetry event for product analytics.
 * Automatically captures user identity and school context.
 */
export async function trackEvent({ eventName, module, metadata = {} }: TelemetryEvent) {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return; // Don't track if not logged in

        // Ideally we would have school_id in the user's profile/metadata
        // For now we capture email and let backend or post-processing map it
        const { error } = await supabase
            .from('telemetry_events')
            .insert({
                user_id: user.id,
                email: user.email,
                event_name: eventName,
                module: module || window.location.pathname,
                metadata: {
                    ...metadata,
                    url: window.location.href,
                    userAgent: navigator.userAgent
                }
            });

        if (error) {
            // Silently fail to not interrupt user experience
            console.error('Telemetry Log Error:', error);
        }
    } catch (e) {
        console.warn('Telemetry System Failure:', e);
    }
}
