import {
  getAuth,
  GoogleAuthProvider,
  signInAnonymously,
  linkWithCredential,
  signInWithRedirect,
  signInWithCredential,
} from "firebase/auth";

const auth = getAuth();
const provider = new GoogleAuthProvider();

export default {
  state: {
    user: null,
  },
  mutations: {
    setUser(state, data) {
      state.user = data;
    },
  },
  actions: {
    signIn({ commit }) {
      signInWithRedirect(auth, provider).then((user) => {
        const credential = GoogleAuthProvider.credential(
          user.getAuthResponse().id_token
        );
        linkWithCredential(auth.currentUser, credential);
        commit("setUser", { id: user.uid, email: user.email });
      });
    },
    tempSignIn({ commit }, callback) {
      signInAnonymously(auth).then((credential) => {
        let user = credential.user;
        commit("setUser", { id: user.uid, email: user.email });
        callback(user.uid)
      });
    },
    autoSignIn({ commit }, user) {
      commit("setUser", { id: user.uid, email: user.email });
    },
    handleRedirect({ commit }, error) {
      const credential = GoogleAuthProvider.credentialFromError(error);
      if (credential) {
        signInWithCredential(auth, credential).then((user) => {
          commit("setUser", { id: user.uid, email: user.email });
        });
      }
    },
    signOut({ commit }) {
      auth.signOut();
      commit("setUser", null);
    },
  },
  getters: {
    user(state) {
      return state.user;
    },
    isLoggedIn(state) {
      return state.user && state.user.email;
    },
  },
};
