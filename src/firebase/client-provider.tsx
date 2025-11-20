'use client';

import React, { type ReactNode } from 'react';
import { FirebaseProvider, firebaseApp, auth, firestore } from '.';

// This provider is responsible for making the singleton Firebase instances
// available to the rest of the application via React Context.
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      auth={auth}
      firestore={firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
