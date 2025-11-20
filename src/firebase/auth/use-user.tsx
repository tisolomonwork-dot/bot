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

    const processRedirect = async () => {
        try {
            const result = await getRedirectResult(auth);
            if (result && result.user && firestore) {
                // This is the first sign-in after redirect
                const userRef = doc(firestore, `users/${result.user.uid}`);
                await setDoc(
                    userRef,
                    {
                        displayName: result.user.displayName,
                        email: result.user.email,
                        photoURL: result.user.photoURL,
                        lastLogin: serverTimestamp(),
                    },
                    { merge: true }
                );
            }
        } catch (error) {
            console.error('Error getting redirect result:', error);
        } finally {
             // Let onAuthStateChanged handle the final state
        }
    }

    processRedirect();

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
          ).catch(err => console.error("Error updating user doc:", err));
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  const signIn = async (provider: 'google') => {
    if (!auth) return;
    setLoading(true);
    const googleProvider = new GoogleAuthProvider();
    await signInWithRedirect(auth, googleProvider);
    // The user will be redirected, and the result will be handled
    // by getRedirectResult when they return to the app.
  };

  const signOut = async () => {
    if (!auth) return;
    await auth.signOut();
  };

  return { user, loading, signIn, signOut };
}
