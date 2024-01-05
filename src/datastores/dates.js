import fb from '@/utils/config';
import animations from '@/utils/animations';
import { getFirestore, getDoc, setDoc, updateDoc, doc, arrayUnion, getDocFromServer } from 'firebase/firestore';

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
        async addDate(state, { userId, date, list }) {
            if (userId) {
                const ref = doc(db, 'users', userId);
                const document = await getDoc(ref);

                if (document.exists()) {
                    await updateDoc(ref, {
                        [`tracks.${(list || 'goal')}`]: arrayUnion(date.unix())
                    });
                } else {
                    await setDoc(ref, {
                        tracks: {
                            [list || 'goal']: [date.unix()]
                        } 
                    });
                }

                const updated = await getDocFromServer(doc(db, 'users', userId));
                const dates = updated.data()?.tracks?.[list || 'goal']?.map(d => { return { timestamp: d } }) || [];
                state.dates = dates;
                animations.startAtCurrentDay();
            }
        }
    },
    actions: {
        async fetchDates({ commit }, { userId, list }) {
            if (userId) {
                const document = await getDoc(doc(db, 'users', userId));
                const dates = document.data()?.tracks?.[list || 'goal']?.map(d => { return { timestamp: d } }) || [];
                commit('setDates', dates);
            }
        },
        finishTask({ commit }, { userId, date, list }) {
            commit('addDate', { userId, date, list });
        }
    },
    getters: {
        dates(state) {
            return state.dates;
        },
    },
};
