
import { QRMode } from "src/common/QR";
import { BitBuffer } from "../BitBuffer";

export abstract class BaseData {
    protected mode: QRMode;
    protected data: string;
    protected bytes!: number[];

    constructor(mode: QRMode, data: string) {
        this.mode = mode;
        this.data = data;
    }

    public getMode(): QRMode {
        return this.mode;
    }

    public abstract getLength(): number;

    public abstract write(buffer: BitBuffer): void;

    /**
     * Number of bits in character count indicator
     *
     * @param {number} version
     * @returns {number}
     * @memberof BaseMode
     */
    public getCharCountIndexBitLength(version: number): number {
        const mode: QRMode = this.mode;
        const error: Error = new Error(`invalid QR mode: ${mode}`);

        if (1 <= version && version < 10) {
            // 1 - 9
            switch (mode) {
                case QRMode.Numeric:
                    return 10;
                case QRMode.Alphanumeric:
                    return 9;
                case QRMode.Byte:
                    return 8;
                case QRMode.Kanji:
                    return 8;
                default:
                    throw error;
            }
        } else if (version < 27) {
            // 10 - 26
            switch (mode) {
                case QRMode.Numeric:
                    return 12;
                case QRMode.Alphanumeric:
                    return 11;
                case QRMode.Byte:
                    return 16;
                case QRMode.Kanji:
                    return 10;
                default:
                    throw error;
            }
        } else if (version < 41) {
            // 27 - 40
            switch (mode) {
                case QRMode.Numeric:
                    return 14;
                case QRMode.Alphanumeric:
                    return 13;
                case QRMode.Byte:
                    return 16;
                case QRMode.Kanji:
                    return 12;
                default:
                    throw error;
            }
        } else {
            throw new Error(`invalid version: ${version}`);
        }
    }
}
