<template>
    <Title />
    <Introduction />
    <Demo />
    <Links />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Title from './components/Title.vue';
import Introduction from './components/Introduction.vue';
import Demo from './components/Demo.vue';
import Links from './components/Links.vue';

export default defineComponent({
    name: 'App',
    components: {
        Title,
        Introduction,
        Demo,
        Links,
    },
});
</script>

<style>
</style>
