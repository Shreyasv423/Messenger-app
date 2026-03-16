import { auth, db } from '../config/firebase';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export async function signUp(email: string, password: string, username: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user) throw new Error('Sign up failed');

    // Create user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        username,
        email,
        created_at: new Date().toISOString(),
    });

    return user;
}

export async function signIn(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
}

export async function signOut() {
    await firebaseSignOut(auth);
}

export async function getCurrentUser() {
    return auth.currentUser;
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
    return onAuthStateChanged(auth, (user) => {
        // Map Firebase user to a structure similar to what the app expects
        callback(user ? 'SIGNED_IN' : 'SIGNED_OUT', user ? { user } : null);
    });
}
