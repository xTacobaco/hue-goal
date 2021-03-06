<template>
    <span class="day" :style="dayStyle"/>
</template>

<script>
    import dayjs from '@/utils/dayjs';

    export default {
        data() {
            return {
                hue: 0,
                light: 0
            }
        },
        props: {
            day: {
                type: Object,
                required: true,
                default: () => {}
            },
            weekdays: {
                type: Number,
                required: true,
                defualt: 0
            },
            active: {
                type: Boolean,
                required: false,
                default: false
            }
        },
        computed: {
            date() {
                return this.day.format('LL');
            },
            dayStyle() {
                let color = this.active ? `hsl(${this.hue}, 70%, ${this.light}%)` : "#161616";
                let border_color = this.active ? `hsl(${this.hue}, 70%, ${this.light-1}%)` : "#181818";
                return {
                    background: color,
                    borderColor: border_color
                }
            }
        },
        mounted() {
            this.hue = this.day.isoWeek()/dayjs().isoWeeksInYear()*359;
            this.light = 50-(this.day.isoWeekday()-1)/this.weekdays*30;
        }
    }
</script>