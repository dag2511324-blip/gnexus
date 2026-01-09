import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export async function fetchProfile(userId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
    return data;
}

export async function createProfile(userId: string, email: string) {
    const { data, error } = await supabase
        .from('profiles')
        .insert({
            id: userId,
            email: email,
            full_name: '',
            avatar_url: null,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating profile:', error);
        throw error;
    }
    return data;
}

export async function updateProfile(userId: string, data: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>) {
    const { data: updatedData, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
    return updatedData;
}

export async function ensureProfileExists(userId: string, email: string) {
    try {
        const existingProfile = await fetchProfile(userId);
        if (!existingProfile) {
            await createProfile(userId, email);
        }
        return await fetchProfile(userId);
    } catch (error) {
        console.error('Error ensuring profile exists:', error);
        throw error;
    }
}

export async function updateUserMetadata(metadata: Record<string, any>) {
    const { data: { user }, error } = await supabase.auth.updateUser({
        data: metadata
    });

    if (error) {
        console.error('Error updating user metadata:', error);
        throw error;
    }
    return user;
}

export async function uploadAvatar(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('portfolio-images') // Reusing existing bucket or we should use a dedicated one if exists
        .upload(filePath, file);

    if (uploadError) {
        throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(filePath);

    return publicUrl;
}
