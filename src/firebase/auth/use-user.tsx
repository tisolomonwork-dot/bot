'use client';

import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithRedirect,
  GoogleAuthProvider,
  type User,
} from 'firebase/auth';
import { useAuth, useFirestore } from '..';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = useAuth();
  const firestore = useFirestore();

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    // onAuthStateChanged is the single source of truth for the user's auth state.
    // It fires on sign-in, sign-out, and when the app loads, handling the result of a redirect.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        // If the user is signed in, create or update their document in Firestore.
        if (firestore) {
          const userRef = doc(firestore, `users/${user.uid}`);
          setDoc(
            userRef,
            {
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              lastLogin: serverTimestamp(),
            },
            { merge: true }
          ).catch(err => console.error("Error updating user doc on auth state change:", err));
        }
      } else {
        setUser(null);
      }
      // This is the definitive point where we know the auth state is resolved,
      // so we can stop the loading indicator.
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth, firestore]);

  const signIn = async (provider: 'google') => {
    if (!auth) return;
    setLoading(true);
    const googleProvider = new GoogleAuthProvider();
    // Use signInWithRedirect for a more robust mobile experience.
    await signInWithRedirect(auth, googleProvider);
  };

  const signOut = async () => {
    if (!auth) return;
    await auth.signOut();
  };

  return { user, loading, signIn, signOut };
}
