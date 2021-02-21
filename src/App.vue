<template>
    <div id="app">
        <div class="container">
            <div id="grid">
                <week-row
                    v-for="week in weeks"
                    :key="week"
                    :currentWeek="week == weeks"
                    :date="calculateWeek(week)"
                    :monday="calculateDate(week)"
                    :daysarray="days"
                    />
            </div>
            <button class="btn" @click="doneTask">I've done todays task!</button>
        </div>
        <footer>William Beinö &copy; {{dayjs().year()}}</footer>
  </div>
</template>

<script>
import db from '@/db';
import dayjs from '@/dayjs';
import weekRow from '@/components/week-row';

export default {
    firestore: {
        days: db.collection('days'),
    },
    components: {
        weekRow
    },
    data() {
        return {
            dayjs,
            days: [],
            weeks: 52,
        };
    },
    methods: {
        calculateWeek(week) {
            return (this.weeks+dayjs().week()-2+week)%this.weeks+1;
        },
        calculateDate(week) { 
            return dayjs().subtract(this.weeks-week, 'week');
        },
        doneTask() {
            db.collection('days').add({
                date: dayjs().unix(),
            });
        }
    },
};
</script>