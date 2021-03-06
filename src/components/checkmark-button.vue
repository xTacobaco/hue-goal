<template>
    <button class="btn" :class="{ 'done': done }">
        <transition name="check">
            <span v-if="done" class="checkmark" />
        </transition>
        <transition name="fade">
            <span v-if="! done" class="btn-text">
                <slot></slot>
            </span>
        </transition>
    </button>
</template>

<script>
    export default {
        props: {
            done: {
                type: Boolean,
                default: false
            }
        },
    }
</script>