'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

  const handleUser = useCallback(async (user: User | null) => {
    if (user && firestore) {
      const userRef = doc(firestore, `users/${user.uid}`);
      try {
        await setDoc(
          userRef,
          {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            lastLogin: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (err) {
        console.error("Error updating user doc:", err);
      }
    }
    setUser(user);
    setLoading(false);
  }, [firestore]);


  useEffect(() => {
    if (!auth) return;

    // Handle the redirect result
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          handleUser(result.user);
        }
      })
      .catch((error) => {
        console.error("Error during redirect result:", error);
      })
      .finally(() => {
         // The onAuthStateChanged listener will handle setting the final state.
         // We still need to set loading to false in case there is no redirect result but a user is already signed in.
         const unsubscribe = onAuthStateChanged(auth, (user) => {
            handleUser(user);
            unsubscribe();
        });
      });
      
  }, [auth, handleUser]);

  const signIn = async (provider: 'google') => {
    if (!auth) return;
    setLoading(true);
    const googleProvider = new GoogleAuthProvider();
    await signInWithRedirect(auth, googleProvider);
  };

  const signOut = async () => {
    if (!auth) return;
    await auth.signOut();
    setUser(null);
  };

  return { user, loading, signIn, signOut };
}
