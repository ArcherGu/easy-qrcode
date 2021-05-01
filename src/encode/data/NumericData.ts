import { toUTF16 } from "../../utils/converter";
import { QRMode } from "../../common/QR";
import { BitBuffer } from "../BitBuffer";
import { BaseData } from "./BaseData";

export class NumericData extends BaseData {
    constructor(data: string) {
        super(QRMode.Numeric, data);

        this.bytes = toUTF16(data);
    }

    public write(buffer: BitBuffer): void {
        let i: number = 0;
        const bytes: number[] = this.bytes;
        const length: number = bytes.length;

        // Each of three numbers as a group
        while (i + 2 < length) {

            buffer.add(this.getBytes([bytes[i], bytes[i + 1], bytes[i + 2]]), 10);

            i += 3;
        }

        // remainder
        if (i < length) {
            if (length - i === 1) {
                buffer.add(this.getBytes([bytes[i]]), 4);
            } else if (length - i === 2) {
                buffer.add(this.getBytes([bytes[i], bytes[i + 1]]), 7);
            }
        }
    }

    private getByte(byte: number): number {
        // 0 - 9
        if (0x30 <= byte && byte <= 0x39) {
            return byte - 0x30;
        }

        throw new Error(`invalid char: ${String.fromCharCode(byte)}`);
    }

    private getBytes(bytes: number[]): number {
        let num: number = 0;
        const length: number = bytes.length;

        for (let i: number = 0; i < length; i++) {
            num = num * 10 + this.getByte(bytes[i]);
        }

        return num;
    }
}
