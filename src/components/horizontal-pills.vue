<template>
  <div class="horizontal-pills-container">
    <div
      ref="navMenu"
      class="horizontal-pills-menu"
      :class="{ 'is-panning': panning, 'can-pan': canPan }"
      @pointerdown="onPointerDown"
    >
      <button
        v-for="(item, index) in items"
        :key="item.name"
        type="button"
        class="gmf-horizontal-pills-item"
        :class="{
          'gmf-active': index === selectedIndex,
          'gmf-done': item.done,
        }"
        :aria-pressed="index === selectedIndex ? 'true' : 'false'"
        @click="selectItem(index)"
      >
        <slot :item="item" :index="index">
          <template v-if="item.name">
            <span>{{ item.label || item.name }}</span>
          </template>
        </slot>
      </button>
    </div>
    <slot name="after"></slot>
  </div>
</template>
<style>
.horizontal-pills-container {
  display: flex;
  position: relative;
  overflow: visible;
  align-items: center;
  justify-content: center;
  width: fit-content;
  max-width: 100%;
  gap: 6px;
}

.horizontal-pills-menu {
  margin: 0;
  display: flex;
  background: inherit;
  padding: 0;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  position: relative;
  gap: 6px;
  flex: 0 1 auto;
  min-width: 0;
  max-width: 100%;
  overscroll-behavior-x: contain;
  user-select: none;
  -webkit-overflow-scrolling: touch;
  /* Prefer vertical page scroll when the row does not overflow. */
  touch-action: pan-y;
}

.horizontal-pills-menu.can-pan {
  cursor: grab;
  /*
    Let touch use native overflow scrolling on both axes.
    Mouse drag-to-scroll is handled in JS only.
  */
  touch-action: pan-x pan-y;
}

.horizontal-pills-menu.can-pan .gmf-horizontal-pills-item {
  /* Keep buttons from reclaiming the gesture from the scroller. */
  touch-action: pan-x pan-y;
}

.horizontal-pills-menu.is-panning {
  cursor: grabbing;
  scroll-snap-type: none;
}

.horizontal-pills-menu.is-panning .gmf-horizontal-pills-item {
  cursor: grabbing;
}

.horizontal-pills-menu::-webkit-scrollbar,
.horizontal-pills-container::-webkit-scrollbar {
  display: none;
}

.gmf-horizontal-pills-item {
  --pill-accent: linear-gradient(
    30deg,
    hsl(271, 70%, 50%),
    hsl(239, 70%, 50%)
  );
  --pill-accent-size: var(--cta-w, 14rem) var(--cta-h, 2.75rem);
  flex-shrink: 0;
  cursor: pointer;
  user-select: none;
  align-items: center;
  display: inline-flex;
  padding: 2px 8px;
  color: #c8c8c8;
  background: #1a1a1a;
  border: 2px solid #3a3a3a;
  border-radius: 6px;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 400;
  line-height: 1.1rem;
  position: relative;
  -webkit-tap-highlight-color: transparent;
  touch-action: inherit;
}

