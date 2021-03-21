<template>
    <div id="app">
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
                <checkmark-button :done="today.isSame(lastFinished)" @click.native="validateUser">I've done todays task!</checkmark-button>
                <br/>
                <a v-if="! isLoggedIn" class="fake-link" @click="registerUser">Login to sync your progress</a>
                <p v-else-if="userEmail">Logged in as:<br/>{{ userEmail }}</p>
            </div>
        </div>
        <footer>William Beinö &copy; {{ dayjs().year() }}</footer>
    </div>
</template>

<script>

import dayjs from '@/utils/dayjs';
import bus from '@/utils/eventbus';
import { users } from '@/utils/db';
import { auth, googleProvider } from '@/utils/auth';
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
            let user = this.user || JSON.parse(localStorage.user || null);
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
                bus.$emit('animation', [3, this.weeks.length/2]);
            } else {
                this.user = user;
            }
        });
        auth.getRedirectResult().catch((error) => {
            if (error.credential) {
                auth.signInWithCredential(error.credential);
            }
        });
    },
    methods: {
        validateUser() {
            if (! auth.currentUser) {
                auth.signInAnonymously().then(() => {
                    this.registerTask();
                });
            } else {
                this.registerTask();
            }
        },
        registerTask() {
            let date = dayjs().startOf('date');
            let last = this.lastFinished;
            users.doc(auth.currentUser.uid).collection('dates').doc(date.format('YYYY-MM-DD')).set({
                timestamp: date.unix()
            }).then(() => {
                if (! date.isSame(last)) {
                    bus.$emit('animation', [dayjs().isoWeekday()-1, this.weeks.length-1]);
                }
            });
        },
        registerUser() {
            if (auth.currentUser) {
                auth.currentUser.linkWithRedirect(googleProvider);
            } else {
                auth.signInWithRedirect(googleProvider);
            }
        }
    },
    watch: {
        lastFinished(date) {
            localStorage.lastFinished = date.unix();
        },
        user: {
            handler(user) {
                this.$bind('dates', users.doc(user.uid).collection('dates')).then((dates) => {
                    if (dates.length > 0) {
                        bus.$emit('animation', [dayjs().isoWeekday()-1, this.weeks.length-1]);
                    }
                });
                localStorage.user = JSON.stringify(user);
            },
        },
    }
};
</script>