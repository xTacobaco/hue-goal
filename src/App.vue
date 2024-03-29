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
        <a href="#" @click="signOut">Log out</a>
      </template>
      <a v-else class="fake-link" @click="signIn"
        >Login to sync your progress</a
      >
    </div>
  </div>
  <footer>Hue Goal by William Beinö &copy; {{ dayjs().year() }}</footer>
</template>

<script>
import dayjs from "@/utils/dayjs";
import animations from '@/utils/animations';
import weekGrid from "@/components/week-grid.vue";
import checkmarkButton from "@/components/checkmark-button.vue";
import horizontalPills from "@/components/horizontal-pills.vue";

import { auth, onAuthStateChanged, getRedirectResult } from "@/utils/auth";
import { mapGetters } from "vuex";

let tasks = [{name: 'goal'},{name: 'task'}];

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
      tasks: tasks,
      selectedItem: tasks[0],
    };
  },
  created() {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.$store.dispatch("autoSignIn", user);
      } else {
        animations.startAtMiddle();
      }
    });
    getRedirectResult(auth).catch((error) => {
      this.$store.dispatch("handleRedirect", error);
    });
  },
  computed: {
    today() {
      return dayjs().startOf("date");
    },
    lastFinished() {
      let empty = { timestamp: 0 };
      let lastFinished = this.dates.slice(-1)[0] || empty;
      return dayjs.unix(lastFinished.timestamp);
    },
    ...mapGetters(["user", "isLoggedIn", "dates"]),
  },
  mounted() {
    let week = dayjs().startOf("isoWeek");
    for (let i = 0; i < dayjs().isoWeeksInYear(); i++) {
      this.weeks.push(week.subtract(i, "week"));
    }
    this.weeks.reverse();
  },
  methods: {
    registerTask() {
      if (this.today.isSame(this.lastFinished)) {
        return;
      }
      
      let date = dayjs().startOf("date");
      if (this.user) {
        this.finishTask(this.user.id, date, this.selectedItem);
      } else {
        this.$store.dispatch("tempSignIn", (userId) => {
          this.finishTask(userId, date, this.selectedItem);
        });
      }
    },
    finishTask(userId, date, selectedItem){
      this.$store.dispatch("finishTask", { userId, date, list: selectedItem.name });
    },
    signIn() {
      this.$store.dispatch("signIn");
    },
    signOut() {
      this.$store.dispatch("signOut");
      location.reload();
    },
  },
  watch: {
    lastFinished(date) {
      localStorage.lastFinished = date.unix();
    },
    user(user) {
      this.$store.dispatch("fetchDates", { userId: user.id, list: this.selectedItem.name });
    },
    selectedItem() {
      if (this.user) {
        this.$store.dispatch("fetchDates", { userId: this.user.id, list: this.selectedItem.name });  
      }
    }
  },
};
</script>
