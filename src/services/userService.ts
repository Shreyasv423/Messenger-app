import { db } from '../config/firebase';
import { User } from '../types';
import { 
    doc, 
    getDoc, 
    updateDoc, 
    collection, 
    query, 
    where, 
    getDocs, 
    limit,
    orderBy,
    startAt,
    endAt,
    Timestamp
} from 'firebase/firestore';

export async function getProfile(userId: string): Promise<User | null> {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;
    
    const data = docSnap.data();
    return { 
        id: docSnap.id, 
        ...data,
        created_at: (data.created_at as Timestamp)?.toDate().toISOString() || new Date().toISOString()
    } as User;
}

export async function updateProfile(
    userId: string,
    updates: { username?: string; avatar_url?: string }
): Promise<User> {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, updates);
    
    const docSnap = await getDoc(docRef);
    const data = docSnap.data()!;
    return { 
        id: docSnap.id, 
        ...data,
        created_at: (data.created_at as Timestamp)?.toDate().toISOString() || new Date().toISOString()
    } as User;
}

export async function searchUsers(queryStr: string, currentUserId: string): Promise<User[]> {
    const usersRef = collection(db, 'users');
    let q;
    
    if (queryStr.trim()) {
        // Simple prefix search as Firestore doesn't support 'ilike'
        const lowerQuery = queryStr.toLowerCase();
        q = query(
            usersRef,
            orderBy('username'),
            startAt(lowerQuery),
            endAt(lowerQuery + '\uf8ff'),
            limit(20)
        );
    } else {
        q = query(usersRef, limit(20));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
        .map(doc => {
            const data = doc.data();
            return { 
                id: doc.id, 
                ...data,
                created_at: (data.created_at as Timestamp)?.toDate().toISOString() || new Date().toISOString()
            } as User;
        })
        .filter(user => user.id !== currentUserId);
}
