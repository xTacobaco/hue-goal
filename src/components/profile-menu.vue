<template>
  <div class="profile">
    <div v-if="!authReady" class="profile-skel" aria-hidden="true"></div>
    <button
      v-else-if="!isLoggedIn"
      type="button"
      class="login-pill"
      @click="signIn"
    >
      {{ $t("auth.logInGoogle") }}
    </button>
    <template v-else>
      <button
        class="profile-avatar"
        type="button"
        :aria-expanded="open"
        aria-haspopup="dialog"
        :aria-controls="open ? 'profile-stats' : undefined"
        :aria-label="$t('auth.account')"
        @click="toggle"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="8.2" r="3.1" stroke="currentColor" stroke-width="1.8" />
          <path
            d="M5.8 18.4c1.2-2.6 3.3-3.9 6.2-3.9s5 1.3 6.2 3.9"
            stroke="currentColor"
            stroke-width="1.8"
          />
        </svg>
      </button>
      <div
        v-if="open"
        class="profile-overlay"
        @click="close"
      ></div>
      <div
        v-if="open"
        id="profile-stats"
        class="profile-panel"
        role="dialog"
        :aria-label="$t('stats.title')"
      >
        <div class="profile-head">
          <h2>{{ $t("stats.title") }}</h2>
          <button
            class="profile-close"
            type="button"
            :title="$t('stats.close')"
            :aria-label="$t('stats.close')"
            @click="close"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
        <div class="profile-stats">
          <div v-for="row in rows" :key="row.nameKey" class="profile-stat">
            <div class="profile-stat-title">
              <span class="profile-stat-n">{{ row.value }}</span>
              <b>{{ $t(row.nameKey) }}</b>
            </div>
            <span class="profile-stat-desc">{{ $t(row.descKey) }}</span>
          </div>
        </div>
        <button class="profile-logout" type="button" @click="logout">
          {{ $t("auth.logOut") }}
        </button>
      </div>
    </template>
  </div>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useUserStore } from "@/datastores/user.js";
import { useDatesStore } from "@/datastores/dates.js";

export default {
  data() {
    return {
      open: false,
    };
  },
  computed: {
    ...mapState(useUserStore, ["isLoggedIn", "authReady"]),
    ...mapState(useDatesStore, ["profileStats"]),
    rows() {
      const stats = this.profileStats;
      return [
        {
          value: `${stats.hueStreak}x`,
          nameKey: "stats.hueStreak",
          descKey: "stats.hueStreakDesc",
        },
        {
          value: `${stats.bestHueStreak}d`,
          nameKey: "stats.bestHueStreak",
          descKey: "stats.bestHueStreakDesc",
        },
        {
          value: `${stats.dreamWeeks}x`,
          nameKey: "stats.dreamWeeks",
          descKey: "stats.dreamWeeksDesc",
        },
        {
          value: `${stats.taps}x`,
          nameKey: "stats.taps",
          descKey: "stats.tapsDesc",
        },
        {
          value: `${stats.screenClicks}x`,
          nameKey: "stats.screenClicks",
          descKey: "stats.screenClicksDesc",
        },
      ];
    },
  },
  watch: {
    isLoggedIn(value) {
      if (!value) {
        this.open = false;
      }
    },
    open(value) {
      document.body.style.overflow = value ? "hidden" : "";
      if (value) {
        window.addEventListener("keydown", this.onKeydown);
      } else {
        window.removeEventListener("keydown", this.onKeydown);
      }
    },
  },
  unmounted() {
    document.body.style.overflow = "";
    window.removeEventListener("keydown", this.onKeydown);
  },
  methods: {
    toggle() {
      this.open = !this.open;
    },
    close() {
      this.open = false;
    },
    onKeydown(event) {
      if (event.key === "Escape") {
        this.close();
      }
    },
    async logout() {
      this.close();
      await this.signOut();
    },
    ...mapActions(useUserStore, ["signIn", "signOut"]),
  },
};
</script>
