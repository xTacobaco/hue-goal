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
import dayjs from "@/utils/dayjs";
import animations from "@/utils/animations";

let unsubDates = null;

const LABEL_MAX = 20;
const MAX_ACTIVE_LISTS = 20;
const MAX_LISTS = 50;
const LIST_ID_RE = /^[a-zA-Z0-9_]+$/;

export function defaultLists() {
  return [
    { id: "goal", label: "Goal", createdAt: 0, deletedAt: null },
  ];
}

function normalizeList(list) {
  return {
    id: list.id,
    label: list.label || list.id,
    createdAt: list.createdAt ?? 0,
    deletedAt: list.deletedAt ?? null,
  };
}

export function synthesizeLists(tracks) {
  const byId = new Map(defaultLists().map((list) => [list.id, list]));
  for (const id of Object.keys(tracks || {})) {
    if (!LIST_ID_RE.test(id) || byId.has(id)) {
      continue;
    }
    byId.set(id, {
      id,
      label: id,
      createdAt: 0,
      deletedAt: null,
    });
  }
  return [...byId.values()];
}

function listsFromData(data) {
  if (Array.isArray(data?.lists) && data.lists.length > 0) {
    return data.lists.map(normalizeList);
  }
  return synthesizeLists(data?.tracks);
}

function tracksFromSnap(snap) {
  return snap.data()?.tracks || {};
}

function listsFromSnap(snap) {
  return listsFromData(snap.data());
}

function startOfDayUnix(unix) {
  return dayjs.unix(unix || 0).startOf("date").unix();
}

export function mergeListsById(current, extra) {
  const byId = new Map();
  for (const list of [...(current || []), ...(extra || [])]) {
    if (!list?.id) {
      continue;
    }
    const incoming = normalizeList(list);
    const existing = byId.get(incoming.id);
    if (!existing) {
      byId.set(incoming.id, incoming);
      continue;
    }
    byId.set(incoming.id, {
      id: incoming.id,
      label: existing.label || incoming.label,
      createdAt: Math.min(existing.createdAt, incoming.createdAt),
      deletedAt:
        existing.deletedAt == null || incoming.deletedAt == null
          ? null
          : Math.max(existing.deletedAt, incoming.deletedAt),
    });
  }
  return [...byId.values()];
}

function newListId(existingIds) {
  const ids = new Set(existingIds);
  for (let i = 0; i < 32; i++) {
    const id = `l${Math.random().toString(36).slice(2, 10)}`;
    if (LIST_ID_RE.test(id) && !ids.has(id)) {
      return id;
    }
  }
  return `l${Date.now().toString(36)}`;
}

export async function readUserProgress(userId) {
  if (!userId) {
    return { tracks: {}, lists: [] };
  }
  const snap = await getDoc(doc(db, "users", userId));
  return {
    tracks: tracksFromSnap(snap),
    lists: listsFromSnap(snap),
  };
}

export async function readTracks(userId) {
  const { tracks } = await readUserProgress(userId);
  return tracks;
}

export async function mergeTracksIntoUser(userId, extraTracks, extraLists) {
  if (!userId) {
    return;
  }

  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);
  const current = tracksFromSnap(snap);
  const extra = extraTracks || {};
  const merged = {};
  const keys = new Set([...Object.keys(current), ...Object.keys(extra)]);

  for (const key of keys) {
    merged[key] = [
      ...new Set([...(current[key] || []), ...(extra[key] || [])]),
    ].sort((a, b) => a - b);
  }

  const currentLists = snap.exists()
    ? listsFromData(snap.data())
    : synthesizeLists(current);
  const incomingLists =
    extraLists && extraLists.length > 0
      ? extraLists
      : synthesizeLists(extra);

  await setDoc(ref, {
    tracks: merged,
    lists: mergeListsById(currentLists, incomingLists),
  });
}

