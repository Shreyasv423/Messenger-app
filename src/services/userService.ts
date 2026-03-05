import { supabase } from '../config/supabase';
import { User } from '../types';

export async function getProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) throw error;
    return data;
}

export async function updateProfile(
    userId: string,
    updates: { username?: string; avatar_url?: string }
): Promise<User> {
    const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function searchUsers(query: string, currentUserId: string): Promise<User[]> {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('username', `%${query}%`)
        .neq('id', currentUserId)
        .limit(20);

    if (error) throw error;
    return data || [];
}
