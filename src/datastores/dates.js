import fb from '@/utils/config';
import animations from '@/utils/animations';
import { getFirestore, getDoc, updateDoc, doc, arrayUnion } from 'firebase/firestore';

const db = getFirestore(fb);

export default {
    state: {
        dates: [],
    },
    mutations: {
        setDates(state, dates) {
            state.dates = dates;
            animations.startAtCurrentDay();
        },
        async addDate(state, { userId, date }) {
            if (userId) {
                const ref = doc(db, 'users', userId);
                await updateDoc(ref, {
                    "tracks.goal": arrayUnion(date.unix())
                });
            }
        }
    },
    actions: {
        async fetchDates({ commit }, userId) {
            if (userId) {
                const document = await getDoc(doc(db, 'users', userId));
                const dates = document.data().tracks?.goal?.map(d => { return { timestamp: d } }) || [];
                commit('setDates', dates);
            }
        },
        finishTask({ commit }, { userId, date }) {
            commit('addDate', { userId, date });
        }
    },
    getters: {
        dates(state) {
            return state.dates;
        },
    },
};
