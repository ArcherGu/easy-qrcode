import { ErrorCorrectionLevel, QRMode } from "../common/QR";
import { BitBuffer } from "./BitBuffer";
import { BaseData, ByteData } from "./data";
import { RSBlock } from "./RSBlock";

/**
 * For QR data processing, conversion, composition, generation and other operations
 *
 * @export
 * @class DataWizard
 */
export class DataWizard {
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
}