export interface User {
    id: string;
    username: string;
    avatar_url: string | null;
    created_at: string;
}

export interface Chat {
    id: string;
    user1_id: string;
    user2_id: string;
    created_at: string;
    // Joined fields
    other_user?: User;
    last_message?: Message;
}

export interface Message {
    id: string;
    chat_id: string;
    sender_id: string;
    content: string;
    created_at: string;
    is_read: boolean;
}

// Navigation types
export type RootStackParamList = {
    Splash: undefined;
    Calculator: undefined;
    Auth: undefined;
    Main: undefined;
};

export type AuthStackParamList = {
    Login: undefined;
};

export type MainTabParamList = {
    ChatListTab: undefined;
    Profile: undefined;
};

export type ChatStackParamList = {
    ChatList: undefined;
    Chat: { chatId: string; otherUser: User };
    NewChat: undefined;
};
