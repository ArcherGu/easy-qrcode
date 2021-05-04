import { Nullable } from "../utils/types_tool";
import { ErrorCorrectionLevel } from "./ErrorCorrection";
import { MaskPattern } from "./Mask";

/**
 * ECI Indicator
 * AIM ECI(Extended Channel Interpretation)
 *
 * @export
 * @enum {number}
 */
export const enum ECIIndicator {
    SJIS = 20,
    UTF8 = 26
}

/**
 * QR Mode
 * @readonly
 * @export
 * @enum {number}
 */
export enum QRMode {
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

export type QRMatrix = Nullable<boolean>[][];
