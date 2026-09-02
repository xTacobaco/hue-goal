<template>
  <div class="horizontal-pills-container">
    <div
      ref="navMenu"
      class="horizontal-pills-menu"
      :class="{ 'is-panning': panning, 'can-pan': canPan }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @lostpointercapture="onPointerUp"
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
  touch-action: pan-y;
  overscroll-behavior-x: contain;
  user-select: none;
}

.horizontal-pills-menu.can-pan {
  cursor: grab;
}

.horizontal-pills-menu.is-panning {
  cursor: grabbing;
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
  },
  unmounted() {
    clearTimeout(this.panReset);
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
    onPointerDown(event) {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }
      const menu = this.$refs.navMenu;
      if (!menu) {
        return;
      }
      this.didPan = false;
      this.drag = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startScroll: menu.scrollLeft,
        moved: false,
        captured: false,
      };
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
      if (!this.drag.moved && Math.abs(dx) < 6) {
        return;
      }
      if (!this.drag.captured) {
        menu.setPointerCapture(event.pointerId);
      }
      this.drag = { ...this.drag, moved: true, captured: true };
      event.preventDefault();
      menu.scrollLeft = this.drag.startScroll - dx;
    },
    onPointerUp(event) {
      if (!this.drag) {
        return;
      }
      if (event?.pointerId != null && event.pointerId !== this.drag.pointerId) {
        return;
      }
      this.didPan = this.drag.moved;
      this.drag = null;
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
      this.$nextTick(() => this.updateOverflow());
    },
    selectedItem() {
      this.syncSelectedIndex();
    },
  },
};
</script>
