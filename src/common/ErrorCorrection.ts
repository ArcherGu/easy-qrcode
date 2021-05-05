import { Polynomial } from "./Polynomial";
import * as GF from '../utils/galois_field';

/**
 * Error Correction Level
 *
 * QR codes use [Reed–Solomon error correction](https://en.wikipedia.org/wiki/Reed%E2%80%93Solomon_error_correction) over the [finite field](https://en.wikipedia.org/wiki/Finite_field).
 * @see https://en.wikipedia.org/wiki/QR_code#Error_correction
 * @export
 * @enum {number}
 */
export enum ErrorCorrectionLevel {
    /**
     * Level L (Low), approx 7%
     */
    L = 1,
    /**
     * Level M (Medium), approx 15%
     */
    M = 0,
    /**
     * Level Q (Quartile), approx 25%
     */
    Q = 3,
    /**
     * Level H (High), approx 30%
     */
    H = 2
}

export function getErrorCorrectionPolynomial(errorCorrectionLength: number): Polynomial {
    let e: Polynomial = new Polynomial([1]);

    for (let i: number = 0; i < errorCorrectionLength; i++) {
        e = Polynomial.mul(e, new Polynomial([1, GF.exp(i)]));
    }

    return e;
}