import {
    getAuth,
    onAuthStateChanged,
    getRedirectResult,
    signInWithCredential,
} from 'firebase/auth';
const auth = getAuth();
export { auth, onAuthStateChanged, getRedirectResult, signInWithCredential };
