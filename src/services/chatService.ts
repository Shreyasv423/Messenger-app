import { db } from '../config/firebase';
import { Chat, User, Message } from '../types';
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    addDoc, 
    orderBy, 
    limit, 
    getDoc, 
    doc,
    or,
    and,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';

export async function getChats(userId: string): Promise<Chat[]> {
    const chatsRef = collection(db, 'chats');
    const q = query(
        chatsRef,
        or(
            where('user1_id', '==', userId),
            where('user2_id', '==', userId)
        ),
        orderBy('created_at', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const chats = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        created_at: (doc.data().created_at as Timestamp)?.toDate().toISOString() || new Date().toISOString()
    } as Chat));

    // Enrich chats with other user info and last message
    const enrichedChats = await Promise.all(
        chats.map(async (chat) => {
            const otherUserId = chat.user1_id === userId ? chat.user2_id : chat.user1_id;

            // Get other user profile
            const userDoc = await getDoc(doc(db, 'users', otherUserId));
            const otherUser = userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } as User : undefined;

            // Get last message
            const messagesRef = collection(db, 'messages');
            const lastMsgQ = query(
                messagesRef,
                where('chat_id', '==', chat.id),
                orderBy('created_at', 'desc'),
                limit(1)
            );
            const lastMsgSnapshot = await getDocs(lastMsgQ);
            const lastMessage = !lastMsgSnapshot.empty 
                ? { 
                    id: lastMsgSnapshot.docs[0].id, 
                    ...lastMsgSnapshot.docs[0].data(),
                    created_at: (lastMsgSnapshot.docs[0].data().created_at as Timestamp)?.toDate().toISOString() || new Date().toISOString()
                } as Message 
                : undefined;

            return {
                ...chat,
                other_user: otherUser,
                last_message: lastMessage,
            };
        })
    );

    return enrichedChats;
}

export async function createChat(user1Id: string, user2Id: string): Promise<Chat> {
    const chatsRef = collection(db, 'chats');
    
    // Check if chat already exists
    const q1 = query(
        chatsRef,
        where('user1_id', '==', user1Id),
        where('user2_id', '==', user2Id)
    );
    const q2 = query(
        chatsRef,
        where('user1_id', '==', user2Id),
        where('user2_id', '==', user1Id)
    );

    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    
    if (!snap1.empty) return { id: snap1.docs[0].id, ...snap1.docs[0].data() } as Chat;
    if (!snap2.empty) return { id: snap2.docs[0].id, ...snap2.docs[0].data() } as Chat;

    const newChat = {
        user1_id: user1Id,
        user2_id: user2Id,
        created_at: serverTimestamp(),
    };

    const docRef = await addDoc(chatsRef, newChat);
    const docSnap = await getDoc(docRef);
    
    return { 
        id: docRef.id, 
        ...docSnap.data(),
        created_at: new Date().toISOString() // fallback for immediate return
    } as Chat;
}

export async function getChatById(chatId: string): Promise<Chat | null> {
    const docRef = doc(db, 'chats', chatId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    return { 
        id: docSnap.id, 
        ...docSnap.data(),
        created_at: (docSnap.data().created_at as Timestamp)?.toDate().toISOString() || new Date().toISOString()
    } as Chat;
}
