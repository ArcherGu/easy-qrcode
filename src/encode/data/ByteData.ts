import { ECIIndicator, QRMode } from "../../common/QR";
import { toUTF8 } from "../../utils/converter";
import { BitBuffer } from "../BitBuffer";
import { BaseData } from "./BaseData";

type EncodeFunction = (data: string) => {
    bytes: number[];
    indicator: number;
};

export class ByteData extends BaseData {
    /**
     * ECI Indicator, Default ECI indicator is UTF8(000026)
     *
     * @private
     * @type {number}
     */
    private indicator: number = ECIIndicator.UTF8;

    constructor(data: string, encoder?: EncodeFunction) {
        super(QRMode.Byte, data);

        if (encoder && typeof encoder === 'function') {
            const { bytes, indicator } = encoder(data);

            this.bytes = bytes;
            this.indicator = indicator;
        } else {
            this.bytes = toUTF8(data);
        }
    }

    public getECIIndicator(): number {
        return this.indicator;
    }

    public write(buffer: BitBuffer): void {
        for (const byte of this.bytes) {
            buffer.add(byte, 8);
        }
    }
}
