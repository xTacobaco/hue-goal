<template>
    <div class="week">
        <day-node
            v-for="day in days"
            :active="unixDates.includes(day.unix())"
            :weekdays="weekdays"
            :key="day.unix()"
            :day="day"
            />
    </div>
</template>

<script>
    import dayjs from '@/utils/dayjs';
    import dayNode from '@/components/day-node';

    export default {
        components: { dayNode },
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
                return dayjs().startOf('isoWeek').isSame(this.week);
            },
            weekdays() {
                if (this.isCurrentWeek) {
                    return dayjs().isoWeekday();
                } else {
                    return dayjs.duration(1, 'week').get('days');
                }
            },
            unixDates() {
                return this.dates.map(d => d.timestamp);
            }
        },
        mounted() {
            let day = this.week.startOf('isoWeek');
            for(let i=0; i < this.weekdays; i++) {
                this.days.push(day.add(i, 'days'));
            }
        }
    }
</script>