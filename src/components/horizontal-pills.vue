<template>
    <div class="gmf-horizontal-pills-container">
      <div ref="navMenu" class="gmf-horizontal-pills-menu">
        <div
          v-for="(item, index) in items"
          :key="item.name"
          @click.stop.prevent="selectItem(index)"
          class="gmf-horizontal-pills-item"
          :class="{ 'gmf-active': index === selectedIndex }"
          :ref="el => setItemRef(el, item)"
        >
          <slot :item="item" :index="index">
            <template v-if="item.name">
              <div>{{ item.name }}</div>
            </template>
          </slot>
        </div>
      </div>
    </div>
  </template>
  <style>
  .gmf-horizontal-pills-container {
    display: flex;
    position: relative;
    overflow-x: hidden;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .gmf-horizontal-pills-menu {
    margin: 0;
    display: flex;
    background: inherit;
    padding: 4px;
    overflow-x: scroll;
    scrollbar-width: none;
    -ms-overflow-style: none;
    position: relative;
    gap: 1px;
  }
  
  .gmf-horizontal-pills-menu::-webkit-scrollbar, .gmf-horizontal-pills-container::-webkit-scrollbar {
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
  }
  
  .gmf-horizontal-pills-item.gmf-active {
    background-color: white;
    color: black;
  }
  </style>
  <script>
  export default {
    props: {
      items: {
        Type: Array,
        default: [],
      },
      selectedItem: {
        Type: Object,
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
      if (this.selectedItem) {
        this.selectedIndex = this.getItemIndex(this.selectedItem);
      }
    },
    methods: {
      checkWidth () {
        const navMenu = this.$refs.navMenu;
      },
      selectItem (index) {
        this.selectedIndex = index;
        this.$emit('update:selectedItem', this.items[index]);
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
      },
      /** 
       * Selected item is updated in parent component.
       */
      selectedItem (item) {
        // Update selected index.
        this.selectedIndex = this.getItemIndex(item);
  
        if (! item) {
          return;
        }
      },
    },
  };
  </script>