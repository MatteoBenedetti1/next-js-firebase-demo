import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../config/firebase";

interface UserType {
  email: string | null;
  uid: string | null;
}

const AuthContext = createContext({});

export const useAuth = () => useContext<any>(AuthContext);

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<UserType>({ email: null, uid: null });
  const [loading, setLoading] = useState<boolean>(true);

  const tenantId = process.env.TENANT_ID;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          email: user.email,
          uid: user.uid,
        });
      } else {
        setUser({ email: null, uid: null });
      }
    });
    setLoading(false);

    return () => unsubscribe();
  }, []);

  const signUp = (email: string, password: string) => {
    if (tenantId) auth.tenantId = tenantId;
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const logInWithEmail = (email: string, password: string) => {
    if (tenantId) auth.tenantId = tenantId;
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Inside AuthProvider
  const provider = new GoogleAuthProvider();

  const logInWithGoogle = () => {
    return signInWithPopup(auth, provider);
  };

  // const logInWithGoogle = () => {
  //   signInWithPopup(auth, provider)
  //     .then((result) => {
  //       // This gives you a Google Access Token. You can use it to access the Google API.
  //       const credential = GoogleAuthProvider.credentialFromResult(result);
  //       const token = credential?.accessToken;
  //       // The signed-in user info.
  //       const user = result.user;
  //       console.log({ credential, token, user });
  //     })
  //     .catch((error) => {
  //       // Handle Errors here.
  //       const errorCode = error.code;
  //       const errorMessage = error.message;
  //       // The email of the user's account used.
  //       const email = error.email;
  //       // The AuthCredential type that was used.
  //       const credential = GoogleAuthProvider.credentialFromError(error);
  //       console.log({ errorCode, errorMessage, email, credential });
  //     });
  // };

  const resetPassword = (email: string) => {
    if (tenantId) auth.tenantId = tenantId;
    return sendPasswordResetEmail(auth, email);
  };

  const logOut = async () => {
    if (tenantId) auth.tenantId = tenantId;
    setUser({ email: null, uid: null });
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signUp,
        logInWithEmail,
        logInWithGoogle,
        logOut,
        resetPassword,
      }}
    >
      {loading ? null : children}
    </AuthContext.Provider>
  );
};
