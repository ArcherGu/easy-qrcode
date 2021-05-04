import { QRMatrix } from "src/common/QR";
import { Voidable } from "../utils/types_tool";

export function drawCorner(ctx: CanvasRenderingContext2D, cornerX: number, cornerY: number, x: number, y: number, r: number) {
    if (r) {
        ctx.arcTo(cornerX, cornerY, x, y, r);
    } else {
        ctx.lineTo(cornerX, cornerY);
        ctx.lineTo(x, y);
    }
}

export function fillCorner(context: CanvasRenderingContext2D, startX: number, startY: number, cornerX: number, cornerY: number, destX: number, destY: number, radius: number) {
    context.beginPath();
    context.moveTo(startX, startY);
    drawCorner(context, cornerX, cornerY, destX, destY, radius);
    context.lineTo(cornerX, cornerY);
    context.lineTo(startX, startY);
    context.fill();
}

export function getCorners(matrix: QRMatrix, i: number, j: number): number[] {
    const isFill = !!matrix[i][j];
    const max = matrix.length - 1;
    const corners = [0, 0, 0, 0]; // NW, NE, SE, SW
    if (i > 0 && matrix[i - 1][j]) {
        corners[0] += 1;
        corners[1] += 1;
    }
    if (i < max && matrix[i + 1][j]) {
        corners[2] += 1;
        corners[3] += 1;
    }
    if (j > 0 && matrix[i][j - 1]) {
        corners[0] += 1;
        corners[3] += 1;
    }
    if (j < max && matrix[i][j + 1]) {
        corners[1] += 1;
        corners[2] += 1;
    }

    if (isFill) {
        if (i > 0 && j > 0 && matrix[i - 1][j - 1]) {
            corners[0] += 1;
        }
        if (i > 0 && j < max && matrix[i - 1][j + 1]) {
            corners[1] += 1;
        }
        if (i < max && j < max && matrix[i + 1][j + 1]) {
            corners[2] += 1;
        }
        if (i < max && j > 0 && matrix[i + 1][j - 1]) {
            corners[3] += 1;
        }
    }

    return corners;
}

export function resizeCanvas(canvas: HTMLCanvasElement, width: number, height?: number): HTMLCanvasElement {
    canvas.width = width;
    canvas.height = height == null ? width : height;
    return canvas;
}

export function createCanvas(width: number, height?: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height == null ? width : height;
    return canvas;
}

export function updateCanvas(canvas: Voidable<HTMLCanvasElement>, width: number, height?: number): HTMLCanvasElement {
    if (canvas) {
        return resizeCanvas(canvas, width, height);
    }

    return createCanvas(width, height);
}