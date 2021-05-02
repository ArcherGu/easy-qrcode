import { Polynomial } from "./Polynomial";
import * as GF from '../utils/galois_field';

/**
 * Error Correction Level
 *
 * @export
 * @enum {number}
 */
export enum ErrorCorrectionLevel {
    // 7%
    L = 1,
    // 15%
    M = 0,
    // 25%
    Q = 3,
    // 30%
    H = 2
}

export function getErrorCorrectionPolynomial(errorCorrectionLength: number): Polynomial {
    let e: Polynomial = new Polynomial([1]);

    for (let i: number = 0; i < errorCorrectionLength; i++) {
        e = Polynomial.mul(e, new Polynomial([1, GF.exp(i)]));
    }

    return e;
}