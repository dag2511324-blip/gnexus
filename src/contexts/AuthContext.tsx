import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { ensureProfileExists } from '@/lib/api/profiles';

interface User {
    id: string;
    email: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    defaultModel?: string;
    theme?: string;
    bio?: string;
    location?: string;
    website?: string;
    github?: string;
    twitter?: string;
    linkedin?: string;
    phone?: string;
    timezone?: string;
    language?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
}

interface RegisterData {
    email: string;
    password: string;
    username: string; // Kept for compatibility, mapped to metadata
    firstName?: string;
    lastName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Map Supabase user to our App user
    const mapUser = (sbUser: any): User => {
        const metadata = sbUser.user_metadata || {};
        return {
            id: sbUser.id,
            email: sbUser.email || '',
            username: metadata.username || sbUser.email?.split('@')[0] || 'User',
            firstName: metadata.first_name || '',
            lastName: metadata.last_name || '',
            avatar: metadata.avatar_url || '',
            bio: metadata.bio || '',
            location: metadata.location || '',
            website: metadata.website || '',
            github: metadata.github || '',
            twitter: metadata.twitter || '',
            linkedin: metadata.linkedin || '',
            phone: metadata.phone || '',
            timezone: metadata.timezone || 'Africa/Addis_Ababa',
            language: metadata.language || 'en',
            theme: metadata.theme || 'dark',
            defaultModel: metadata.default_model || 'planner',
        };
    };

    useEffect(() => {
        let isMounted = true;

        // 1. Check active session
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user && isMounted) {
                    console.log('✅ Found active user:', session.user.email);
                    setUser(mapUser(session.user));

                    // Sync profile in background
                    ensureProfileExists(session.user.id, session.user.email || '').catch(e =>
                        console.warn('Initial profile sync failed:', e)
                    );
                }
            } catch (error) {
                console.error('Error checking session:', error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        checkSession();

        // 2. Listen for auth changes (Login, Logout, OAuth Redirects)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('🔄 Auth State Changed:', event, !!session);

            if (session?.user) {
                if (isMounted) {
                    setUser(mapUser(session.user));
                    setLoading(false);
                }

                // Sync profile in background
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    ensureProfileExists(session.user.id, session.user.email || '').catch(e =>
                        console.warn('Event profile sync failed:', e)
                    );
                }
            } else if (event === 'SIGNED_OUT') {
                if (isMounted) {
                    setUser(null);
                    setLoading(false);
                }

                // Only navigate if we're on a protected route
                const publicPaths = ['/', '/login', '/register', '/auth', '/about', '/contact', '/blog', '/team', '/careers', '/faq', '/documentation', '/status', '/portfolio', '/web-development', '/3d-architecture', '/ai-automation', '/gnexus'];
                if (!publicPaths.includes(window.location.pathname)) {
                    navigate('/login');
                }
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [navigate]);

    const login = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw new Error(error.message);
    };

    const register = async (data: RegisterData) => {
        const { error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    username: data.username,
                    first_name: data.firstName,
                    last_name: data.lastName,
                },
            },
        });

        if (error) throw new Error(error.message);
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    const updateProfile = async (data: Partial<User>) => {
        try {
            // Update auth metadata
            const { error: authError } = await supabase.auth.updateUser({
                data: {
                    username: data.username,
                    first_name: data.firstName,
                    last_name: data.lastName,
                    avatar_url: data.avatar,
                    bio: data.bio,
                    location: data.location,
                    website: data.website,
                    github: data.github,
                    twitter: data.twitter,
                    linkedin: data.linkedin,
                    phone: data.phone,
                    timezone: data.timezone,
                    language: data.language,
                    theme: data.theme,
                    default_model: data.defaultModel,
                }
            });

            if (authError) throw authError;

            // Also update the public profiles table with available fields
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    full_name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
                    avatar_url: data.avatar,
                })
                .eq('id', user?.id || '');

            if (profileError) {
                console.warn('Profile table update failed, but auth metadata updated:', profileError);
            }

            await refreshUser();
        } catch (error: any) {
            console.error('Update profile error:', error);
            throw new Error(error.message || 'Failed to update profile');
        }
    };

    const refreshUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUser(mapUser(user));
        }
    };

    const value: AuthContextType = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
