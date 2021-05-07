<template>
    <div class="demo">
        <div class="form">
            <div class="form-item">
                <label
                    class="form-item-label"
                    style="width: 80px;"
                >Content: </label>
                <div
                    class="form-item-content"
                    style="margin-left: 80px;"
                >
                    <div class="demo-textarea">
                        <textarea
                            v-model="content"
                            rows="1"
                            autocomplete="off"
                            class="demo-textarea__inner"
                        ></textarea>
                    </div>
                </div>
            </div>

            <div class="form-item">
                <label
                    class="form-item-label"
                    style="width: 80px;"
                >Size: </label>
                <div
                    class="form-item-content demo-slider"
                    style="margin-left: 80px;"
                >
                    <vue-slider
                        v-model="size"
                        :min="100"
                        :max="500"
                        :interval="1"
                        :height="8"
                        :dot-size="20"
                        style="margin-top: 6px"
                    />
                </div>
            </div>

            <div class="form-item">
                <label
                    class="form-item-label"
                    style="width: 80px;"
                >Style: </label>
                <div
                    class="form-item-content demo-radio"
                    style="margin-left: 80px;"
                >
                    <label>
                        <input
                            v-model="style"
                            class="radio-type"
                            name="Normal"
                            type="radio"
                            :value="null"
                        />
                        Normal
                    </label>
                    <label>
                        <input
                            v-model="style"
                            class="radio-type"
                            name="Smooth"
                            type="radio"
                            value="smooth"
                        />
                        Smooth
                    </label>
                    <label>
                        <input
                            v-model="style"
                            class="radio-type"
                            name="Radius"
                            type="radio"
                            value="radius"
                        />
                        Radius
                    </label>
                </div>
            </div>

            <div
                class="form-item"
                v-if="style"
            >
                <label
                    class="form-item-label"
                    style="width: 80px;"
                >Extent: </label>
                <div
                    class="form-item-content demo-slider"
                    style="margin-left: 80px;"
                >
                    <vue-slider
                        v-model="styleValue"
                        :min="0"
                        :max="1"
                        :interval="0.1"
                        :height="8"
                        :dot-size="20"
                        style="margin-top: 6px"
                    />
                </div>
            </div>

            <div class="form-item-label-top">
                <label class="form-item-label">Error Correction Level: </label>
                <div class="form-item-content demo-radio">
                    <label>
                        <input
                            v-model="errorCorrectionLevel"
                            class="radio-type"
                            name="Low"
                            type="radio"
                            :value="ErrorCorrectionLevel.L"
                        />
                        Low
                    </label>
                    <label>
                        <input
                            v-model="errorCorrectionLevel"
                            class="radio-type"
                            name="Medium"
                            type="radio"
                            :value="ErrorCorrectionLevel.M"
                        />
                        Medium
                    </label>
                    <label>
                        <input
                            v-model="errorCorrectionLevel"
                            class="radio-type"
                            name="Quartile"
                            type="radio"
                            :value="ErrorCorrectionLevel.Q"
                        />
                        Quartile
                    </label>
                    <label>
                        <input
                            v-model="errorCorrectionLevel"
                            class="radio-type"
                            name="High"
                            type="radio"
                            :value="ErrorCorrectionLevel.H"
                        />
                        High
                    </label>
                </div>
            </div>

            <div class="qrcode-canvas">
                <canvas ref="qrcodeCanvas"></canvas>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref, toRefs, watch } from 'vue';
import VueSlider from 'vue-slider-component';
import 'vue-slider-component/theme/antd.css';
import {
    Creator,
    CreatorOptions,
    QRMode,
    QRMatrix,
    ErrorCorrectionLevel,
    MaskPattern,
    QRStyle,
    RenderOptions,
    Renderer,
} from '../../../../dist/easy-qrcode';

export default defineComponent({
    name: 'Demo',
    components: {
        VueSlider,
    },
    props: {},
    setup(props) {
        const qrcodeCanvas = ref<any>(null);

        const state = reactive({
            content: 'Hello, QR code',
            size: 250,
            style: null as null | QRStyle,
            styleValue: 0.5,
            errorCorrectionLevel: ErrorCorrectionLevel.M,
        });

        const qrRenderer = new Renderer({
            size: state.size,
            resize: true,
        });

        const debounce = (func: Function, wait: number, immediate: boolean = false) => {
            let timeout: any;
            return () => {
                const later = () => {
                    timeout = null;
                    if (!immediate) {
                        func();
                    }
                };

                const callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) {
                    func();
                }
            };
        };

        const drawQRcode = () => {
            const qrCreator = new Creator({
                errorCorrectionLevel: state.errorCorrectionLevel,
            });
            const qrMatrix = qrCreator.add(state.content).create().getMatrix();
            const opts: RenderOptions = {
                size: state.size,
                style: state.style ? state.style : undefined,
                styleValue: state.styleValue,
                resize: true,
            };

            qrRenderer.updateOptions(opts);
            qrRenderer.drawCanvas(qrMatrix, qrcodeCanvas.value);
        };

        const updateQRcode = debounce(drawQRcode, 250);

        onMounted(() => {
            drawQRcode();
        });

        watch(() => state.content, updateQRcode);
        watch(() => state.size, updateQRcode);
        watch(() => state.style, updateQRcode);
        watch(() => state.styleValue, updateQRcode);
        watch(() => state.errorCorrectionLevel, updateQRcode);

        return {
            ...toRefs(state),
            qrcodeCanvas,
            ErrorCorrectionLevel,
        };
    },
});
</script>

<style>
</style>