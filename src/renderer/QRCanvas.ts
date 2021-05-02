export type QRCanvasStyle = 'smooth' | 'radius';

export interface QRCanvasOptions {
    size?: number;
    gridSize?: number;
    margin?: number;
    style?: QRCanvasStyle;
    styleValue?: number;
}

export class QRCanvas {
    public createCanvas(width: number, height: number): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }
}