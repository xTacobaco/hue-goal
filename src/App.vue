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
                :class="{ 'finished': today.isSame(lastFinished) }"
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
            return dayjs().startOf('date');
        },
        lastFinished() {
            let lastFinished = this.dates.slice(-1)[0];
            return dayjs(lastFinished ? lastFinished.timestamp*1000 : 0);
        }
    },
    mounted() {
        let week = dayjs().startOf('isoWeek');
        for(let i=0; i < dayjs().isoWeeksInYear(); i++) {
            this.weeks.push(week.subtract(i, 'week'));
        }
        this.weeks.reverse();
    },
    methods: {
        registerTask() {
            let date = dayjs().startOf('date');
            db.collection('dates').doc(date.format('LL')).set({
                timestamp: date.unix()
            });
        }
    }
};
</script>