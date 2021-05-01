import { QRMode } from "../../common/QR";
import { BitBuffer } from "../BitBuffer";
import { BaseData } from "./BaseData";

export class KanjiData extends BaseData {
    constructor(data: string) {
        super(QRMode.Numeric, data);

        this.bytes = [];
    }

    /**
     * @override
     * @returns {number}
     * @memberof KanjiData
     */
    public getLength(): number {
        return Math.floor(this.bytes.length / 2);
    }

    public write(buffer: BitBuffer): void {
        let index: number = 0;
        const bytes: number[] = this.bytes;
        const length: number = bytes.length;

        while (index + 1 < length) {
            // Reassemble high 8 and low 8 bits
            let code: number = ((0xff & bytes[index]) << 8) | (0xff & bytes[index + 1]);

            if (0x8140 <= code && code <= 0x9ffc) { // 0x8140 ~ 0x9ffc subtract 0x8140
                code -= 0x8140;
            } else if (0xe040 <= code && code <= 0xebbf) { // 0xe040 ~ 0xebbf subtract 0xc140
                code -= 0xc140;
            }

            // Gets the high 8 bits and multiplies the 0xc0, and then adds the lower 8 bits
            code = ((code >> 8) & 0xff) * 0xc0 + (code & 0xff);

            buffer.add(code, 13);

            index += 2;
        }
    }
}
