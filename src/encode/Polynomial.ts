import * as GF from '../utils/galois_field';

/**
 * Used to store polynomial data and provide some general functions
 *
 * @export
 * @class Polynomial
 */
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

    public at(index: number): number {
        return this.num[index];
    }

    public length(): number {
        return this.num.length;
    }

    public static mul(p1: Polynomial, p2: Polynomial): Polynomial {
        const num: number[] = [];
        const p1Length = p1.length();
        const p2Length = p2.length();

        for (let i: number = 0; i < (p1Length + p2Length - 1); i++) {
            num.push(0);
        }

        for (let i = 0; i < p1Length; i++) {
            for (let j = 0; j < p2Length; j++) {
                num[i + j] ^= GF.mul(p1.at(i), p2.at(j));
            }
        }

        return new Polynomial(num);
    }

    public static mod(dividend: Polynomial, divisor: Polynomial): Polynomial {
        const dividendLength = dividend.length();
        const divisorLength = divisor.length();

        if (dividendLength - divisorLength < 0) {
            return dividend;
        }

        const ratio: number = GF.log(dividend.at(0)) - GF.log(divisor.at(0));
        const num: number[] = [];

        for (let i: number = 0; i < dividendLength; i++) {
            num.push(dividend.at(i));
        }

        for (let i: number = 0; i < divisorLength; i++) {
            num[i] ^= GF.exp(GF.log(divisor.at(i)) + ratio);
        }

        return Polynomial.mod(new Polynomial(num), divisor);
    }
}
