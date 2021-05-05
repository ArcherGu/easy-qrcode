import { QRMatrix } from "../common/QR";
import { drawCorner, fillCorner, getCorners, updateCanvas } from "./helper";

/**
 * QR code rendering style.
 * 
 * smooth: The filled grids are linked by smooth fillets.
 * 
 * radius: The filled grids are decorated with fillets around them.
 */
export type QRStyle = 'smooth' | 'radius';

/**
 * The options for renderer
 *
 * @export
 * @interface RenderOptions
 */
export interface RenderOptions {
    /**
     * QR code image size, if {@link gridSize} is specified, size will be ignored.
     *
     * @type {number}
     */
    size?: number;
    /**
     * QR code grid size, the pixel size occupied by the one grid.
     *
     * @type {number}
     */
    gridSize?: number;
    /**
     * Whether resize canvas.
     *
     * @type {boolean}
     */
    resize?: boolean;
    /**
     * Style for the QR code image.
     *
     * @type {QRStyle}
     */
    style?: QRStyle;
    /**
     * The value to which the style has changed.
     *
     * @type {number}
     */
    styleValue?: number;
}

/**
 * QR code's renderer, which relies on canvas, is used for the boolean matrix provided by creator.
 *
 * You can design your own renderer to render the boolean matrix provided by creator.
 * 
 * @export
 * @class Renderer
 */
export class Renderer {
    private opts: RenderOptions = {};
    constructor(
        opts?: RenderOptions
    ) {
        this.updateOptions(opts);
    }

    /**
     * Update the options.
     *
     * @param {RenderOptions} [opts]
     * @returns {Renderer}
     */
    public updateOptions(opts?: RenderOptions): Renderer {
        if (!opts) {
            return this;
        }

        this.opts = Object.assign({}, this.opts, opts);

        return this;
    }

    /**
     * Draw QR code on canvas.
     * 
     * If canvas are not provided, one will be created automatically.
     *
     * @param {QRMatrix} matrix
     * @param {HTMLCanvasElement} [canvas]
     * @returns {HTMLCanvasElement}
     */
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
            canvasQR = resize || !canvas ? updateCanvas(canvas, size) : canvas;
        } else {
            size = canvas!.width;
            canvasQR = canvas!;
        }

        const ctx = canvasQR.getContext('2d')!;
        ctx.clearRect(0, 0, canvasQR.width, canvasQR.height);
        gridSize = Math.floor(size / qrCount);

        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                const x = j * gridSize;
                const y = i * gridSize;

                if (this.opts.style === 'radius') {
                    if (matrix[i][j]) this.drawRadiusGrid(ctx, x, y, gridSize);
                }
                else if (this.opts.style === 'smooth') {
                    const corners = getCorners(matrix, i, j);
                    this.drawSmoothGrid(ctx, x, y, gridSize, corners, !!(matrix[i][j]));
                }
                else {
                    if (matrix[i][j]) ctx.fillRect(x, y, gridSize, gridSize);
                }
            }
        }

        return canvasQR;
    }

    private drawRadiusGrid(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
        const value = this.opts.styleValue && this.opts.styleValue > 0 ? this.opts.styleValue : 0;
        let radius = value * size / 2;
        radius = radius > (size / 2) ? size / 2 : radius;
        ctx.beginPath();
        ctx.moveTo(x + 0.5 * size, y);
        drawCorner(ctx, x + size, y, x + size, y + 0.5 * size, radius);
        drawCorner(ctx, x + size, y + size, x + 0.5 * size, y + size, radius);
        drawCorner(ctx, x, y + size, x, y + 0.5 * size, radius);
        drawCorner(ctx, x, y, x + 0.5 * size, y, radius);
        ctx.fill();
    }

    private drawSmoothGrid(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, corners: number[], isFill: boolean) {
        const value = this.opts.styleValue && this.opts.styleValue > 0 ? this.opts.styleValue : 0;
        let radius = value * size / 2;
        radius = radius > (size / 2) ? size / 2 : radius;

        if (isFill) {
            ctx.beginPath();
            ctx.moveTo(x + 0.5 * size, y);
            drawCorner(
                ctx,
                x + size,
                y,
                x + size,
                y + 0.5 * size,
                corners[1] ? 0 : radius,
            );
            drawCorner(
                ctx,
                x + size,
                y + size,
                x + 0.5 * size,
                y + size,
                corners[2] ? 0 : radius,
            );
            drawCorner(ctx, x, y + size, x, y + 0.5 * size, corners[3] ? 0 : radius);
            drawCorner(ctx, x, y, x + 0.5 * size, y, corners[0] ? 0 : radius);
            ctx.fill();
        }
        else {
            if (corners[0] === 2) {
                fillCorner(ctx, x, y + 0.5 * size, x, y, x + 0.5 * size, y, radius);
            }
            if (corners[1] === 2) {
                fillCorner(
                    ctx,
                    x + 0.5 * size,
                    y,
                    x + size,
                    y,
                    x + size,
                    y + 0.5 * size,
                    radius,
                );
            }
            if (corners[2] === 2) {
                fillCorner(
                    ctx,
                    x + size,
                    y + 0.5 * size,
                    x + size,
                    y + size,
                    x + 0.5 * size,
                    y + size,
                    radius,
                );
            }
            if (corners[3] === 2) {
                fillCorner(
                    ctx,
                    x + 0.5 * size,
                    y + size,
                    x,
                    y + size,
                    x,
                    y + 0.5 * size,
                    radius,
                );
            }
        }
    }
}