<template>
    <span class="day" :style="dayStyle"/>
</template>

<script>
    import dayjs from '@/dayjs';

    export default {
        props: {
            hue: {
                type: Number,
                default: 0,
            },
            share: {
                type: Number,
                default: 0,
            },
            date: {
                type: Object
            },
            days: {
                type: Array,
            },
        },
        computed: {
            dayStyle() {
                var color = this.done ? `hsl(${this.hue}, 70%, ${50-this.share*30}%)` : "#161616";
                var border_color = this.done ? `hsl(${this.hue}, 70%, ${49-this.share*30}%)` : "#181818";
                return {
                    background: color,
                    borderColor: border_color
                }
            },
            done() {
                return this.days.find(d => dayjs.unix(d.date.seconds).format('DD/MM-YY') === this.date.format('DD/MM-YY'));
            }
        },
    }
</script>