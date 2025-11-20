'use client';

import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
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

    // Process the redirect result from Google Sign-In
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user && firestore) {
          // This is the first sign-in after redirect
          const userRef = doc(firestore, `users/${result.user.uid}`);
          setDoc(
            userRef,
            {
              displayName: result.user.displayName,
              email: result.user.email,
              photoURL: result.user.photoURL,
              lastLogin: serverTimestamp(),
            },
            { merge: true }
          ).catch(err => console.error("Error on redirect sign-in DB write:", err));
        }
      })
      .catch((error) => {
        console.error('Error getting redirect result:', error);
      })
      .finally(() => {
        // The onAuthStateChanged listener below will handle setting the user
        // and setting loading to false, so we don't need to do it here.
        // This ensures we have a single source of truth for the auth state.
      });

    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        // This will also run after a redirect, ensuring data is updated
        // if it hasn't been set by getRedirectResult.
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
  }, [auth, firestore]);

  const signIn = async (provider: 'google') => {
    if (!auth) return;
    setLoading(true);
    const googleProvider = new GoogleAuthProvider();
    // We use signInWithRedirect which is better for mobile.
    await signInWithRedirect(auth, googleProvider);
  };

  const signOut = async () => {
    if (!auth) return;
    await auth.signOut();
  };

  return { user, loading, signIn, signOut };
}
