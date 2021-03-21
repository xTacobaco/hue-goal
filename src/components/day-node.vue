<template>
    <span class="day" :style="dayStyle" @click="startAnimation" />
</template>

<script>
    import dayjs from '@/utils/dayjs';
    import bus from '@/utils/eventbus';

    const speed = 50;
    const thickness = 5;

    export default {
        data() {
            return {
                hue: 0,
                light: 0,
                loaded: false,
                animated: false,
                animationQueue: [],
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
            done: {
                type: Boolean,
                required: false,
                default: false
            },
            cords: {
                type: Array,
                required: true,
                default: () => []
            }
        },
        computed: {
            date() {
                return this.day.format('LL');
            },
            active () {
                return this.animated || (this.done && this.loaded);
            },
            dayStyle() {
                let color = this.active ? `hsl(${this.hue}, 70%, ${this.light}%)` : "#161616";
                let border_color = this.active ? `hsl(${this.hue}, 70%, ${this.light-1}%)` : `#202020`;
                return {
                    background: color,
                    borderColor: border_color
                }
            }
        },
        created() {
            bus.$on('animation', this.animate);
        },
        mounted() {
            this.hue = this.day.isoWeek()/dayjs().isoWeeksInYear()*359;
            this.light = 50-(this.day.isoWeekday()-1)/this.weekdays*30;
        },
        methods: {
            startAnimation() {
                bus.$emit('animation', this.cords);
            },
            animate(pos) {
                var dist = this.cords
                    .map((p, index) => Math.abs(p - pos[index]))
                    .reduce((a, b) => Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2)), 0)

                setTimeout(() => {
                    if (this.animated) {
                        clearTimeout(this.animationQueue);
                    }

                    this.animated = true;
                    this.loaded = this.done;

                    this.animationQueue = setTimeout(() => {
                        this.animated = false;
                    }, thickness*speed);
                }, dist*speed);
            }
        }
    }
</script>