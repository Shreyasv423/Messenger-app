import { db } from '../config/firebase';
import { Message } from '../types';
import { 
    collection, 
    query, 
    where, 
    orderBy, 
    getDocs, 
    addDoc, 
    onSnapshot, 
    doc, 
    updateDoc, 
    serverTimestamp,
    Timestamp 
} from 'firebase/firestore';

export async function getMessages(chatId: string): Promise<Message[]> {
    const messagesRef = collection(db, 'messages');
    const q = query(
        messagesRef,
        where('chat_id', '==', chatId),
        orderBy('created_at', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        created_at: (doc.data().created_at as Timestamp)?.toDate().toISOString() || new Date().toISOString()
    } as Message));
}

export async function sendMessage(
    chatId: string,
    senderId: string,
    content: string
): Promise<Message> {
    const messagesRef = collection(db, 'messages');
    const newMessage = {
        chat_id: chatId,
        sender_id: senderId,
        content: content.trim(),
        created_at: serverTimestamp(),
        is_read: false,
    };

    const docRef = await addDoc(messagesRef, newMessage);
    return { 
        id: docRef.id, 
        ...newMessage, 
        created_at: new Date().toISOString() 
    } as Message;
}

export function subscribeToMessages(
    chatId: string,
    onNewMessage: (message: Message) => void
): () => void {
    const messagesRef = collection(db, 'messages');
    const q = query(
        messagesRef,
        where('chat_id', '==', chatId),
        orderBy('created_at', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const data = change.doc.data();
                onNewMessage({ 
                    id: change.doc.id, 
                    ...data,
                    created_at: (data.created_at as Timestamp)?.toDate().toISOString() || new Date().toISOString()
                } as Message);
            }
        });
    });

    return unsubscribe;
}

export async function markAsRead(messageId: string): Promise<void> {
    const docRef = doc(db, 'messages', messageId);
    await updateDoc(docRef, { is_read: true });
}

export function unsubscribe(unsubscribeFn: () => void): void {
    unsubscribeFn();
}
