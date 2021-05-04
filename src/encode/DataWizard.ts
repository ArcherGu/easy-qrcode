import { ErrorCorrectionLevel, getErrorCorrectionPolynomial } from "../common/ErrorCorrection";
import { QRMatrix, QRMode } from "../common/QR";
import { BitBuffer } from "./BitBuffer";
import { BaseData, ByteData } from "./data";
import { Polynomial } from "../common/Polynomial";
import { RSBlock } from "./RSBlock";
import { getAlignmentPattern } from "../common/Alignment";
import { getBCHVersion, getBCHVersionInfo } from "../common/BCH";
import { getMaskFunc, MaskFunc } from "../common/Mask";
import { Nullable } from "../utils/types_tool";

/**
 * For QR data processing, conversion, composition, generation and other operations
 *
 * @export
 * @class DataWizard
 */
export class DataWizard {
    public static PAD0: number = 0xec;
    public static PAD1: number = 0x11;

    /**
     * Data pre-processing
     *
     * @static
     * @param {number} version
     * @param {ErrorCorrectionLevel} errorCorrectionLevel
     * @param {boolean} enableECI
     * @param {BaseData[]} segments
     * @returns {[BitBuffer, RSBlock[], number]}
     */
    public static preprocessing(
        version: number,
        errorCorrectionLevel: ErrorCorrectionLevel,
        enableECI: boolean,
        segments: BaseData[]): [BitBuffer, RSBlock[], number] {
        const buffer: BitBuffer = new BitBuffer();
        const rsBlocks: RSBlock[] = RSBlock.getRSBlocks(version, errorCorrectionLevel);

        for (const data of segments) {
            const mode: QRMode = data.getMode();
            if (enableECI && mode === QRMode.Byte) {
                DataWizard.handleECI((data as ByteData).getECIIndicator(), buffer);
            }
            buffer.add(mode, 4).add(data.getLength(), data.getCharCountIndexBitLength(version));

            data.write(buffer);
        }

        // calculate max data count
        let maxDataCount: number = 0;
        for (const rsBlock of rsBlocks) {
            maxDataCount += rsBlock.getDataCount();
        }

        maxDataCount *= 8;

        return [buffer, rsBlocks, maxDataCount];
    }

    /**
     * process ECI by indicator
     *
     * @static
     * @param {number} indicator
     * @param {BitBuffer} buffer
     */
    public static handleECI(indicator: number, buffer: BitBuffer) {
        // Range: 000000 - 999999
        if (indicator < 0 || indicator >= 1000000) {
            throw new Error('ECI indicator out of range');
        }

        buffer.add(QRMode.ECI, 4);

        if (indicator < 1 << 7) { // 000000 - 000127
            buffer.add(indicator, 8);
        } else if (indicator < 1 << 14) { // 000128 - 016383
            buffer.add(2, 2);
            buffer.add(indicator, 14);
        } else { // 016384 - 999999
            buffer.add(6, 3);
            buffer.add(indicator, 21);
        }
    }

    /**
     * Data processing
     *
     * @static
     * @param {BitBuffer} buffer
     * @param {RSBlock[]} rsBlocks
     * @param {number} maxDataCount
     * @returns {BitBuffer}
     */
    public static processing(buffer: BitBuffer, rsBlocks: RSBlock[], maxDataCount: number): BitBuffer {
        // terminator
        if (buffer.getLengthOfBits() + 4 <= maxDataCount) {
            buffer.add(0, 4);
        }

        // 8-bit alignment
        while (buffer.getLengthOfBits() % 8 !== 0) {
            buffer.addBit(false);
        }

        // Add PAD0(11101100) or PAD1(00010001) alternately
        while (true) {
            if (buffer.getLengthOfBits() >= maxDataCount) {
                break;
            }

            buffer.add(DataWizard.PAD0, 8);

            if (buffer.getLengthOfBits() >= maxDataCount) {
                break;
            }

            buffer.add(DataWizard.PAD1, 8);
        }

        return DataWizard.addErrorCorrection(buffer, rsBlocks);
    }

