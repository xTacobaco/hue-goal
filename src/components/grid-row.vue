<template>
    <div class="week">
        {{date}}
        <grid-item 
            v-for="day in days"
            :key="day"/>
    </div>
</template>

<script>
    import gridItem from '@/components/grid-item.vue';
    export default {
        components: { gridItem },
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
                default: 0,
            },
        },
        computed: {
            days() {
                var currentWeekdays = (new Date()).getDay();
                return (this.currentWeek ? currentWeekdays : this.weekDays);
            }
        }
    }
</script>