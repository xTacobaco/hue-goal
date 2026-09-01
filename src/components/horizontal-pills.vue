<template>
  <div class="horizontal-pills-container">
    <div ref="navMenu" class="horizontal-pills-menu">
      <div
        v-for="(item, index) in items"
        :key="item.name"
        @click.stop.prevent="selectItem(index)"
        class="gmf-horizontal-pills-item"
        :class="{
          'gmf-active': index === selectedIndex,
          'gmf-done': item.done,
        }"
        :ref="el => setItemRef(el, item)"
      >
        <slot :item="item" :index="index">
          <template v-if="item.name">
            <div>{{ item.label || item.name }}</div>
          </template>
        </slot>
      </div>
    </div>
    <slot name="after"></slot>
  </div>
</template>
<style>
.horizontal-pills-container {
  display: flex;
  position: relative;
  overflow-x: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
  align-items: center;
  width: 100%;
}

.horizontal-pills-menu {
  margin: 0;
  display: flex;
  background: inherit;
  padding: 4px;
  overflow-x: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
  position: relative;
  gap: 1px;
  flex: 1;
  min-width: 0;
}

.horizontal-pills-menu::-webkit-scrollbar, .horizontal-pills-container::-webkit-scrollbar {
  display: none;
}

.gmf-horizontal-pills-item {
  flex-shrink: 0;
  cursor: pointer;
  user-select: none;
  align-items: center;
  gap: 2px;
  display: inline-flex;
  padding: 4px;
  color: white;
  border-radius: 6px;
  font-size: 14px;
  position: relative;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.gmf-horizontal-pills-item.gmf-done {
  color: #7229d4;
}

.gmf-horizontal-pills-item.gmf-active {
  background-color: white;
  color: black;
}

.gmf-horizontal-pills-item.gmf-active.gmf-done {
  background-color: #7229d4;
  color: white;
}

.pill-remove {
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 0 2px;
}

.pill-remove:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pill-add {
  flex-shrink: 0;
  border: none;
  background: transparent;
  color: white;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 4px 8px;
}

.pill-add:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pill-add-form {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.pill-add-input {
  background: #161616;
  color: white;
  border: 1px solid #363636;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 14px;
  width: 120px;
  outline: none;
}

.pill-add-input:focus {
  border-color: #7229d4;
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
  data () {
    return {
      selectedIndex: 0,
      itemRefMap: {},
    };
  },
  mounted () {
    this.$nextTick(() => {
      this.checkWidth();
    });
    this.syncSelectedIndex();
  },
  methods: {
    checkWidth () {
      const navMenu = this.$refs.navMenu;
    },
    selectItem (index) {
      this.selectedIndex = index;
      this.$emit('update:selectedItem', this.items[index]);
    },
    syncSelectedIndex () {
      const index = this.getItemIndex(this.selectedItem);
      this.selectedIndex = index == null ? 0 : index;
    },
    getItemIndex (item) {
      if (! item) {
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
    getItemId (item) {
      return item.id || item.value || item.name;
    },
    setItemRef (el, item) {
      this.itemRefMap[this.getItemId(item)] = el;
    },
  },
  watch: {
    items () {
      this.$nextTick(() => {
        this.checkWidth();
      });
      this.syncSelectedIndex();
    },
    /**
     * Selected item is updated in parent component.
     */
    selectedItem () {
      this.syncSelectedIndex();
    },
  },
};
</script>
