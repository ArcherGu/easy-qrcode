import { QRMode } from "src/common/QR";
import { BitBuffer } from "../BitBuffer";
import { BaseData } from "./BaseData";

export class NumericData extends BaseData {
    constructor(data: string) {
        super(QRMode.Numeric, data);

        this.bytes = [];
    }

    public getLength(): number {
        throw new Error("Method not implemented.");
    }
    public write(buffer: BitBuffer): void {
        throw new Error("Method not implemented.");
    }
}
