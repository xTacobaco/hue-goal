<template>
    <span
        class="day"
        :class="{ 'all-done': allDone, 'is-active': active }"
        :style="dayStyle"
        @click="startAnimation"
    >
        <span
            v-if="cords[1] === 0"
            class="day-header"
            :class="{ 'is-today': isTodayWeekday }"
            :style="todayHeaderStyle"
        >{{ $t("weekdays")[day.isoWeekday() - 1] }}</span>
    </span>
</template>

<script>
import dayjs from '@/utils/dayjs';
import { useDatesStore } from '@/datastores/dates.js';
import { dayFillCss } from '@/utils/day-color';

const speed = 50;
const thickness = 5;

export default {
    data() {
        return {
            loaded: false,
            animated: false,
            animationQueue: [],
        };
    },
    props: {
        day: {
            type: Object,
            required: true,
            default: () => {},
        },
        weekdays: {
            type: Number,
            required: true,
            defualt: 0,
        },
        done: {
            type: Boolean,
            required: false,
            default: false,
        },
        allDone: {
            type: Boolean,
            required: false,
            default: false,
        },
        cords: {
            type: Array,
            required: true,
            default: () => [],
        },
    },
    computed: {
        date() {
            return this.day.format('LL');
        },
        active() {
            return this.animated || (this.done && this.loaded);
        },
        isTodayWeekday() {
            return this.day.isoWeekday() === dayjs().isoWeekday();
        },
        todayHeaderStyle() {
            if (!this.isTodayWeekday) {
                return undefined;
            }
            const today = dayjs();
            return { color: dayFillCss(today) };
        },
        hue() {
            return this.sampleColor(0, 0).hue;
        },
        light() {
            return this.sampleColor(0, 0).light;
        },
        holoVars() {
            const toCss = ({ hue, light }) => {
                const ringLight = Math.min(68, Math.max(36, light + 10));
                return `hsl(${hue}, 82%, ${ringLight}%)`;
            };
            return {
                '--holo-n': toCss(this.sampleColor(-1, 0)),
                '--holo-ne': toCss(this.sampleColor(-1, 1)),
                '--holo-e': toCss(this.sampleColor(0, 1)),
                '--holo-se': toCss(this.sampleColor(1, 1)),
                '--holo-s': toCss(this.sampleColor(1, 0)),
                '--holo-sw': toCss(this.sampleColor(1, -1)),
                '--holo-w': toCss(this.sampleColor(0, -1)),
                '--holo-nw': toCss(this.sampleColor(-1, -1)),
            };
        },
        dayStyle() {
            const color = this.active
                ? `hsl(${this.hue}, 70%, ${this.light}%)`
                : '#161616';
            const border_color = this.active
                ? `hsl(${this.hue}, 70%, ${this.light - 1}%)`
                : `#202020`;
            const style = {
                background: color,
                ...this.holoVars,
            };
            if (!(this.allDone && this.active)) {
                style.borderColor = border_color;
            }
            return style;
        },
    },
    created() {
        this.emitter.on('animation', this.animate);
    },
    methods: {
        sampleColor(weekDelta, weekdayDelta) {
            const sample = this.day.add(weekDelta, 'week');
            const hue = (sample.isoWeek() / dayjs().isoWeeksInYear()) * 359;
            const weekday = this.day.isoWeekday() + weekdayDelta;
            let weekdays = 7;
            if (weekDelta === 0) {
                weekdays = Math.max(1, this.weekdays);
            } else if (
                sample.startOf('isoWeek').isSame(dayjs().startOf('isoWeek'))
            ) {
                weekdays = Math.max(1, dayjs().isoWeekday());
            }
            const light = 50 - ((weekday - 1) / weekdays) * 30;
            return { hue, light };
        },
        startAnimation() {
            useDatesStore().recordScreenClick();
            this.emitter.emit('animation', this.cords);
        },
        animate(pos) {
            var dist = this.cords
                .map((p, index) => Math.abs(p - pos[index]))
                .reduce(
                    (a, b) => Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2)),
                    0,
                );

            setTimeout(() => {
                if (this.animated) {
                    clearTimeout(this.animationQueue);
                }

                this.animated = true;
                this.loaded = this.done;

                this.animationQueue = setTimeout(() => {
                    this.animated = false;
                }, thickness * speed);
            }, dist * speed);
        },
    },
};
</script>
