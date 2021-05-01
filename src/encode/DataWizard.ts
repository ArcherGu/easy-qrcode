import { ErrorCorrectionLevel, getErrorCorrectionPolynomial } from "../common/ErrorCorrection";
import { QRMode } from "../common/QR";
import { BitBuffer } from "./BitBuffer";
import { BaseData, ByteData } from "./data";
import { Polynomial } from "../common/Polynomial";
import { RSBlock } from "./RSBlock";

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
     * @memberof DataWizard
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
     * @memberof DataWizard
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
     * @memberof DataWizard
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
     * @memberof DataWizard
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
}