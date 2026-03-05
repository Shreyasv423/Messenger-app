import { supabase } from '../config/supabase';
import { Chat } from '../types';

export async function getChats(userId: string): Promise<Chat[]> {
    // Fetch chats where current user is either user1 or user2
    const { data, error } = await supabase
        .from('chats')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    // Enrich chats with other user info and last message
    const enrichedChats = await Promise.all(
        data.map(async (chat) => {
            const otherUserId = chat.user1_id === userId ? chat.user2_id : chat.user1_id;

            // Get other user profile
            const { data: otherUser } = await supabase
                .from('users')
                .select('*')
                .eq('id', otherUserId)
                .single();

            // Get last message
            const { data: lastMessage } = await supabase
                .from('messages')
                .select('*')
                .eq('chat_id', chat.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            return {
                ...chat,
                other_user: otherUser || undefined,
                last_message: lastMessage || undefined,
            };
        })
    );

    return enrichedChats;
}

export async function createChat(user1Id: string, user2Id: string): Promise<Chat> {
    // Check if chat already exists (in either direction)
    const { data: existing } = await supabase
        .from('chats')
        .select('*')
        .or(
            `and(user1_id.eq.${user1Id},user2_id.eq.${user2Id}),and(user1_id.eq.${user2Id},user2_id.eq.${user1Id})`
        )
        .single();

    if (existing) return existing;

    const { data, error } = await supabase
        .from('chats')
        .insert({ user1_id: user1Id, user2_id: user2Id })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getChatById(chatId: string): Promise<Chat | null> {
    const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .single();

    if (error) throw error;
    return data;
}
