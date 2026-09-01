<template>
  <button
    class="btn"
    :class="{ done: done }"
    type="button"
    :disabled="done"
  >
    <span class="btn-label">
      <span class="btn-text">
        <slot></slot>
      </span>
    </span>
    <span class="btn-check" aria-hidden="true">
      <svg class="checkmark" viewBox="0 0 16 16" fill="none">
        <path
          pathLength="1"
          d="M3.2 8.4 6.6 12.2 13.4 4"
          stroke="currentColor"
          stroke-width="2.1"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
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
