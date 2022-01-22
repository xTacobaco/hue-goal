import fb from '@/utils/config';
import animations from '@/utils/animations';
import { getFirestore, getDocs, setDoc, doc, collection } from 'firebase/firestore';

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
                const ref = doc(db, 'users', userId, 'dates', date.format('YYYY-MM-DD'));
                await setDoc(ref, { timestamp: date.unix() });
            }
        }
    },
    actions: {
        async fetchDates({ commit }, userId) {
            if (userId) {
                const snapshots = await getDocs(
                    collection(db, 'users', userId, 'dates'),
                );
                const dates = snapshots.docs.map((doc) => doc.data());
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
