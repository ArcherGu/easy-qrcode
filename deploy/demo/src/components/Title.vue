<template>
    <div class="title">
        <img
            alt="Easy QRcode"
            src="../assets/logo_2.png"
            class="logo"
        >
        Easy-QRcode
        <small class="version">({{ version }})</small>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { version } from '../../../../package.json';

export default defineComponent({
    name: 'Title',
    components: {},
    props: {},
    setup(props) {
        return {
            version,
        };
    },
});
</script>

<style>
</style>