export const useDatesStore = defineStore("dates", {
  state: () => ({
    tracks: {},
    lists: defaultLists(),
    list: "goal",
  }),
  getters: {
    dates: (state) =>
      (state.tracks[state.list] || []).map((timestamp) => ({ timestamp })),
    activeLists: (state) =>
      state.lists.filter((list) => list.deletedAt == null),
    allDoneUnix: (state) => {
      const trackSets = {};
      const allTs = new Set();
      for (const [id, stamps] of Object.entries(state.tracks)) {
        trackSets[id] = new Set(stamps || []);
        for (const stamp of stamps || []) {
          allTs.add(stamp);
        }
      }

      const result = new Set();
      for (const day of allTs) {
        const applicable = state.lists.filter((list) => {
          const created = startOfDayUnix(list.createdAt);
          const deleted =
            list.deletedAt == null ? null : startOfDayUnix(list.deletedAt);
          return created <= day && (deleted === null || deleted > day);
        });
        if (
          applicable.length >= 2 &&
          applicable.every((list) => trackSets[list.id]?.has(day))
        ) {
          result.add(day);
        }
      }
      return result;
    },
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
        this.lists = defaultLists();
        this.list = "goal";
        return;
      }

      unsubDates = onSnapshot(
        doc(db, "users", userId),
        (snap) => {
          if (!snap.exists()) {
            return;
          }
          this.tracks = tracksFromSnap(snap);
          this.lists = listsFromSnap(snap);
          const active = this.lists.filter((list) => list.deletedAt == null);
          if (!active.some((list) => list.id === this.list) && active[0]) {
            this.list = active[0].id;
          }
          animations.startAtCurrentDay();
        },
        () => {},
      );
    },
    async persistLists(userId, lists) {
      const ref = doc(db, "users", userId);
      const document = await getDoc(ref);
      if (document.exists()) {
        await updateDoc(ref, { lists });
      } else {
        await setDoc(ref, {
          lists,
          tracks: this.tracks || {},
        });
      }
    },
    async addList({ userId, label }) {
      if (!userId) {
        return null;
      }

      const trimmed = (label || "").trim().slice(0, LABEL_MAX);
      if (!trimmed) {
        return null;
      }

      const active = this.lists.filter((list) => list.deletedAt == null);
      if (active.length >= MAX_ACTIVE_LISTS || this.lists.length >= MAX_LISTS) {
        return null;
      }

      const entry = {
        id: newListId(this.lists.map((list) => list.id)),
        label: trimmed,
        createdAt: dayjs().unix(),
        deletedAt: null,
      };
      const previousLists = this.lists;
      const previousSelected = this.list;
      const lists = [...this.lists, entry];
      this.lists = lists;
      this.list = entry.id;

      try {
        await this.persistLists(userId, lists);
        return entry;
      } catch (error) {
        this.lists = previousLists;
        this.list = previousSelected;
        throw error;
      }
    },
    async removeList({ userId, id }) {
      if (!userId || !id) {
        return false;
      }

      const active = this.lists.filter((list) => list.deletedAt == null);
      if (active.length <= 1) {
        return false;
      }

      const target = active.find((list) => list.id === id);
      if (!target) {
        return false;
      }

      const deletedAt = dayjs().unix();
      const previousLists = this.lists;
      const previousSelected = this.list;
      const lists = this.lists.map((list) =>
        list.id === id ? { ...list, deletedAt } : list,
      );
      this.lists = lists;
      if (this.list === id) {
        const next = lists.find((list) => list.deletedAt == null);
        this.list = next ? next.id : "goal";
      }

      try {
        await this.persistLists(userId, lists);
        return true;
      } catch (error) {
        this.lists = previousLists;
        this.list = previousSelected;
        throw error;
      }
    },
    async finishTask({ userId, date, list }) {
      if (!userId) {
        return;
      }

      const listName = list || "goal";
      this.list = listName;
      const ref = doc(db, "users", userId);
      const document = await getDoc(ref);
      const lists = this.lists.length
        ? this.lists
        : synthesizeLists({ [listName]: [date.unix()] });

      if (document.exists()) {
        const updates = {
          [`tracks.${listName}`]: arrayUnion(date.unix()),
        };
        const remoteLists = document.data()?.lists;
        if (!Array.isArray(remoteLists) || remoteLists.length === 0) {
          updates.lists = lists;
        }
        await updateDoc(ref, updates);
      } else {
        await setDoc(ref, {
          lists,
          tracks: {
            [listName]: [date.unix()],
          },
        });
      }
    },
  },
});
