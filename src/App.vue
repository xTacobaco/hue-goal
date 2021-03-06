<template>
    <div id="app">
        <div class="wrapper">
            <div class="section">
                <week-grid
                    v-for="week in weeks"
                    :key="week.unix()"
                    :week="week"
                    :dates="dates"
                    />
            </div>
            <div class="section">
                <checkmark-button :done="today.isSame(lastFinished)" @click.native="registerTask">I've done todays task!</checkmark-button>
                <br/>
                <a class="fake-link" @click="registerUser">Login to sync your progress</a>
            </div>
        </div>
        <footer>William Beinö &copy; {{dayjs().year()}}</footer>
    </div>
</template>

<script>
import db from '@/utils/firestore.js';
import dayjs from '@/utils/dayjs.js';
import weekGrid from '@/components/week-grid.vue';
import checkmarkButton from '@/components/checkmark-button.vue';

export default {
    firestore: {
        dates: db.collection('dates')
    },
    components: {
        weekGrid,
        checkmarkButton
    },
    data() {
        return {
            dayjs,
            dates: [],
            weeks: [],
            test: false
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
        },
        registerUser() {
            //magic
        }
    }
};
</script>