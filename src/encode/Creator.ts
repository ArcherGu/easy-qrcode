import { ErrorCorrectionLevel } from "../common/ErrorCorrection";
import { calculateMaskPenalty, MaskPattern } from "../common/Mask";
import { CreatorOptions } from "../common/QR";
import { Nullable } from "../utils/types_tool";
import { BitBuffer } from "./BitBuffer";
import { BaseData, AlphanumericData, ByteData, NumericData, KanjiData } from "./data";
import { DataWizard } from "./DataWizard";
import { QRContent } from "./QRContent";
import { RSBlock } from "./RSBlock";

export class Creator {
    private version: number = 0;
    private enableECI: boolean = false;
    private errorCorrectionLevel: ErrorCorrectionLevel = ErrorCorrectionLevel.M;
    private maskPattern: Nullable<MaskPattern> = null;
    private segments: BaseData[] = [];
    private matrixSize: number = 0;
    private matrix: Nullable<boolean>[][] = [];

    constructor(opts?: CreatorOptions) {
        if (opts !== undefined) {
            if (opts.hasOwnProperty('version')) {
                this.setVersion(opts.version!);
            }
            if (opts.hasOwnProperty('enableECI')) {
                this.setECIStatus(opts.enableECI!);
            }
            if (opts.hasOwnProperty('errorCorrectionLevel')) {
                this.setErrorCorrectionLevel(opts.errorCorrectionLevel!);
            }
            if (opts.hasOwnProperty('maskPattern')) {
                this.setMaskPattern(opts.maskPattern!);
            }
        }
    }

    private get autoVersion() {
        return this.version === 0;
    }

    private get autoMask() {
        return this.maskPattern === null;
    }

    /**
     * Get the QR pixel matrix
     *
     * @returns {boolean[][]}
     * @memberof Creator
     */
    public getMatrix(): Nullable<boolean>[][] {
        return this.matrix;
    }

    /**
     * Get the QR pixel matrix size
     *
     * @returns {number}
     * @memberof Creator
     */
    public getMatrixSize(): number {
        return this.matrixSize;
    }

    /**
     * Get version
     *
     * @returns {number}
     * @memberof Creator
     */
    public getVersion(): number {
        return this.version;
    }

    /**
     * Set version, 1 - 40
     *
     * @param {number} version
     * @returns {Encoder}
     * @memberof Creator
     */
    public setVersion(version: number): Creator {
        this.version = Math.min(40, Math.max(0, version >> 0));

        return this;
    }

    /**
     * Get the error correction level for this creator
     *
     * @returns {ErrorCorrectionLevel}
     * @memberof Creator
     */
    public getErrorCorrectionLevel(): ErrorCorrectionLevel {
        return this.errorCorrectionLevel;
    }

    /**
     * Set the error correction level for this creator
     *
     * @param {ErrorCorrectionLevel} errorCorrectionLevel
     * @returns {Encoder}
     * @memberof Creator
     */
    public setErrorCorrectionLevel(errorCorrectionLevel: ErrorCorrectionLevel): Creator {
        switch (errorCorrectionLevel) {
            case ErrorCorrectionLevel.L:
            case ErrorCorrectionLevel.M:
            case ErrorCorrectionLevel.Q:
            case ErrorCorrectionLevel.H:
                this.errorCorrectionLevel = errorCorrectionLevel;
                return this;
            default:
                throw new Error(`invalid error correction level: ${errorCorrectionLevel}`);
        }
    }

    /**
     * Get mask pattern
     *
     * @returns {Nullable<MaskPattern>}
     * @memberof Creator
     */
    public getMaskPattern(): Nullable<MaskPattern> {
        return this.maskPattern;
    }

    /**
     * Set mask pattern
     *
     * @param {MaskPattern} maskPattern
     * @returns {Creator}
     * @memberof Creator
     */
    public setMaskPattern(maskPattern: MaskPattern): Creator {
        switch (maskPattern) {
            case MaskPattern.PATTERN000:
            case MaskPattern.PATTERN001:
            case MaskPattern.PATTERN010:
            case MaskPattern.PATTERN011:
            case MaskPattern.PATTERN100:
            case MaskPattern.PATTERN101:
            case MaskPattern.PATTERN110:
            case MaskPattern.PATTERN111:
                this.maskPattern = maskPattern;
                return this;
            default:
                throw new Error(`invalid mask pattern: ${maskPattern}`);
        }
    }

    /**
     * Clear mask pattern
     *
     * @returns {Creator}
     * @memberof Creator
     */
    public clearMaskPattern(): Creator {
        this.maskPattern = null;
        return this;
    }

