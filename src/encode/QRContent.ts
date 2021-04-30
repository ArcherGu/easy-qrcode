import { QRMode } from "../common/QR";
import { AlphanumericData, BaseData, ByteData, KanjiData, NumericData } from "./data";

export class QRContent {
    constructor(
        public data: string,
        public mode: QRMode
    ) { }

    /**
     * Convert content to QR data
     *
     * @returns {BaseData}
     * @memberof QRContent
     */
    public convertToData(): BaseData {
        try {
            switch (this.mode) {
                case QRMode.Numeric:
                    return new NumericData(this.data);
                case QRMode.Alphanumeric:
                    return new AlphanumericData(this.data);
                case QRMode.Byte:
                    return new ByteData(this.data);
                case QRMode.Kanji:
                    return new KanjiData(this.data);
                default:
                    throw new Error(`invalid mode: ${this.mode}`);
            }
        } catch (error) {
            throw new Error(`mode(${this.mode}) and data(${this.data}) not match`);
        }
    }
}