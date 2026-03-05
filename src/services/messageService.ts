import { supabase } from '../config/supabase';
import { Message } from '../types';
import { RealtimeChannel } from '@supabase/supabase-js';

export async function getMessages(chatId: string): Promise<Message[]> {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function sendMessage(
    chatId: string,
    senderId: string,
    content: string
): Promise<Message> {
    const { data, error } = await supabase
        .from('messages')
        .insert({
            chat_id: chatId,
            sender_id: senderId,
            content: content.trim(),
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export function subscribeToMessages(
    chatId: string,
    onNewMessage: (message: Message) => void
): RealtimeChannel {
    const channel = supabase
        .channel(`messages:${chatId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `chat_id=eq.${chatId}`,
            },
            (payload) => {
                onNewMessage(payload.new as Message);
            }
        )
        .subscribe();

    return channel;
}

export async function markAsRead(messageId: string): Promise<void> {
    const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);

    if (error) throw error;
}

export function unsubscribe(channel: RealtimeChannel): void {
    supabase.removeChannel(channel);
}
