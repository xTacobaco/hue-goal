<template>
  <nav>
    <div class="title">
      <span class="hue">hue</span>
      <span>goal</span>
      <span class="icon crown"></span>
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
              <horizontal-pills
                :items="tasks"
                :selected-item="selectedItem"
                @update:selectedItem="(item) => (selectedItem = item)"
              >
                <template #default="{ item }">
                  <span>{{ item.label || item.name }}</span>
                  <button
                    v-if="item.name === selectedItem.name"
                    type="button"
                    class="pill-remove"
                    :disabled="tasks.length <= 1"
                    :title="
                      tasks.length <= 1
                        ? $t('lists.lastList')
                        : $t('lists.remove')
                    "
                    :aria-label="
                      tasks.length <= 1
                        ? $t('lists.lastList')
                        : $t('lists.remove')
                    "
                    @click.stop="removeTask(item)"
                  >
                    ×
                  </button>
                </template>
                <template #after>
                  <form
                    v-if="addingList"
                    class="pill-add-form"
                    @submit.prevent="commitAdd"
                  >
                    <input
                      ref="addInput"
                      v-model="newListLabel"
                      class="pill-add-input"
                      type="text"
                      maxlength="20"
                      :placeholder="$t('lists.addPlaceholder')"
                      :aria-label="$t('lists.add')"
                      @keydown.escape.prevent="cancelAdd"
                    />
                  </form>
                  <button
                    v-else
                    type="button"
                    class="pill-add"
                    :disabled="tasks.length >= MAX_LISTS"
                    :title="$t('lists.add')"
                    :aria-label="$t('lists.add')"
                    @click="startAdd"
                  >
                    +
                  </button>
                </template>
              </horizontal-pills>
              <div class="auth">
                <template v-if="clusterReady && isLoggedIn">
                  <p>{{ $t("auth.loggedInAs") }}<br />{{ user.email }}</p>
                  <a href="#" @click.prevent="signOut">{{
                    $t("auth.logOut")
                  }}</a>
                </template>
                <a
                  v-else-if="clusterReady"
                  class="fake-link"
                  @click="signIn"
                  >{{ $t("auth.logIn") }}</a
                >
              </div>
            </div>
            <div class="cluster-skeleton" aria-hidden="true">
              <div class="skel skel-btn"></div>
              <div class="skel skel-pills"></div>
              <div class="skel skel-auth"></div>
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
  <footer>
    <a
      href="https://github.com/xTacobaco/hue-goal"
      target="_blank"
      rel="noopener noreferrer"
      >{{ $t("footer.github") }}</a
    >
    <span>{{ $t("footer.copyright") }} &copy; {{ dayjs().year() }}</span>
    <a :href="$localeHref($i18n.locale === 'sv' ? 'en' : 'sv')">{{
      $i18n.locale === "sv" ? "English" : "Svenska"
    }}</a>
  </footer>
</template>

<script>
import { mapActions, mapState } from "pinia";
import dayjs from "@/utils/dayjs";
import weekGrid from "@/components/week-grid.vue";
import checkmarkButton from "@/components/checkmark-button.vue";
import horizontalPills from "@/components/horizontal-pills.vue";
import { useUserStore } from "@/datastores/user.js";
import { MAX_LISTS, useDatesStore } from "@/datastores/dates.js";

export default {
  components: {
    weekGrid,
    checkmarkButton,
    horizontalPills,
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
      addingList: false,
      newListLabel: "",
      hydrating: true,
      MAX_LISTS,
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
    ...mapState(useUserStore, ["user", "isLoggedIn", "authReady"]),
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
      const label =
        list.id === "goal" || list.id === "task"
          ? this.$t(`lists.${list.id}`)
          : list.label;
      return {
        name: list.id,
        id: list.id,
        label,
        done: this.doneTodayIds.has(list.id),
      };
    },
    async ensureUserId() {
      if (this.user?.id) {
        return this.user.id;
      }
      return this.tempSignIn();
    },
    startAdd() {
      if (this.tasks.length >= MAX_LISTS) {
        return;
      }
      this.addingList = true;
      this.newListLabel = "";
      this.$nextTick(() => {
        this.$refs.addInput?.focus();
      });
    },
    cancelAdd() {
      this.addingList = false;
      this.newListLabel = "";
    },
    async commitAdd() {
      const label = this.newListLabel.trim();
      if (!label) {
        return;
      }
      try {
        const userId = await this.ensureUserId();
        const list = await this.addList({ userId, label });
        if (list) {
          this.selectedItem = this.toTaskItem(list);
          this.cancelAdd();
        }
      } catch {
        // Keep the add field open so the label is not lost if the write fails.
      }
    },
    async removeTask(item) {
      if (this.tasks.length <= 1) {
        return;
      }
      try {
        const userId = await this.ensureUserId();
        await this.removeList({ userId, id: item.name });
        const next =
          this.tasks.find((task) => task.name === this.list) || this.tasks[0];
        if (next) {
          this.selectedItem = next;
        }
      } catch {
        // Leave the current selection; store rolls lists back on failure.
      }
    },
    async registerTask() {
      if (this.today.isSame(this.lastFinished, "day")) {
        return;
      }

      const date = dayjs().startOf("date");
      const userId = await this.ensureUserId();
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
    ...mapActions(useUserStore, ["signIn", "signOut", "tempSignIn"]),
    ...mapActions(useDatesStore, [
      "finishTask",
      "watchUser",
      "setList",
      "addList",
      "removeList",
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
