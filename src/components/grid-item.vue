<template>
    <span class="day" :style="dayStyle" />
</template>

<script>
    export default {
        data() {
            return {
                hue: 7,
            }
        },
        props: {
            done: {
                type: Boolean,
                default: false,
            },
        },
        computed: {
            dayStyle() {
                return { background: this.done ? "#fff" : "#161616" }
            }
        }
    }
</script>