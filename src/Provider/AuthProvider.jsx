import { createContext, useEffect, useState } from "react";
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { app } from "./firebase.js";
const provider = new GoogleAuthProvider();

export const AuthContext = createContext(null);
const auth = getAuth(app);
const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
const createUser = (email, password) =>{
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
};

const signIn = (email, password) =>{
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);

};
const googleSignIn = () =>{
    setLoading(true);
    return signInWithPopup(auth, provider)
};
const resetPassword =(email) =>{
    return sendPasswordResetEmail(auth, email);
};

const logOut = () =>{
    setLoading(true);
    localStorage.removeItem('access-token');
    return signOut(auth);

};

    useEffect(()=>{
       const unsubscribe = onAuthStateChanged(auth, currentUser =>{
           setUser(currentUser);
           console.log('current user', currentUser);
           setLoading(false); 
        });
        return () =>{
            return unsubscribe();
        }

    },[])

    const authInfo = {
        user,
        loading,
        createUser,
        signIn,
        logOut,
        googleSignIn,
        resetPassword

    }
    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;