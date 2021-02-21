<template>
    <div class="week">
        <day-item 
            v-for="day in days"
            :weekdays="weekdays"
            :key="day.unix()"
            :day="day"
            />
    </div>
</template>

<script>
    import dayjs from '@/dayjs';
    import dayItem from '@/components/day-item';

    export default {
        components: { dayItem },
        data() {
            return {
                dayjs,
                days: [],
            }
        },
        props: {
            week: {
                type: Object,
                required: true,
                default: () => {}
            },
            dates: {
                type: Array,
                required: true,
                default: () => []
            }
        },
        computed: {
            isCurrentWeek() {
                return this.week === dayjs().startOf('week');
            },
            weekdays() {
                if (this.isCurrentWeek) {
                    return dayjs().isoWeekday();
                } else {
                    return dayjs.duration(1, 'week').get('days');
                }
            }
        },
        mounted() {
            for(let i=0; i < this.weekdays; i++) {
                let day = this.week.startOf('week');
                this.days.push(day.add(i, 'days'));
            }
        }
    }
</script>