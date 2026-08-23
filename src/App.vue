<template>
  <nav>
    <div class="title">
      <span class="hue">hue</span>
      <span>goal</span>
      <span class="icon crown"></span>
    </div>
  </nav>
  <div class="calendar">
    <week-grid
      v-for="(week, index) in weeks"
      :key="week.unix()"
      :week="week"
      :dates="dates"
      :pos="index"
    />
  </div>
  <div class="centered">
    <checkmark-button :done="today.isSame(lastFinished)" @click="registerTask">{{
      $t("cta")
    }}</checkmark-button>
    <horizontal-pills
      v-if="user"
      :items="tasks"
      @update:selectedItem="(item) => (selectedItem = item)"
    ></horizontal-pills>
    <div class="auth">
      <template v-if="isLoggedIn">
        <p>{{ $t("auth.loggedInAs") }}<br />{{ user.email }}</p>
        <a href="#" @click.prevent="signOut">{{ $t("auth.logOut") }}</a>
      </template>
      <a v-else class="fake-link" @click="signIn">{{ $t("auth.logIn") }}</a>
    </div>
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
import { useDatesStore } from "@/datastores/dates.js";

export default {
  components: {
    weekGrid,
    checkmarkButton,
    horizontalPills,
  },
  data() {
    return {
      dayjs,
      weeks: [],
      selectedItem: { name: "goal" },
    };
  },
  computed: {
    today() {
      return dayjs().startOf("date");
    },
    lastFinished() {
      const empty = { timestamp: 0 };
      const lastFinished = this.dates.slice(-1)[0] || empty;
      return dayjs.unix(lastFinished.timestamp);
    },
    tasks() {
      return [
        { name: "goal", label: this.$t("lists.goal") },
        { name: "task", label: this.$t("lists.task") },
      ];
    },
    ...mapState(useUserStore, ["user", "isLoggedIn"]),
    ...mapState(useDatesStore, ["dates"]),
  },
  mounted() {
    let week = dayjs().startOf("isoWeek");
    for (let i = 0; i < dayjs().isoWeeksInYear(); i++) {
      this.weeks.push(week.subtract(i, "week"));
    }
    this.weeks.reverse();
  },
  methods: {
    async registerTask() {
      if (this.today.isSame(this.lastFinished)) {
        return;
      }

      const date = dayjs().startOf("date");
      let userId = this.user?.id;
      if (!userId) {
        userId = await this.tempSignIn();
      }
      this.finishTask({ userId, date, list: this.selectedItem.name });
    },
    ...mapActions(useUserStore, ["signIn", "signOut", "tempSignIn"]),
    ...mapActions(useDatesStore, ["finishTask", "watchUser", "setList"]),
  },
  watch: {
    lastFinished(date) {
      localStorage.lastFinished = date.unix();
    },
    user: {
      immediate: true,
      handler(user) {
        this.watchUser(user?.id || null);
      },
    },
    selectedItem(item) {
      this.setList(item?.name);
    },
  },
};
</script>