    /**
     * Add error correction code to data and
     *
     * @static
     * @param {BitBuffer} buffer
     * @param {RSBlock[]} rsBlocks
     * @returns {BitBuffer}
     */
    public static addErrorCorrection(buffer: BitBuffer, rsBlocks: RSBlock[]): BitBuffer {
        let offset: number = 0;
        let maxDataCodeCount: number = 0;
        let maxErrorCodeCount: number = 0;
        const dataCodeList: number[][] = [];
        const errorCodeList: number[][] = [];
        const bufferData: number[] = buffer.getBuffer();

        for (let r: number = 0; r < rsBlocks.length; r++) {
            const rsBlock: RSBlock = rsBlocks[r];
            const dataCodeCount: number = rsBlock.getDataCount();
            const errorCodeCount: number = rsBlock.getErrorCorrectionCount();

            maxDataCodeCount = Math.max(maxDataCodeCount, dataCodeCount);
            maxErrorCodeCount = Math.max(maxErrorCodeCount, errorCodeCount);

            dataCodeList[r] = [];

            // add buffer data to rs block by this block's data code count;
            for (let i: number = 0; i < dataCodeCount; i++) {
                dataCodeList[r][i] = 0xff & bufferData[i + offset];
            }

            offset += dataCodeCount;

            //#region Error Correction Polynomial
            const rsPoly: Polynomial = getErrorCorrectionPolynomial(errorCodeCount);
            const ecLength: number = rsPoly.length() - 1;
            const rawPoly: Polynomial = new Polynomial(dataCodeList[r], ecLength);
            const modPoly: Polynomial = Polynomial.mod(rawPoly, rsPoly);
            const mpLength: number = modPoly.length();

            errorCodeList[r] = [];

            for (let i: number = 0; i < ecLength; i++) {
                const modIndex: number = i + mpLength - ecLength;

                errorCodeList[r][i] = modIndex >= 0 ? modPoly.at(modIndex) : 0;
            }
            //#endregion
        }

        buffer = new BitBuffer();

        for (let i: number = 0; i < maxDataCodeCount; i++) {
            for (let r: number = 0; r < rsBlocks.length; r++) {
                if (i < dataCodeList[r].length) {
                    buffer.add(dataCodeList[r][i], 8);
                }
            }
        }

        for (let i: number = 0; i < maxErrorCodeCount; i++) {
            for (let r: number = 0; r < rsBlocks.length; r++) {
                if (i < errorCodeList[r].length) {
                    buffer.add(errorCodeList[r][i], 8);
                }
            }
        }

        return buffer;
    }

    /**
     * Add finder pattern to matrix
     *
     * @static
     * @param {QRMatrix} matrix
     * @param {number} matrixSize
     */
    public static addFinderPattern(matrix: QRMatrix, matrixSize: number): void {
        const finderPattern = (row: number, col: number) => {
            for (let r: number = -1; r <= 7; r++) {
                for (let c: number = -1; c <= 7; c++) {
                    if (row + r <= -1 || matrixSize <= row + r || col + c <= -1 || matrixSize <= col + c) {
                        continue;
                    }

                    if (
                        (0 <= r && r <= 6 && (c === 0 || c === 6)) ||
                        (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
                        (2 <= r && r <= 4 && 2 <= c && c <= 4)
                    ) {
                        matrix[row + r][col + c] = true;
                    } else {
                        matrix[row + r][col + c] = false;
                    }
                }
            }
        };

        finderPattern(0, 0);
        finderPattern(matrixSize - 7, 0);
        finderPattern(0, matrixSize - 7);
    }

    /**
     * Add alignment pattern to matrix
     *
     * @static
     * @param {QRMatrix} matrix
     * @param {number} version
     */
    public static addAlignmentPattern(matrix: QRMatrix, version: number): void {
        const pos: number[] = getAlignmentPattern(version);
        const length: number = pos.length;

        for (let i: number = 0; i < length; i++) {
            for (let j: number = 0; j < length; j++) {
                const row: number = pos[i];
                const col: number = pos[j];

                if (matrix[row][col] !== null) {
                    continue;
                }

                for (let r: number = -2; r <= 2; r++) {
                    for (let c: number = -2; c <= 2; c++) {
                        if (r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0)) {
                            matrix[row + r][col + c] = true;
                        } else {
                            matrix[row + r][col + c] = false;
                        }
                    }
                }
            }
        }
    }

