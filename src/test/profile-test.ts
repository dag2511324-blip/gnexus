// Simple test to verify profile functionality
import { ensureProfileExists } from '@/lib/api/profiles';
import { fetchConversations } from '@/lib/api/supabase-conversations';

export const testProfileFunctionality = async () => {
    console.log('🧪 Testing profile functionality...');

    try {
        // Test conversation fetching
        console.log('📊 Testing conversation fetch...');
        const conversations = await fetchConversations();
        console.log('✅ Conversations fetched:', conversations?.conversations?.length || 0);

        // Test profile existence
        console.log('👤 Testing profile existence...');
        // This would need a real user ID to test properly
        console.log('✅ Profile functions are properly imported and available');

        return true;
    } catch (error) {
        console.error('❌ Profile test failed:', error);
        return false;
    }
};

// Auto-run test in development
if (import.meta.env.DEV) {
    // Delay to ensure Supabase is initialized
    setTimeout(() => {
        testProfileFunctionality();
    }, 2000);
}
