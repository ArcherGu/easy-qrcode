import * as GF from '../utils/galois_field';

export class Polynomial {
    private num: number[];

    public constructor(num: number[], shift: number = 0) {
        this.num = [];

        let offset: number = 0;
        let length: number = num.length;

        while (offset < length && num[offset] === 0) {
            offset++;
        }

        length -= offset;

        for (let i: number = 0; i < length; i++) {
            this.num.push(num[offset + i]);
        }

        for (let i: number = 0; i < shift; i++) {
            this.num.push(0);
        }
    }

    public getAt(index: number): number {
        return this.num[index];
    }

    public getLength(): number {
        return this.num.length;
    }

    public static mul(p1: Polynomial, p2: Polynomial): Polynomial {
        const num: number[] = [];
        const p1Length = p1.getLength();
        const p2Length = p2.getLength();

        for (let i: number = 0; i < (p1Length + p2Length - 1); i++) {
            num.push(0);
        }

        for (let i = 0; i < p1Length; i++) {
            for (let j = 0; j < p2Length; j++) {
                num[i + j] ^= GF.mul(p1.getAt(i), p2.getAt(j));
            }
        }

        return new Polynomial(num);
    }

    public static mod(dividend: Polynomial, divisor: Polynomial): Polynomial {
        const dividendLength = dividend.getLength();
        const divisorLength = divisor.getLength();

        if (dividendLength - divisorLength < 0) {
            return dividend;
        }

        const ratio: number = GF.log(dividend.getAt(0)) - GF.log(divisor.getAt(0));
        const num: number[] = [];

        for (let i: number = 0; i < dividendLength; i++) {
            num.push(dividend.getAt(i));
        }

        for (let i: number = 0; i < divisorLength; i++) {
            num[i] ^= GF.exp(GF.log(divisor.getAt(i)) + ratio);
        }

        return Polynomial.mod(new Polynomial(num), divisor);
    }
}
