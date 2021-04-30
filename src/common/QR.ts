import { MaskPattern } from "./Mask";

/**
 * Encoding Hint
 *
 * @export
 * @enum {number}
 */
export const enum EncodingHint {
    SJIS = 20,
    UTF8 = 26
}

/**
 * Error Correction Level
 *
 * @export
 * @enum {number}
 */
export const enum ErrorCorrectionLevel {
    // 7%
    L = 1,
    // 15%
    M = 0,
    // 25%
    Q = 3,
    // 30%
    H = 2
}

/**
 * QR Mode
 * @readonly
 * @export
 * @enum {number}
 */
export const enum QRMode {
    ECI = 0b0111,
    Numeric = 0b0001,
    Alphanumeric = 0b0010,
    Byte = 0b0100,
    Kanji = 0b1000,
    StructuredAppend = 0b0011,
    FNC1FirstPosition = 0b0101,
    FNC1SecondPosition = 0b1001,
    Terminator = 0b0000,
}

/**
 * QR Creator Options
 */
export interface CreatorOptions {
    version?: number;
    enableECI?: boolean;
    errorCorrectionLevel?: ErrorCorrectionLevel;
    maskPattern?: MaskPattern;
}