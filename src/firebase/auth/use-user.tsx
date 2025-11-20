'use client';

import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithRedirect,
  GoogleAuthProvider,
  getRedirectResult,
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
    if (!auth) return;

    // First, check for redirect result. This is crucial for the redirect flow.
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user && firestore) {
          // User signed in via redirect. Update their doc.
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
          ).catch(err => console.error("Error updating user doc on redirect:", err));
        }
      })
      .catch((error) => {
        console.error("Error with getRedirectResult: ", error);
      })
      .finally(() => {
        // Now set up the permanent auth state listener.
        // This will also catch the user from the redirect result if it was successful.
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            setUser(user);
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
        return () => unsubscribe();
      });
  }, [auth, firestore]);

  const signIn = async (provider: 'google') => {
    if (!auth) return;
    setLoading(true);
    const googleProvider = new GoogleAuthProvider();
    await signInWithRedirect(auth, googleProvider);
  };

  const signOut = async () => {
    if (!auth) return;
    await auth.signOut();
  };

  return { user, loading, signIn, signOut };
}
