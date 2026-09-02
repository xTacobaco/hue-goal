<template>
  <Teleport to="body">
    <div
      class="task-editor-overlay"
      @click.self="close"
    >
      <div
        ref="dialog"
        class="task-editor"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-editor-title"
        tabindex="-1"
      >
        <div class="task-editor-header">
          <h2 id="task-editor-title">{{ $t("lists.edit") }}</h2>
          <button
            type="button"
            class="task-editor-icon"
            :aria-label="$t('lists.close')"
            :title="$t('lists.close')"
            @click="close"
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
        <ul class="task-editor-list">
          <li
            v-for="row in rows"
            :key="row.id"
            class="task-editor-row"
            :class="{ dragging: dragId === row.id }"
            :data-task-id="row.id"
          >
            <button
              v-if="rows.length > 1"
              type="button"
              class="task-editor-grip"
              :aria-label="$t('lists.reorder')"
              :title="$t('lists.reorder')"
              @pointerdown.prevent="startDrag($event, row.id)"
            >
              <svg viewBox="0 0 12 16" fill="none" aria-hidden="true">
                <circle cx="3" cy="3" r="1.15" fill="currentColor" />
                <circle cx="9" cy="3" r="1.15" fill="currentColor" />
                <circle cx="3" cy="8" r="1.15" fill="currentColor" />
                <circle cx="9" cy="8" r="1.15" fill="currentColor" />
                <circle cx="3" cy="13" r="1.15" fill="currentColor" />
                <circle cx="9" cy="13" r="1.15" fill="currentColor" />
              </svg>
            </button>
            <input
              class="task-editor-name"
              type="text"
              maxlength="20"
              :value="row.label"
              :aria-label="row.label"
              @input="onRenameInput(row, $event.target.value)"
              @blur="commitRename(row)"
              @keydown.enter.prevent="$event.target.blur()"
            />
            <button
              v-if="rows.length > 1"
              type="button"
              class="task-editor-icon danger"
              :title="$t('lists.remove')"
              :aria-label="$t('lists.remove')"
              @click="remove(row)"
            >
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M4 4l8 8M12 4l-8 8"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </li>
        </ul>
        <form
          v-if="rows.length < MAX_LISTS"
          class="task-editor-add-form"
          @submit.prevent="commitAdd"
        >
          <input
            ref="addInput"
            v-model="draft"
            class="task-editor-name"
            type="text"
            maxlength="20"
            :placeholder="$t('lists.addPlaceholder')"
            :aria-label="$t('lists.add')"
          />
          <button
            type="submit"
            class="task-editor-add"
            :disabled="!draft.trim()"
          >
            {{ $t("lists.add") }}
          </button>
        </form>
      </div>
    </div>
  </Teleport>
</template>
<script>
import { mapActions, mapState } from "pinia";
import { useUserStore } from "@/datastores/user.js";
import { LABEL_MAX, MAX_LISTS, useDatesStore } from "@/datastores/dates.js";

