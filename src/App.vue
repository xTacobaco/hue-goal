<template>
    <div id="app">
        <div class="container">
            <div id="grid">
                <week-row
                    v-for="week in weeks"
                    :key="week.unix()"
                    :week="week"
                    :dates="dates"
                    />
            </div>
            <button
                class="btn"
                :class="{'finished': today == lastFinished}"
                @click="registerTask"
                >I've done todays task!</button>
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
        dates: db.collection('dates')
    },
    components: {
        weekRow
    },
    data() {
        return {
            dayjs,
            dates: [],
            weeks: []
        };
    },
    computed: {
        today() {
            return dayjs().startOf('date').unix();
        },
        lastFinished() {
            return this.dates.slice(-1);
        }
    },
    mounted() {
        for(let i=dayjs().isoWeeksInYear(); i > 0; i--) {
            let week = dayjs().startOf('week');
            this.weeks.push(week.subtract(i, 'week'));
        }
    },
    methods: {
        registerTask() {
            let date = dayjs().startOf('date');
            db.collection('dates').add({
                id: date.format('LL'),
                date: date.unix()
            });
        }
    }
};
</script>