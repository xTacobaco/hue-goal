<template>
    <span class="day" :style="dayStyle" @click="log()"/>
</template>

<script>
    import dayjs from '@/dayjs';

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
            }
        },
        computed: {
            date() {
                return this.day.format('LL');
            },
            dayStyle() {
                let color = this.finished ? `hsl(${this.hue}, 70%, ${this.light}%)` : "#161616";
                let border_color = this.finished ? `hsl(${this.hue}, 70%, ${this.border_light}%)` : "#181818";
                return {
                    background: color,
                    borderColor: border_color
                }
            },
            finished() {
                return true;
                //return this.days.find(d => dayjs.unix(d.date).format('DD/MM-YY') === this.date.format('DD/MM-YY'));
            }
        },
        mounted() {
            this.hue = this.day.week()/dayjs().isoWeeksInYear()*359;

            let magic = this.day.day()/this.weekdays*30
            this.light = 50-magic;
            this.border_light = 49-magic;
        },
        methods: {
            log() {
                console.log(this.day.format('LL'));
            }
        }
    }
</script>