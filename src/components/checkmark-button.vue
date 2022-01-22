<template>
  <button class="btn" :class="{ done: done }">
    <transition-group name="check">
      <span v-if="done" class="checkmark"></span>
      <span v-else class="btn-text">
        <slot></slot>
      </span>
    </transition-group>
  </button>
</template>

<script>
export default {
  props: {
    done: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