    /**
     * Get ECI status
     *
     * @returns {boolean}
     * @memberof Creator
     */
    public getECIStatus(): boolean {
        return this.enableECI;
    }

    /**
     * Set ECI Status
     *
     * @param {boolean} enableECI
     * @returns {Creator}
     * @memberof Creator
     */
    public setECIStatus(enableECI: boolean): Creator {
        this.enableECI = enableECI;

        return this;
    }

    private createMatrix(data: BitBuffer, maskPattern: number): Nullable<boolean>[][] {
        const matrix: (Nullable<boolean>)[][] = [];

        // fill the matrix by null
        for (let row: number = 0; row < this.matrixSize; row++) {
            matrix[row] = [];

            for (let col: number = 0; col < this.matrixSize; col++) {
                matrix[row][col] = null;
            }
        }

        DataWizard.addFinderPattern(matrix, this.matrixSize);
        DataWizard.addAlignmentPattern(matrix, this.version);
        DataWizard.addTimingPattern(matrix, this.matrixSize);
        DataWizard.addFormatInfo(matrix, this.matrixSize, maskPattern, this.errorCorrectionLevel);
        DataWizard.addVersionInfo(matrix, this.matrixSize, this.version);
        DataWizard.addCodewords(matrix, this.matrixSize, data, maskPattern);

        return matrix;
    }

    /**
     * Whether this coordinate in the matrix is filled with boolean
     *
     * @static
     * @param {Nullable<boolean>[][]} matrix
     * @param {number} row
     * @param {number} col
     * @returns {boolean}
     * @memberof Creator
     */
    public static isFill(matrix: Nullable<boolean>[][], row: number, col: number): boolean {
        if (matrix[row][col] !== null) {
            return !!matrix[row][col];
        } else {
            return false;
        }
    }

    /**
     * Add content to creator
     *
     * @param {(QRContent | string)} content
     * @returns {Creator}
     * @memberof Creator
     */
    public add(content: QRContent | string): Creator {
        let data: BaseData;
        if (content instanceof QRContent) {
            data = content.convertToData();
        }
        else if (toString.call(content) === '[object String]') {
            const TEST_NUMERIC = /^\d+$/;
            const TEST_ALPHANUMERIC = /^[0-9A-Z$%*+-./: ]+$/;
            if (TEST_NUMERIC.test(content)) {
                data = new NumericData(content);
            } else if (TEST_ALPHANUMERIC.test(content)) {
                data = new AlphanumericData(content);
            }

            try {
                data = new KanjiData(content);
            } catch (error) {
                data = new ByteData(content);
            }
        }
        else {
            throw new Error(`invalid content: ${content}`);
        }

        this.segments.push(data);

        return this;
    }

    /**
     * Create QR pixel matrix
     *
     * @returns {Creator}
     * @memberof Creator
     */
    public create(): Creator {
        let buffer: BitBuffer;
        let rsBlocks: RSBlock[];
        let maxDataCount: number;

        if (this.autoVersion) {
            // Look for version with the smallest size
            for (this.version = 1; this.version <= 40; this.version++) {
                [buffer, rsBlocks, maxDataCount] = DataWizard.preprocessing(this.version, this.errorCorrectionLevel, this.enableECI, this.segments);

                if (buffer.getLengthOfBits() <= maxDataCount) {
                    break;
                };
            }
        } else {
            // Use the specified version
            [buffer, rsBlocks, maxDataCount] = DataWizard.preprocessing(this.version, this.errorCorrectionLevel, this.enableECI, this.segments);
        }

        if (buffer!.getLengthOfBits() > maxDataCount!) {
            throw new Error(`Too big content that current version(${this.version}) cannot fit`);
        }

        // QR pixel matrix size = (version - 1) * 4 + 21
        this.matrixSize = this.version * 4 + 17;
        const rawData: BitBuffer = DataWizard.processing(buffer!, rsBlocks!, maxDataCount!);

        if (this.autoMask) {
            let bestMatrix: Nullable<boolean>[][];
            let minPenalty: number = Number.MAX_VALUE;

            for (let maskPattern: number = 0; maskPattern < 8; maskPattern++) {
                const matrix = this.createMatrix(rawData, maskPattern);

                const penalty: number = calculateMaskPenalty(matrix, this.matrixSize);

                if (penalty < minPenalty) {
                    minPenalty = penalty;
                    bestMatrix = matrix;
                }
            }

            this.matrix = bestMatrix!;
        }
        else {
            this.matrix = this.createMatrix(rawData, this.maskPattern!);
        }

        return this;
    }
}