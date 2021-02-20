<template>
    <div id="app">
        <div id="grid">
            <week-row
                v-for="week in weeks"
                :key="week"
                :currentWeek="week == weeks"
                :date="calculateWeek(week)"
                />
        </div>
        <button class="btn">I've done todays task!</button>
  </div>
</template>

<script>
import dayjs from '@/dayjs';
import weekRow from '@/components/week-row';

export default {
    components: { weekRow },
    data() {
        return {
            weeks: 52,
        };
    },
    methods: {
        calculateWeek(week) {
            return (this.weeks+dayjs().week()-2+week)%this.weeks+1;
        }
    }
};
</script>