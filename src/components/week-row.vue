<template>
    <div class="week">
        <day-item 
            v-for="day in days"
            :key="day"
            :hue="(date/52)*359"
            :share="day/weekDays"
            :date="monday.add(day,'day')"
            :days="daysarray"
            />
    </div>
</template>

<script>
    import dayItem from '@/components/day-item';
    export default {
        components: { dayItem },
        data() {
            return {
                weekDays: 7,
            }
        },
        props: {
            currentWeek: {
                type: Boolean,
                default: true,
            },
            date: {
                type: Number,
            },
            monday: {
                type: Object,
            },
            daysarray: {
                type: Array,
            },
        },
        computed: {
            days() {
                var currentWeekdays = (new Date()).getDay();
                return (this.currentWeek ? currentWeekdays : this.weekDays);
            }
        },
    }
</script>