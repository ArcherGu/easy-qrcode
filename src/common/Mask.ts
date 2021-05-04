import { Nullable } from "../utils/types_tool";
import { QRMatrix } from "./QR";

const N1: number = 3;
const N2: number = 3;
const N3: number = 40;
const N4: number = 10;

/**
 * Mask Pattern
 * @readonly
 * @enum {number}
 */
export enum MaskPattern {
    PATTERN000 = 0b000,
    PATTERN001 = 0b001,
    PATTERN010 = 0b010,
    PATTERN011 = 0b011,
    PATTERN100 = 0b100,
    PATTERN101 = 0b101,
    PATTERN110 = 0b110,
    PATTERN111 = 0b111
}

export type MaskFunc = (x: number, y: number) => boolean;

/**
 * Get mask function by mask pattern
 *
 * @export
 * @param {number} maskPattern
 * @returns {MaskFunc}
 */
export function getMaskFunc(maskPattern: number): MaskFunc {
    switch (maskPattern) {
        case MaskPattern.PATTERN000:
            return (x: number, y: number): boolean => ((x + y) & 0x1) === 0;
        case MaskPattern.PATTERN001:
            return (x: number, y: number): boolean => (y & 0x1) === 0;
        case MaskPattern.PATTERN010:
            return (x: number, y: number): boolean => x % 3 === 0;
        case MaskPattern.PATTERN011:
            return (x: number, y: number): boolean => (x + y) % 3 === 0;
        case MaskPattern.PATTERN100:
            return (x: number, y: number): boolean => ((((x / 3) >> 0) + ((y / 2) >> 0)) & 0x1) === 0;
        case MaskPattern.PATTERN101:
            return (x: number, y: number): boolean => ((x * y) & 0x1) + ((x * y) % 3) === 0;
        case MaskPattern.PATTERN110:
            return (x: number, y: number): boolean => ((((x * y) & 0x1) + ((x * y) % 3)) & 0x1) === 0;
        case MaskPattern.PATTERN111:
            return (x: number, y: number): boolean => ((((x * y) % 3) + ((x + y) & 0x1)) & 0x1) === 0;
        default:
            throw new Error(`invalid mask: ${maskPattern}`);
    }
}

function isFill(matrix: QRMatrix, row: number, col: number): boolean {
    if (matrix[row][col] !== null) {
        return !!matrix[row][col];
    } else {
        return false;
    }
}

function applyMaskPenaltyRule1Internal(matrix: QRMatrix, matrixSize: number, isHorizontal: boolean): number {
    let penalty: number = 0;

    for (let i: number = 0; i < matrixSize; i++) {
        let prevBit: Nullable<boolean> = null;
        let numSameBitCells: number = 0;

        for (let j: number = 0; j < matrixSize; j++) {
            const bit: boolean = isHorizontal ? isFill(matrix, i, j) : isFill(matrix, j, i);

            if (bit === prevBit) {
                numSameBitCells++;

                if (numSameBitCells === 5) {
                    penalty += N1;
                } else if (numSameBitCells > 5) {
                    penalty++;
                }
            } else {
                // set prev bit
                prevBit = bit;
                // include the cell itself
                numSameBitCells = 1;
            }
        }
    }

    return penalty;
}

function applyMaskPenaltyRule1(matrix: QRMatrix, matrixSize: number): number {
    return applyMaskPenaltyRule1Internal(matrix, matrixSize, true) + applyMaskPenaltyRule1Internal(matrix, matrixSize, false);
}

function applyMaskPenaltyRule2(matrix: QRMatrix, matrixSize: number): number {
    let penalty: number = 0;

    for (let y: number = 0; y < matrixSize - 1; y++) {
        for (let x: number = 0; x < matrixSize - 1; x++) {
            const value: boolean = isFill(matrix, y, x);

            if (value === isFill(matrix, y, x + 1) && value === isFill(matrix, y + 1, x) && value === isFill(matrix, y + 1, x + 1)) {
                penalty += N2;
            }
        }
    }

    return penalty;
}

function isFourWhite(matrix: QRMatrix, matrixSize: number, rangeIndex: number, from: number, to: number, isHorizontal: boolean): boolean {
    from = Math.max(from, 0);
    to = Math.min(to, matrixSize);

    for (let i: number = from; i < to; i++) {
        const value: boolean = isHorizontal ? isFill(matrix, rangeIndex, i) : isFill(matrix, i, rangeIndex);

        if (value) {
            return false;
        }
    }

    return true;
}

function applyMaskPenaltyRule3(matrix: QRMatrix, matrixSize: number): number {
    let penalty: number = 0;

    for (let y: number = 0; y < matrixSize; y++) {
        for (let x: number = 0; x < matrixSize; x++) {
            if (
                x + 6 < matrixSize &&
                isFill(matrix, y, x) &&
                !isFill(matrix, y, x + 1) &&
                isFill(matrix, y, x + 2) &&
                isFill(matrix, y, x + 3) &&
                isFill(matrix, y, x + 4) &&
                !isFill(matrix, y, x + 5) &&
                isFill(matrix, y, x + 6) &&
                (isFourWhite(matrix, matrixSize, y, x - 4, x, true) || isFourWhite(matrix, matrixSize, y, x + 7, x + 11, true))
            ) {
                penalty += N3;
            }

            if (
                y + 6 < matrixSize &&
                isFill(matrix, y, x) &&
                !isFill(matrix, y + 1, x) &&
                isFill(matrix, y + 2, x) &&
                isFill(matrix, y + 3, x) &&
                isFill(matrix, y + 4, x) &&
                !isFill(matrix, y + 5, x) &&
                isFill(matrix, y + 6, x) &&
                (isFourWhite(matrix, matrixSize, x, y - 4, y, false) || isFourWhite(matrix, matrixSize, x, y + 7, y + 11, false))
            ) {
                penalty += N3;
            }
        }
    }

    return penalty;
}

function applyMaskPenaltyRule4(matrix: QRMatrix, matrixSize: number): number {
    let numDarkCells: number = 0;

    for (let y: number = 0; y < matrixSize; y++) {
        for (let x: number = 0; x < matrixSize; x++) {
            if (isFill(matrix, y, x)) {
                numDarkCells++;
            }
        }
    }

    const numTotalCells: number = matrixSize * matrixSize;
    const fivePercentVariances: number = Math.floor(Math.abs(numDarkCells * 20 - numTotalCells * 10) / numTotalCells);

    return fivePercentVariances * N4;
}

/**
 * Calculate Mask Penalty
 *
 * @export
 * @param {QRMatrix} matrix
 * @param {number} matrixSize
 * @returns {number}
 * @see https://www.thonky.com/qr-code-tutorial/data-masking
 * @see https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/Creator/encoder/MaskUtil.java
 */
export function calculateMaskPenalty(matrix: QRMatrix, matrixSize: number): number {
    return (
        applyMaskPenaltyRule1(matrix, matrixSize) +
        applyMaskPenaltyRule2(matrix, matrixSize) +
        applyMaskPenaltyRule3(matrix, matrixSize) +
        applyMaskPenaltyRule4(matrix, matrixSize)
    );
}