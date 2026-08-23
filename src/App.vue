<template>
  <div class="wrapper">
    <div class="section">
      <week-grid
        v-for="(week, index) in weeks"
        :key="week.unix()"
        :week="week"
        :dates="dates"
        :pos="index"
      />
    </div>
    <div class="section">
      <checkmark-button :done="today.isSame(lastFinished)" @click="registerTask"
        >I've done todays task!</checkmark-button>
      <horizontal-pills v-if="user" :items="tasks" @update:selectedItem="(item) => selectedItem = item"></horizontal-pills>
      <br />
      <template v-if="isLoggedIn">
        <p>Logged in as:<br />{{ user.email }}</p>
        <a href="#" @click.prevent="signOut">Log out</a>
      </template>
      <a v-else class="fake-link" @click="signIn"
        >Login to sync your progress</a
      >
    </div>
  </div>
  <footer>Hue Goal by William Beinö &copy; {{ dayjs().year() }}</footer>
</template>

<script>
import { mapActions, mapState } from "pinia";
import dayjs from "@/utils/dayjs";
import weekGrid from "@/components/week-grid.vue";
import checkmarkButton from "@/components/checkmark-button.vue";
import horizontalPills from "@/components/horizontal-pills.vue";
import { useUserStore } from "@/datastores/user.js";
import { useDatesStore } from "@/datastores/dates.js";

const tasks = [{ name: "goal" }, { name: "task" }];

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
      tasks,
      selectedItem: tasks[0],
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
