<template>
    <span class="day" :style="dayStyle" />
</template>

<script>
    export default {
        props: {
            done: {
                type: Boolean,
                default: false,
            },
            hue: {
                type: Number,
                default: 0,
            },
            share: {
                type: Number,
                default: 0,
            }
        },
        computed: {
            dayStyle() {
                var color = this.done ? `hsl(${this.hue}, 70%, ${50-this.share*30}%)` : "#161616";
                var border_color = this.done ? `hsl(${this.hue}, 70%, ${49-this.share*30}%)` : "#181818";
                return {
                    background: color,
                    borderColor: border_color
                }
            }
        },
    }
</script>