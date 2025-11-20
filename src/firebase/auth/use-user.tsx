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
    // If auth is not yet available, we are still in a loading state.
    // The effect will re-run when auth is initialized.
    if (!auth) {
      return;
    }

    // onAuthStateChanged is the single source of truth.
    // It fires on sign-in, sign-out, and after a redirect.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        // Create or update the user's document in Firestore.
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
      // This is the definitive point where we know the auth state is resolved.
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth, firestore]); // The key change is re-running this effect when `auth` becomes available.

  const signIn = async (provider: 'google') => {
    if (!auth) return;
    setLoading(true);
    const googleProvider = new GoogleAuthProvider();
    // Use signInWithRedirect for a better mobile experience.
    await signInWithRedirect(auth, googleProvider);
  };

  const signOut = async () => {
    if (!auth) return;
    await auth.signOut();
  };

  return { user, loading, signIn, signOut };
}