    /**
     * Add timing pattern to matrix
     *
     * @static
     * @param {QRMatrix} matrix
     * @param {number} matrixSize
     */
    public static addTimingPattern(matrix: QRMatrix, matrixSize: number): void {
        for (let i: number = 8; i < (matrixSize - 8); i++) {
            const bit: boolean = i % 2 === 0;

            // vertical timing pattern
            if (matrix[i][6] === null) {
                matrix[i][6] = bit;
            }

            // horizontal timing pattern
            if (matrix[6][i] === null) {
                matrix[6][i] = bit;
            }
        }
    }

    /**
     * Add format info to matrix
     *
     * @static
     * @param {QRMatrix} matrix
     * @param {number} matrixSize
     * @param {number} maskPattern
     * @param {ErrorCorrectionLevel} errorCorrectionLevel
     */
    public static addFormatInfo(matrix: QRMatrix, matrixSize: number, maskPattern: number, errorCorrectionLevel: ErrorCorrectionLevel): void {
        const data: number = (errorCorrectionLevel << 3) | maskPattern;
        const bits: number = getBCHVersionInfo(data);

        for (let i: number = 0; i < 15; i++) {
            const bit: boolean = ((bits >> i) & 1) === 1;

            // Vertical
            if (i < 6) {
                matrix[i][8] = bit;
            } else if (i < 8) {
                matrix[i + 1][8] = bit;
            } else {
                matrix[matrixSize - 15 + i][8] = bit;
            }

            // Horizontal
            if (i < 8) {
                matrix[8][matrixSize - i - 1] = bit;
            } else if (i < 9) {
                matrix[8][15 - i - 1 + 1] = bit;
            } else {
                matrix[8][15 - i - 1] = bit;
            }
        }

        // Fixed point
        matrix[matrixSize - 8][8] = true;
    }

    /**
     * Add version info to matrix
     *
     * @static
     * @param {QRMatrix} matrix
     * @param {number} matrixSize
     * @param {number} version
     */
    public static addVersionInfo(matrix: QRMatrix, matrixSize: number, version: number): void {
        if (version >= 7) {
            const bits: number = getBCHVersion(version);

            for (let i: number = 0; i < 18; i++) {
                const bit: boolean = ((bits >> i) & 1) === 1;

                matrix[(i / 3) >> 0][(i % 3) + matrixSize - 8 - 3] = bit;
                matrix[(i % 3) + matrixSize - 8 - 3][(i / 3) >> 0] = bit;
            }
        }
    }

    /**
     * Add codewords to matrix
     *
     * @static
     * @param {QRMatrix} matrix
     * @param {number} matrixSize
     * @param {BitBuffer} data
     * @param {number} maskPattern
     */
    public static addCodewords(matrix: QRMatrix, matrixSize: number, data: BitBuffer, maskPattern: number): void {
        const bitLength: number = data.getLengthOfBits();

        // Bit index into the data
        let bitIndex: number = 0;

        // Do the funny zigzag scan
        for (let right: number = matrixSize - 1; right >= 1; right -= 2) {
            // Index of right column in each column pair
            if (right === 6) {
                right = 5;
            }

            for (let vert: number = 0; vert < matrixSize; vert++) {
                // Vertical counter
                for (let j: number = 0; j < 2; j++) {
                    // Actual x coordinate
                    const x: number = right - j;
                    const upward: boolean = ((right + 1) & 2) === 0;
                    // Actual y coordinate
                    const y: number = upward ? matrixSize - 1 - vert : vert;

                    if (matrix[y][x] !== null) {
                        continue;
                    }

                    let bit: boolean = false;

                    if (bitIndex < bitLength) {
                        bit = data.getBit(bitIndex++);
                    }

                    const maskFunc: MaskFunc = getMaskFunc(maskPattern);
                    const invert: boolean = maskFunc(x, y);

                    if (invert) {
                        bit = !bit;
                    }

                    matrix[y][x] = bit;
                }
            }
        }
    }
}