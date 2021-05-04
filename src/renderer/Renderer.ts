import { Voidable } from "../utils/types_tool";
import { QRMatrix } from "../common/QR";

export type QRStyle = 'smooth' | 'radius';

export interface RenderOptions {
    size?: number;
    gridSize?: number;
    resize?: boolean;
    style?: QRStyle;
    styleValue?: number;
}

export class Renderer {
    private opts: RenderOptions = {};
    constructor(
        opts?: RenderOptions
    ) {
        this.updateOptions(opts);
    }

    public updateOptions(opts?: RenderOptions): Renderer {
        if (!opts) {
            return this;
        }

        this.opts = Object.assign({}, this.opts, opts);

        return this;
    }

    public drawCanvas(matrix: QRMatrix, canvas?: HTMLCanvasElement): HTMLCanvasElement {
        const qrCount = matrix.length;
        let canvasQR: HTMLCanvasElement;

        // tslint:disable-next-line:prefer-const
        let { gridSize, size, resize } = this.opts;
        if (!canvas && !gridSize && !size) {
            gridSize = 5;
        }

        if (gridSize) {
            size = qrCount * gridSize;
        }

        if (size) {
            canvasQR = resize || !canvas ? Renderer.updateCanvas(canvas, size) : canvas;
        } else {
            size = canvas!.width;
            canvasQR = canvas!;
        }

        const ctx = canvasQR.getContext('2d')!;
        ctx.clearRect(0, 0, canvasQR.width, canvasQR.height);
        gridSize = Math.ceil(size / qrCount);

        for (let i = 0; i < matrix.length; i++) {
            const rowData = matrix[i];
            for (let j = 0; j < rowData.length; j++) {
                const col = rowData[j];
                const x = j * gridSize;
                const y = i * gridSize;
                if (col) {
                    ctx.fillRect(x, y, gridSize, gridSize);
                }
            }
        }

        return canvasQR;
    }

    public static resizeCanvas(canvas: HTMLCanvasElement, width: number, height?: number): HTMLCanvasElement {
        canvas.width = width;
        canvas.height = height == null ? width : height;
        return canvas;
    }

    public static createCanvas(width: number, height?: number): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height == null ? width : height;
        return canvas;
    }

    public static updateCanvas(canvas: Voidable<HTMLCanvasElement>, width: number, height?: number): HTMLCanvasElement {
        if (canvas) {
            return Renderer.resizeCanvas(canvas, width, height);
        }

        return Renderer.createCanvas(width, height);
    }
}