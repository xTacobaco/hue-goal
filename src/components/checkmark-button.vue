<template>
  <button
    class="btn"
    :class="{ done: done, 'is-hydrating': skipTransition }"
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
    skipTransition: {
      type: Boolean,
      default: false,
    },
  },
  mounted() {
    this.publishGradientSize();
    window.addEventListener("resize", this.publishGradientSize);
  },
  updated() {
    this.publishGradientSize();
  },
  unmounted() {
    window.removeEventListener("resize", this.publishGradientSize);
    if (this.measureFrame) {
      cancelAnimationFrame(this.measureFrame);
    }
  },
  methods: {
    publishGradientSize() {
      if (this.measureFrame) {
        cancelAnimationFrame(this.measureFrame);
      }
      this.measureFrame = requestAnimationFrame(() => {
        this.measureFrame = 0;
        this.measureNow();
      });
    },
    measureNow() {
      const btn = this.$el;
      if (!(btn instanceof Element)) {
        return;
      }
      const clone = btn.cloneNode(true);
      clone.classList.remove("done", "is-hydrating");
      clone.disabled = false;
      clone.setAttribute("aria-hidden", "true");
      clone.tabIndex = -1;
      clone.style.position = "absolute";
      clone.style.left = "0";
      clone.style.top = "0";
      clone.style.visibility = "hidden";
      clone.style.pointerEvents = "none";
      clone.style.width = "auto";
      clone.style.maxWidth = getComputedStyle(btn).maxWidth;
      btn.insertAdjacentElement("afterend", clone);
      const width = Math.round(clone.getBoundingClientRect().width);
      const height = Math.round(clone.getBoundingClientRect().height);
      clone.remove();
      if (!width || !height) {
        return;
      }
      const host = btn.closest(".cluster") || btn;
      host.style.setProperty("--cta-w", `${width}px`);
      host.style.setProperty("--cta-h", `${height}px`);
    },
  },
};
</script>
