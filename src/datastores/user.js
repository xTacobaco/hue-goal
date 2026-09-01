import { defineStore } from "pinia";
import {
  GoogleAuthProvider,
  linkWithPopup,
  onIdTokenChanged,
  signInAnonymously,
  signInWithCredential,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "@/utils/config";
import { mergeTracksIntoUser, readUserProgress } from "@/datastores/dates";
import animations from "@/utils/animations";

let unsubAuth = null;

function toUser(firebaseUser) {
  if (!firebaseUser) {
    return null;
  }
  return { id: firebaseUser.uid, email: firebaseUser.email };
}

const ignoredAuthCodes = new Set([
  "auth/popup-closed-by-user",
  "auth/cancelled-popup-request",
]);

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null,
    authReady: false,
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.user && state.user.email),
  },
  actions: {
    listen() {
      if (unsubAuth) {
        return;
      }
      unsubAuth = onIdTokenChanged(auth, (firebaseUser) => {
        this.user = toUser(firebaseUser);
        this.authReady = true;
        if (!firebaseUser) {
          animations.startAtMiddle();
        }
      });
    },
    async tempSignIn() {
      const { user } = await signInAnonymously(auth);
      return user.uid;
    },
    async signIn() {
      try {
        if (auth.currentUser?.isAnonymous) {
          await linkWithPopup(auth.currentUser, googleProvider);
        } else {
          await signInWithPopup(auth, googleProvider);
        }
      } catch (error) {
        if (ignoredAuthCodes.has(error.code)) {
          return;
        }
        if (
          error.code === "auth/credential-already-in-use" ||
          error.code === "auth/email-already-in-use"
        ) {
          await this.signInExistingGoogle(error);
          return;
        }
        throw error;
      }
    },
    async signInExistingGoogle(error) {
      const credential = GoogleAuthProvider.credentialFromError(error);
      if (!credential) {
        throw error;
      }

      const anonUid = auth.currentUser?.isAnonymous ? auth.currentUser.uid : null;
      const prev = anonUid
        ? await readUserProgress(anonUid)
        : { tracks: {}, lists: [] };

      await signInWithCredential(auth, credential);

      const nextUid = auth.currentUser?.uid;
      if (anonUid && nextUid && anonUid !== nextUid) {
        await mergeTracksIntoUser(nextUid, prev.tracks, prev.lists);
      }
    },
    async signOut() {
      await signOut(auth);
    },
  },
});
