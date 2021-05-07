import { ErrorCorrectionLevel } from "../common/ErrorCorrection";
import { calculateMaskPenalty, MaskPattern } from "../common/Mask";
import { CreatorOptions, QRMatrix } from "../common/QR";
import { Nullable } from "../utils/types_tool";
import { BitBuffer } from "./BitBuffer";
import { BaseData, AlphanumericData, ByteData, NumericData, KanjiData } from "./data";
import { DataWizard } from "./DataWizard";
import { QRContent, QRContentObj } from "./QRContent";
import { RSBlock } from "./RSBlock";

/**
 * The creator can be used to generate the QR code boolean matrix.
 *
 * @export
 * @class Creator
 */
export class Creator {
    private version: number = 0;
    private enableECI: boolean = false;
    private errorCorrectionLevel: ErrorCorrectionLevel = ErrorCorrectionLevel.M;
    private maskPattern: Nullable<MaskPattern> = null;
    private segments: BaseData[] = [];
    private matrixSize: number = 0;
    private matrix: QRMatrix = [];

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
     * Get the QR boolean matrix.
     *
     * @returns {QRMatrix}
     */
    public getMatrix(): QRMatrix {
        return this.matrix;
    }

    /**
     * Get the QR boolean matrix size.
     *
     * @returns {number}
     */
    public getMatrixSize(): number {
        return this.matrixSize;
    }

    /**
     * Get version.
     *
     * @returns {number}
     */
    public getVersion(): number {
        return this.version;
    }

    /**
     * Set version, 1 - 40.
     *
     * @param {number} version
     * @returns {Encoder}
     */
    public setVersion(version: number): Creator {
        this.version = Math.min(40, Math.max(0, version >> 0));

        return this;
    }

    /**
     * Get the error correction level for this creator.
     *
     * @returns {ErrorCorrectionLevel}
     */
    public getErrorCorrectionLevel(): ErrorCorrectionLevel {
        return this.errorCorrectionLevel;
    }

    /**
     * Set the error correction level for this creator.
     *
     * @param {ErrorCorrectionLevel} errorCorrectionLevel
     * @returns {Encoder}
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
     * Get mask pattern.
     *
     * @returns {Nullable<MaskPattern>}
     */
    public getMaskPattern(): Nullable<MaskPattern> {
        return this.maskPattern;
    }

    /**
     * Set mask pattern.
     *
     * @param {MaskPattern} maskPattern
     * @returns {Creator}
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
     * Clear mask pattern.
     *
     * @returns {Creator}
     */
    public clearMaskPattern(): Creator {
        this.maskPattern = null;
        return this;
    }

    /**
     * Get ECI status.
     *
     * @returns {boolean}
     */
    public getECIStatus(): boolean {
        return this.enableECI;
    }

    /**
     * Set ECI Status.
     *
     * @param {boolean} enableECI
     * @returns {Creator}
     */
    public setECIStatus(enableECI: boolean): Creator {
        this.enableECI = enableECI;

        return this;
    }

    private createMatrix(data: BitBuffer, maskPattern: number): QRMatrix {
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
     * Clear the data.
     *
     * @returns {Creator}
     */
    public clear(): Creator {
        this.segments.length = 0;
        return this;
    }

    /**
     * Add content to creator.
     *
     * @param {(QRContent | string)} content
     * @returns {Creator}
     */
    public add(qrContent: QRContent | QRContentObj | string): Creator {
        let data: BaseData;
        if (qrContent instanceof QRContent) {
            data = qrContent.getQRData();
        }
        else if (toString.call(qrContent) === '[object String]') {
            qrContent = qrContent as string;
            const TEST_NUMERIC = /^\d+$/;
            const TEST_ALPHANUMERIC = /^[0-9A-Z$%*+-./: ]+$/;
            if (TEST_NUMERIC.test(qrContent)) {
                data = new NumericData(qrContent);
            } else if (TEST_ALPHANUMERIC.test(qrContent)) {
                data = new AlphanumericData(qrContent);
            }
            else {
                try {
                    data = new KanjiData(qrContent);
                } catch (error) {
                    data = new ByteData(qrContent);
                }
            }
        }
        else if (qrContent.hasOwnProperty('data') && qrContent.hasOwnProperty('mode')) {
            qrContent = qrContent as QRContentObj;
            data = (new QRContent(qrContent.content, qrContent.mode)).getQRData();
        }
        else {
            throw new Error(`invalid content: ${qrContent}`);
        }

        this.segments.push(data);

        return this;
    }

    /**
     * Create QR boolean matrix.
     *
     * @returns {Creator}
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

        // QR boolean matrix size = (version - 1) * 4 + 21
        this.matrixSize = this.version * 4 + 17;
        const rawData: BitBuffer = DataWizard.processing(buffer!, rsBlocks!, maxDataCount!);

        if (this.autoMask) {
            let bestMatrix: QRMatrix;
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