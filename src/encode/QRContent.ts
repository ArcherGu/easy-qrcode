import { QRMode } from "../common/QR";
import { BaseData, AlphanumericData, ByteData, KanjiData, NumericData } from "./data";

/**
 * Set the content object and add it to the creator.
 *
 * @export
 * @interface QRContentObj
 */
export interface QRContentObj {
    content: string,
    mode: QRMode;
}

/**
 * Create an instance of the content and add it to the creator.
 * 
 * @export
 * @class QRContent
 */
export class QRContent {
    private data: BaseData;
    constructor(
        private content: string,
        private mode: QRMode
    ) {
        try {
            switch (this.mode) {
                case QRMode.Numeric:
                    this.data = new NumericData(this.content);
                case QRMode.Alphanumeric:
                    this.data = new AlphanumericData(this.content);
                case QRMode.Byte:
                    this.data = new ByteData(this.content);
                case QRMode.Kanji:
                    this.data = new KanjiData(this.content);
                default:
                    throw new Error(`invalid mode: ${this.mode}`);
            }
        } catch (error) {
            throw new Error(`mode(${this.mode}) and content(${this.content}) not match`);
        }
    }

    /**
     * Get the QR data for this content's QR mode.
     *
     * @returns {BaseData}
     */
    public getQRData(): BaseData {
        return this.data;
    }
}