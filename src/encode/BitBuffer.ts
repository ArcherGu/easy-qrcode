/**
 * The buffer for bit
 *
 * @export
 * @class BitBuffer
 */
export class BitBuffer {
    private length: number = 0;
    private buffer: number[] = [];

    public getBuffer(): number[] {
        return this.buffer;
    }

    public getLengthOfBits(): number {
        return this.length;
    }

    public getBit(index: number): boolean {
        return ((this.buffer[(index / 8) >> 0] >>> (7 - (index % 8))) & 1) === 1;
    }

    public add(num: number, length: number): BitBuffer {
        for (let i: number = 0; i < length; i++) {
            this.addBit(((num >>> (length - i - 1)) & 1) === 1);
        }

        return this;
    }

    public addBit(bit: boolean): void {
        if (this.length === this.buffer.length * 8) {
            this.buffer.push(0);
        }

        if (bit) {
            this.buffer[(this.length / 8) >> 0] |= 0x80 >>> this.length % 8;
        }

        this.length++;
    }
}