export default {
  emits: ["close"],
  props: {
    tasks: {
      type: Array,
      default: () => [],
    },
    startAdding: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      rows: [],
      draft: "",
      dragId: null,
      dragPointerId: null,
      orderDirty: false,
      previousOverflow: "",
      MAX_LISTS,
      LABEL_MAX,
    };
  },
  computed: {
    ...mapState(useUserStore, ["user"]),
  },
  watch: {
    tasks: {
      immediate: true,
      handler(items) {
        this.syncRows(items);
      },
    },
  },
  mounted() {
    this.previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    this.onWindowKey = (event) => {
      if (event.key === "Escape") {
        this.close();
      }
    };
    window.addEventListener("keydown", this.onWindowKey);
    this.$nextTick(() => {
      if (this.startAdding) {
        this.$refs.addInput?.focus();
        return;
      }
      this.$refs.dialog?.focus();
    });
  },
  unmounted() {
    this.unbindDrag();
    window.removeEventListener("keydown", this.onWindowKey);
    document.body.style.overflow = this.previousOverflow;
  },
  methods: {
    close() {
      if (this.dragId) {
        return;
      }
      this.$emit("close");
    },
    rowFromTask(task) {
      return {
        id: task.id || task.name,
        label: task.label || task.name,
      };
    },
    syncRows(items) {
      if (this.dragId || this.orderDirty) {
        return;
      }
      const incoming = (items || []).map((task) => this.rowFromTask(task));
      const focusedId = document.activeElement
        ?.closest?.("[data-task-id]")
        ?.getAttribute("data-task-id");
      this.rows = incoming.map((task) => {
        const existing = this.rows.find((row) => row.id === task.id);
        if (existing && focusedId === task.id) {
          return existing;
        }
        return task;
      });
    },
    onRenameInput(row, value) {
      row.label = value.slice(0, LABEL_MAX);
    },
    async ensureUserId() {
      if (this.user?.id) {
        return this.user.id;
      }
      return this.tempSignIn();
    },
    async commitRename(row) {
      const label = (row.label || "").trim().slice(0, LABEL_MAX);
      const original = this.tasks.find(
        (task) => (task.id || task.name) === row.id,
      );
      const originalLabel = original?.label || original?.name || "";
      if (!label) {
        row.label = originalLabel;
        return;
      }
      if (label === originalLabel) {
        row.label = label;
        return;
      }
      try {
        const userId = await this.ensureUserId();
        await this.renameList({ userId, id: row.id, label });
      } catch {
        row.label = originalLabel;
      }
    },
    async remove(row) {
      if (this.rows.length <= 1) {
        return;
      }
      try {
        const userId = await this.ensureUserId();
        await this.removeList({ userId, id: row.id });
      } catch {
        // Keep the row visible if the write fails.
      }
    },
    async commitAdd() {
      const label = this.draft.trim();
      if (!label) {
        return;
      }
      try {
        const userId = await this.ensureUserId();
        const list = await this.addList({ userId, label });
        if (list) {
          this.draft = "";
        }
      } catch {
        // Keep the draft so the label is not lost if the write fails.
      }
    },
    bindDrag() {
      window.addEventListener("pointermove", this.onDragMove, true);
      window.addEventListener("pointerup", this.endDrag, true);
      window.addEventListener("pointercancel", this.endDrag, true);
    },
    unbindDrag() {
      window.removeEventListener("pointermove", this.onDragMove, true);
      window.removeEventListener("pointerup", this.endDrag, true);
      window.removeEventListener("pointercancel", this.endDrag, true);
    },
    startDrag(event, id) {
      if (this.rows.length <= 1) {
        return;
      }
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }
      this.dragId = id;
      this.dragPointerId = event.pointerId;
      this.orderDirty = false;
      this.bindDrag();
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    onDragMove(event) {
      if (!this.dragId || event.pointerId !== this.dragPointerId) {
        return;
      }
      if (event.buttons === 0) {
        this.endDrag(event);
        return;
      }
      const el = document.elementFromPoint(event.clientX, event.clientY);
      const overId = el?.closest?.("[data-task-id]")?.getAttribute("data-task-id");
      if (!overId || overId === this.dragId) {
        return;
      }
      const from = this.rows.findIndex((row) => row.id === this.dragId);
      const to = this.rows.findIndex((row) => row.id === overId);
      if (from < 0 || to < 0) {
        return;
      }
      const next = [...this.rows];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      this.rows = next;
      this.orderDirty = true;
    },
    async endDrag(event) {
      if (
        event?.pointerId != null &&
        this.dragPointerId != null &&
        event.pointerId !== this.dragPointerId
      ) {
        return;
      }
      if (!this.dragId) {
        this.unbindDrag();
        return;
      }
      this.unbindDrag();
      this.dragId = null;
      this.dragPointerId = null;
      if (!this.orderDirty) {
        return;
      }
      try {
        const userId = await this.ensureUserId();
        await this.reorderLists({
          userId,
          orderedIds: this.rows.map((row) => row.id),
        });
        this.orderDirty = false;
      } catch {
        this.orderDirty = false;
        this.syncRows(this.tasks);
      }
    },
    ...mapActions(useUserStore, ["tempSignIn"]),
    ...mapActions(useDatesStore, [
      "addList",
      "removeList",
      "renameList",
      "reorderLists",
    ]),
  },
};
</script>
<style scoped>
.task-editor-overlay {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.55);
}

.task-editor {
  width: min(320px, 100%);
  box-sizing: border-box;
  padding: 14px;
  border: 1px solid #363636;
  border-radius: 14px;
  background: #212121;
  color: #fff;
  outline: none;
}

.task-editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.task-editor-header h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
}

.task-editor-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.task-editor-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px;
  border-radius: 8px;
}

.task-editor-row.dragging {
  opacity: 0.45;
}

.task-editor-grip,
.task-editor-icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  background: transparent;
  color: #c8c8c8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 6px;
}

.task-editor-grip {
  cursor: grab;
  touch-action: none;
}

.task-editor-grip:active {
  cursor: grabbing;
}

.task-editor-grip svg,
.task-editor-icon svg {
  width: 14px;
  height: 14px;
  display: block;
}

.task-editor-grip svg {
  width: 12px;
  height: 16px;
}

.task-editor-icon.danger {
  color: #e05656;
}

.task-editor-name {
  flex: 1;
  min-width: 0;
  background: #161616;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 10px;
  font: inherit;
  font-size: 14px;
  outline: none;
  box-shadow: none;
}

.task-editor-name:focus,
.task-editor-name:focus-visible {
  outline: none;
  box-shadow: none;
  border: none;
}

.task-editor-add-form {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
}

.task-editor-add {
  flex-shrink: 0;
  height: 40px;
  padding: 0 16px;
  border: none;
  border-radius: 999px;
  color: #fff;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  background-color: hsl(271, 70%, 50%);
  background-image: linear-gradient(
    30deg,
    hsl(271, 70%, 50%),
    hsl(239, 70%, 50%)
  );
  box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.5);
}

.task-editor-add:disabled {
  background-color: hsl(271, 70%, 35%);
  background-image: linear-gradient(
    45deg,
    hsl(271, 70%, 35%),
    hsl(239, 70%, 35%)
  );
  box-shadow: none;
  cursor: not-allowed;
}

@media (hover: hover) {
  .task-editor-add:hover:not(:disabled) {
    background-color: hsl(271, 70%, 40%);
    background-image: linear-gradient(
      30deg,
      hsl(271, 70%, 40%),
      hsl(239, 70%, 40%)
    );
  }
}

.task-editor-icon:focus-visible,
.task-editor-grip:focus-visible,
.task-editor-add:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}
</style>