.gmf-horizontal-pills-item.gmf-done {
  color: #7229d4;
  border-color: transparent;
  background:
    linear-gradient(#1a1a1a, #1a1a1a) padding-box,
    var(--pill-accent) border-box;
  background-size: auto, var(--pill-accent-size);
  background-position: 0 0, left center;
  background-repeat: no-repeat;
}

.gmf-horizontal-pills-item.gmf-active {
  color: #fff;
  border-color: transparent;
  background:
    linear-gradient(#1a1a1a, #1a1a1a) padding-box,
    var(--pill-accent) border-box;
  background-size: auto, var(--pill-accent-size);
  background-position: 0 0, left center;
  background-repeat: no-repeat;
}

.gmf-horizontal-pills-item.gmf-active.gmf-done {
  color: #fff;
  border-color: transparent;
  background:
    var(--pill-accent) padding-box,
    var(--pill-accent) border-box;
  background-size: var(--pill-accent-size), var(--pill-accent-size);
  background-position: left center, left center;
  background-repeat: no-repeat;
}

.gmf-horizontal-pills-item:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.pill-add {
  flex-shrink: 0;
  box-sizing: border-box;
  width: 28px;
  height: 28px;
  border: 2px solid #3a3a3a;
  border-radius: 6px;
  background: #1a1a1a;
  color: #fff;
  cursor: pointer;
  font: inherit;
  font-size: 16px;
  font-weight: 500;
  line-height: 1;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
}

.pill-add:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}
</style>
<script>
export default {
  emits: ["update:selectedItem"],
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    selectedItem: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      selectedIndex: 0,
      canPan: false,
      drag: null,
      didPan: false,
      panReset: null,
      listening: false,
    };
  },
  computed: {
    panning() {
      return Boolean(this.drag?.moved);
    },
  },
  mounted() {
    this.syncSelectedIndex();
    this.updateOverflow();
    this.resizeObserver = new ResizeObserver(() => this.updateOverflow());
    if (this.$refs.navMenu) {
      this.resizeObserver.observe(this.$refs.navMenu);
    }
    this.$nextTick(() => this.scrollSelectedIntoCenter(false));
  },
  unmounted() {
    clearTimeout(this.panReset);
    this.stopPointerListen();
    this.resizeObserver?.disconnect();
  },
  methods: {
    selectItem(index) {
      if (this.didPan) {
        this.didPan = false;
        return;
      }
      this.selectedIndex = index;
      this.$emit("update:selectedItem", this.items[index]);
      this.$nextTick(() => this.scrollSelectedIntoCenter(true));
    },
    syncSelectedIndex() {
      const index = this.getItemIndex(this.selectedItem);
      this.selectedIndex = index == null ? 0 : index;
    },
    getItemIndex(item) {
      if (!item) {
        return null;
      }
      for (const i in this.items) {
        const menuItem = this.items[i];
        if (this.getItemId(item) === this.getItemId(menuItem)) {
          return ~~i;
        }
      }
      return null;
    },
    getItemId(item) {
      return item.id || item.value || item.name;
    },
    updateOverflow() {
      const menu = this.$refs.navMenu;
      this.canPan = Boolean(menu && menu.scrollWidth > menu.clientWidth + 1);
    },
    scrollSelectedIntoCenter(smooth = true) {
      const menu = this.$refs.navMenu;
      if (!menu) {
        return;
      }
      const item = menu.children[this.selectedIndex];
      if (!item) {
        return;
      }
      const itemCenter = item.offsetLeft + item.offsetWidth / 2;
      const left = Math.max(
        0,
        Math.min(
          itemCenter - menu.clientWidth / 2,
          menu.scrollWidth - menu.clientWidth,
        ),
      );
      if (typeof menu.scrollTo === "function") {
        menu.scrollTo({ left, behavior: smooth ? "smooth" : "auto" });
      } else {
        menu.scrollLeft = left;
      }
    },
    startPointerListen() {
      if (this.listening) {
        return;
      }
      this.listening = true;
      window.addEventListener("pointermove", this.onPointerMove, {
        capture: true,
        passive: false,
      });
      window.addEventListener("pointerup", this.onPointerUp, true);
      window.addEventListener("pointercancel", this.onPointerUp, true);
    },
    stopPointerListen() {
      if (!this.listening) {
        return;
      }
      this.listening = false;
      window.removeEventListener("pointermove", this.onPointerMove, true);
      window.removeEventListener("pointerup", this.onPointerUp, true);
      window.removeEventListener("pointercancel", this.onPointerUp, true);
    },
    onPointerDown(event) {
      // Touch/pen use native overflow scrolling — custom drag is mouse-only.
      if (event.pointerType !== "mouse" || event.button !== 0) {
        return;
      }
      const menu = this.$refs.navMenu;
      if (!menu || !this.canPan) {
        return;
      }
      this.didPan = false;
      this.drag = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startScroll: menu.scrollLeft,
        moved: false,
      };
      this.startPointerListen();
    },
    onPointerMove(event) {
      if (!this.drag || event.pointerId !== this.drag.pointerId) {
        return;
      }
      const menu = this.$refs.navMenu;
      if (!menu) {
        return;
      }
      const dx = event.clientX - this.drag.startX;
      const dy = event.clientY - this.drag.startY;
      if (!this.drag.moved) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) {
          return;
        }
        if (Math.abs(dy) >= Math.abs(dx)) {
          this.drag = null;
          this.stopPointerListen();
          return;
        }
        if (menu.hasPointerCapture?.(event.pointerId) !== true) {
          try {
            menu.setPointerCapture(event.pointerId);
          } catch (_) {
            /* ignore */
          }
        }
        this.drag = { ...this.drag, moved: true };
      }
      event.preventDefault();
      menu.scrollLeft = this.drag.startScroll - dx;
    },
    onPointerUp(event) {
      if (!this.drag) {
        this.stopPointerListen();
        return;
      }
      if (event?.pointerId != null && event.pointerId !== this.drag.pointerId) {
        return;
      }
      const menu = this.$refs.navMenu;
      if (
        menu &&
        event?.pointerId != null &&
        menu.hasPointerCapture?.(event.pointerId)
      ) {
        try {
          menu.releasePointerCapture(event.pointerId);
        } catch (_) {
          /* already released */
        }
      }
      this.didPan = this.drag.moved;
      this.drag = null;
      this.stopPointerListen();
      if (this.didPan) {
        clearTimeout(this.panReset);
        this.panReset = setTimeout(() => {
          this.didPan = false;
        }, 50);
      }
    },
  },
  watch: {
    items() {
      this.syncSelectedIndex();
      this.$nextTick(() => {
        this.updateOverflow();
        this.scrollSelectedIntoCenter(false);
      });
    },
    selectedItem() {
      this.syncSelectedIndex();
      this.$nextTick(() => this.scrollSelectedIntoCenter(true));
    },
  },
};
</script>
