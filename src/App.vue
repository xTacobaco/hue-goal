<template>
    <div id="app">
        <div id="grid">
            <grid-row
                v-for="week in weeks"
                :key="week"
                :date="(week - 7)%weeks"
                :currentWeek="week == weeks"
                />
        </div>
        <div class="btn">I've done todays task!</div>
  </div>
</template>

<script>
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
dayjs.extend(weekOfYear)

import gridRow from '@/components/grid-row';
export default {
    components: { gridRow },
    data() {
        return {
            dayjs,
            weeks: 52,
        };
    },
};
</script>