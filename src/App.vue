<template>
  <nav>
    <div class="bar">
      <div class="title">
        <span class="hue">hue</span>
        <span>goal</span>
        <span class="icon crown"></span>
      </div>
      <profile-menu />
    </div>
  </nav>
  <main>
    <div class="stage">
      <div class="calendar-pane">
        <div class="calendar" :style="{ '--week-count': weeks.length }">
          <week-grid
            v-for="(week, index) in weeks"
            :key="week.unix()"
            :week="week"
            :dates="dates"
            :all-done-unix="allDoneUnix"
            :pos="index"
          />
        </div>
      </div>
      <div class="cluster-pane">
        <div
          class="cluster"
          :aria-busy="clusterReady ? undefined : 'true'"
        >
          <div
            class="cluster-slot"
            :class="{ 'is-ready': clusterReady }"
          >
            <div
              class="cluster-body"
              :class="{ 'is-ready': clusterReady }"
              :inert="!clusterReady"
            >
              <div class="cluster-cta">
                <checkmark-button
                  :done="ctaDone"
                  :skip-transition="hydrating"
                  @click="registerTask"
                  >{{ $t("cta") }}</checkmark-button
                >
              </div>
              <div class="cluster-lists">
                <button
                  v-if="tasks.length <= 1"
                  type="button"
                  class="track-more"
                  :title="$t('lists.trackMore')"
                  @click="openEditor(true)"
                >
                  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M8 3.2v9.6M3.2 8h9.6"
                      stroke="currentColor"
                      stroke-width="1.7"
                      stroke-linecap="round"
                    />
                  </svg>
                  {{ $t("lists.trackMore") }}
                </button>
                <horizontal-pills
                  v-else
                  :items="tasks"
                  :selected-item="selectedItem"
                  @update:selectedItem="(item) => (selectedItem = item)"
                >
                  <template #default="{ item }">
                    <span>{{ item.label || item.name }}</span>
                  </template>
                  <template #after>
                    <button
                      type="button"
                      class="pill-add"
                      :title="$t('lists.edit')"
                      :aria-label="$t('lists.edit')"
                      @click="openEditor(false)"
                    >
                      +
                    </button>
                  </template>
                </horizontal-pills>
              </div>
            </div>
            <div class="cluster-skeleton" aria-hidden="true">
              <div class="skel skel-btn"></div>
              <div class="skel skel-pills"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="marketing">
      <hr class="divider" />
      <div class="section">
        <h2>{{ $t("marketing.whatTitle") }}</h2>
        <p>{{ $t("marketing.whatBody") }}</p>
      </div>
      <div class="section">
        <h2>{{ $t("marketing.howTitle") }}</h2>
        <p>{{ $t("marketing.howBody") }}</p>
      </div>
      <div class="section">
        <h2>{{ $t("marketing.colorsTitle") }}</h2>
        <p>{{ $t("marketing.colorsBody") }}</p>
      </div>
    </div>
  </main>
  <task-editor
    v-if="editorOpen"
    :tasks="tasks"
    :start-adding="editorStartAdding"
    @close="editorOpen = false"
  />
  <footer>
    <div class="bar">
      <a
        href="https://github.com/xTacobaco/hue-goal"
        target="_blank"
        rel="noopener noreferrer"
        >{{ $t("footer.github") }}</a
      >
      <span>{{ $t("footer.copyright") }} &copy; {{ dayjs().year() }}</span>
      <button
        type="button"
        @click="$setLocale($i18n.locale === 'sv' ? 'en' : 'sv')"
      >
        {{ $i18n.locale === "sv" ? "English" : "Svenska" }}
      </button>
    </div>
  </footer>
</template>

<script>
import { mapActions, mapState } from "pinia";
import dayjs from "@/utils/dayjs";
import weekGrid from "@/components/week-grid.vue";
import checkmarkButton from "@/components/checkmark-button.vue";
import horizontalPills from "@/components/horizontal-pills.vue";
import taskEditor from "@/components/task-editor.vue";
import profileMenu from "@/components/profile-menu.vue";
import { useUserStore } from "@/datastores/user.js";
import { builtinListKey, useDatesStore } from "@/datastores/dates.js";

export default {
  components: {
    weekGrid,
    checkmarkButton,
    horizontalPills,
    taskEditor,
    profileMenu,
  },
  data() {
    const weekCount = dayjs().isoWeeksInYear();
    const currentWeek = dayjs().startOf("isoWeek");
    return {
      dayjs,
      weeks: Array.from({ length: weekCount }, (_, i) =>
        currentWeek.subtract(weekCount - 1 - i, "week"),
      ),
      selectedItem: { name: "goal" },
      editorOpen: false,
      editorStartAdding: false,
      hydrating: true,
    };
  },
  computed: {
    today() {
      return dayjs().startOf("date");
    },
    lastFinished() {
      const timestamps = this.dates.map((item) => item.timestamp);
      const latest = timestamps.length ? Math.max(...timestamps) : 0;
      return dayjs.unix(latest);
    },
    tasks() {
      return this.activeLists.map((list) => this.toTaskItem(list));
    },
    clusterReady() {
      return this.authReady && this.progressReady;
    },
    ctaDone() {
      return this.clusterReady && this.today.isSame(this.lastFinished);
    },
    progressWatchId() {
      if (!this.authReady) {
        return undefined;
      }
      return this.user?.id ?? null;
    },
    ...mapState(useUserStore, ["user", "authReady"]),
    ...mapState(useDatesStore, [
      "dates",
      "list",
      "activeLists",
      "allDoneUnix",
      "doneTodayIds",
      "progressReady",
    ]),
  },
  methods: {
    toTaskItem(list) {
      const translated = builtinListKey(list);
      return {
        name: list.id,
        id: list.id,
        label: translated ? this.$t(translated) : list.label,
        done: this.doneTodayIds.has(list.id),
      };
    },
    openEditor(startAdding) {
      this.editorStartAdding = Boolean(startAdding);
      this.editorOpen = true;
    },
    async registerTask() {
      if (this.today.isSame(this.lastFinished, "day")) {
        return;
      }

      const date = dayjs().startOf("date");
      const userId = this.user?.id ?? (await this.tempSignIn());
      try {
        await this.finishTask({
          userId,
          date,
          list: this.selectedItem.name,
        });
      } catch (error) {
        console.error("Failed to save today's task", error);
      }
    },
    ...mapActions(useUserStore, ["tempSignIn"]),
    ...mapActions(useDatesStore, [
      "finishTask",
      "watchUser",
      "setList",
    ]),
  },
  watch: {
    lastFinished(date) {
      localStorage.lastFinished = date.unix();
    },
    progressWatchId: {
      immediate: true,
      handler(id) {
        if (id === undefined) {
          return;
        }
        this.watchUser(id);
      },
    },
    clusterReady: {
      immediate: true,
      handler(ready) {
        if (!ready) {
          this.hydrating = true;
          return;
        }
        this.hydrating = true;
        this.$nextTick(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              this.hydrating = false;
            });
          });
        });
      },
    },
    selectedItem(item) {
      this.setList(item?.name);
    },
    list(id) {
      const item = this.tasks.find((task) => task.name === id);
      if (item && item.name !== this.selectedItem?.name) {
        this.selectedItem = item;
      }
    },
    tasks(items) {
      const still = items.find(
        (task) => task.name === this.selectedItem?.name,
      );
      if (!still && items[0]) {
        this.selectedItem = items[0];
      }
    },
  },
};
</script>
