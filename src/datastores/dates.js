import { defineStore } from "pinia";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/utils/config";
import animations from "@/utils/animations";

let unsubDates = null;

function tracksFromSnap(snap) {
  return snap.data()?.tracks || {};
}

export async function readTracks(userId) {
  if (!userId) {
    return {};
  }
  const snap = await getDoc(doc(db, "users", userId));
  return tracksFromSnap(snap);
}

export async function mergeTracksIntoUser(userId, extraTracks) {
  if (!userId) {
    return;
  }

  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);
  const current = tracksFromSnap(snap);
  const merged = {};
  const keys = new Set(
    [...Object.keys(current), ...Object.keys(extraTracks || {})].filter(
      (key) => key === "goal" || key === "task",
    ),
  );

  for (const key of keys) {
    merged[key] = [
      ...new Set([...(current[key] || []), ...((extraTracks || {})[key] || [])]),
    ].sort((a, b) => a - b);
  }

  await setDoc(ref, { tracks: merged });
}

export const useDatesStore = defineStore("dates", {
  state: () => ({
    tracks: {},
    list: "goal",
  }),
  getters: {
    dates: (state) =>
      (state.tracks[state.list] || []).map((timestamp) => ({ timestamp })),
  },
  actions: {
    setList(list) {
      this.list = list || "goal";
      animations.startAtCurrentDay();
    },
    watchUser(userId) {
      if (unsubDates) {
        unsubDates();
        unsubDates = null;
      }

      if (!userId) {
        this.tracks = {};
        return;
      }

      unsubDates = onSnapshot(
        doc(db, "users", userId),
        (snap) => {
          this.tracks = tracksFromSnap(snap);
          animations.startAtCurrentDay();
        },
        () => {},
      );
    },
    async finishTask({ userId, date, list }) {
      if (!userId) {
        return;
      }

      const listName = list || "goal";
      this.list = listName;
      const ref = doc(db, "users", userId);
      const document = await getDoc(ref);

      if (document.exists()) {
        await updateDoc(ref, {
          [`tracks.${listName}`]: arrayUnion(date.unix()),
        });
      } else {
        await setDoc(ref, {
          tracks: {
            [listName]: [date.unix()],
          },
        });
      }
    },
  },
});
