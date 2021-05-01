import { toUTF16 } from "../../utils/converter";
import { QRMode } from "../../common/QR";
import { BitBuffer } from "../BitBuffer";
import { BaseData } from "./BaseData";

export class AlphanumericData extends BaseData {
    constructor(data: string) {
        super(QRMode.Alphanumeric, data);

        this.bytes = toUTF16(data);
    }

    public write(buffer: BitBuffer): void {
        let i: number = 0;
        const bytes: number[] = this.bytes;
        const length: number = bytes.length;

        while (i + 1 < length) {
            buffer.add(this.getByte(bytes[i]) * 45 + this.getByte(bytes[i + 1]), 11);

            i += 2;
        }

        if (i < length) {
            buffer.add(this.getByte(bytes[i]), 6);
        }
    }

    private getByte(byte: number): number {
        if (0x30 <= byte && byte <= 0x39) {
            // 0 - 9
            return byte - 0x30;
        } else if (0x41 <= byte && byte <= 0x5a) {
            // A - Z
            return byte - 0x41 + 10;
        } else {
            switch (byte) {
                // space
                case 0x20:
                    return 36;
                // $
                case 0x24:
                    return 37;
                // %
                case 0x25:
                    return 38;
                // *
                case 0x2a:
                    return 39;
                // +
                case 0x2b:
                    return 40;
                // -
                case 0x2d:
                    return 41;
                // .
                case 0x2e:
                    return 42;
                // /
                case 0x2f:
                    return 43;
                // :
                case 0x3a:
                    return 44;
                default:
                    throw new Error(`invalid char: ${String.fromCharCode(byte)}`);
            }
        }
    }
}
