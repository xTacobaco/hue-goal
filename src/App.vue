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
                <a v-if="! isLoggedIn" class="fake-link" @click="registerUser">Login to sync your progress</a>
                <p v-else-if="email">Logged in as:<br/>{{ userEmail }}</p>
            </div>
        </div>
        <footer>William Beinö &copy; {{ dayjs().year() }}</footer>
    </div>
</template>

<script>
import { users } from '@/utils/db.js';
import { auth, googleProvider } from '@/utils/auth.js';

import dayjs from '@/utils/dayjs.js';
import weekGrid from '@/components/week-grid.vue';
import checkmarkButton from '@/components/checkmark-button.vue';

export default {
    components: {
        weekGrid,
        checkmarkButton
    },
    data() {
        return {
            dayjs,
            dates: [],
            weeks: [],
            user: null
        };
    },
    computed: {
        today() {
            return dayjs().startOf('date');
        },
        lastFinished() {
            let empty = { timestamp: 0 };
            let stored = { timestamp: localStorage.lastFinished };
            let lastFinished = this.dates.slice(-1)[0] || stored || empty;
            return dayjs.unix(lastFinished.timestamp);
        },
        isLoggedIn() {
            let user = this.user || JSON.parse(localStorage.user);
            return user && ! user.isAnonymous;
        },
        userEmail() {
            return (this.user || JSON.parse(localStorage.user)).email;
        }
    },
    mounted() {
        let week = dayjs().startOf('isoWeek');
        for(let i=0; i < dayjs().isoWeeksInYear(); i++) {
            this.weeks.push(week.subtract(i, 'week'));
        }
        this.weeks.reverse();
    },
    created () {
        auth.onAuthStateChanged((user) => {
            if (! user) {
                localStorage.clear();
                auth.signInAnonymously();
            } else {
                this.user = user;
            }
        });
    },
    methods: {
        registerTask() {
            let date = dayjs().startOf('date');
            users.doc(this.user.uid).collection('dates').doc(date.format('YYYY-MM-DD')).set({
                timestamp: date.unix()
            });
        },
        registerUser() {
            auth.currentUser.linkWithRedirect(googleProvider);
        }
    },
    watch: {
        lastFinished(date) {
            localStorage.lastFinished = date.unix();
        },
        user: {
            handler(user) {
                this.$bind('dates', users.doc(user.uid).collection('dates'));
                localStorage.user = JSON.stringify(user);
            },
        },
    }
};
</script>