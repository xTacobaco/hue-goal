<template>
  <div class="week">
    <span v-if="firstDay" class="month" :style="firstDayStyle">{{
      firstDay.locale($i18n.locale).format("MMMM")
    }}</span>
    <day-node
      v-for="day in days"
      :done="unixDates.includes(day.unix())"
      :all-done="isAllDone(day)"
      :cords="[day.isoWeekday() - 1, pos]"
      :weekdays="weekdays"
      :key="day.unix()"
      :day="day"
    />
    <div v-if="isCurrentWeek" class="today-annotation">
      <img :src="arrowUrl" width="51" height="19" alt="" />
      <span class="today-label">{{ $t("today") }}</span>
    </div>
  </div>
</template>

<script>
import dayjs from "@/utils/dayjs";
import dayNode from "@/components/day-node.vue";
import arrowUrl from "@/assets/arrow.svg";

export default {
  components: { dayNode },
  data() {
    return {
      dayjs,
      arrowUrl,
    };
  },
  props: {
    week: {
      type: Object,
      required: true,
      default: () => {},
    },
    dates: {
      type: Array,
      required: true,
      default: () => [],
    },
    pos: {
      type: Number,
      required: true,
      default: 0,
    },
    allDoneUnix: {
      type: Object,
      default: () => new Set(),
    },
  },
  computed: {
    isCurrentWeek() {
      return dayjs().startOf("isoWeek").isSame(this.week);
    },
    weekdays() {
      if (this.isCurrentWeek) {
        return dayjs().isoWeekday();
      } else {
        return dayjs.duration(1, "week").get("days");
      }
    },
    unixDates() {
      return this.dates.map((d) => d.timestamp);
    },
    days() {
      const start = this.week.startOf("isoWeek");
      return Array.from({ length: this.weekdays }, (_, i) => start.add(i, "days"));
    },
    firstDay() {
      if (this.pos === 0) {
        return this.days[0];
      }
      return this.days.find((day) => day.date() === 1);
    },
    firstDayStyle() {
      if (!this.firstDay) {
        return {};
      }
      if (this.firstDay.month() % 2 === 0) {
        return {
          left: 0,
          transform: "translateX(-100%)",
        };
      }
      return {
        right: 0,
        transform: "translateX(100%)",
      };
    },
  },
  methods: {
    isAllDone(day) {
      return Boolean(this.allDoneUnix?.has?.(day.unix()));
    },
  },
};
</script>
