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
 * QR Mode (datatype)
 * 
 * The amount of data that can be stored in the QR code symbol depends on the datatype (mode, or input character set).
 * 
 * @see https://en.wikipedia.org/wiki/QR_code#Storage
 * @readonly
 * @export
 * @enum {number}
 */
export enum QRMode {
    /**
     * Numeric only: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9
     */
    Numeric = 0b0001,
    /**
     * 0–9, A–Z (upper-case only), space, $, %, *, +, -, ., /, :
     * 
     * @see https://en.wikipedia.org/wiki/Alphanumeric
     */
    Alphanumeric = 0b0010,
    /**
     * Binary/byte
     * 
     * @see https://en.wikipedia.org/wiki/Binary_number
     * @see https://en.wikipedia.org/wiki/ISO/IEC_8859-1
     */
    Byte = 0b0100,
    /**
     * Kanji
     * 
     * @see https://en.wikipedia.org/wiki/Kanji
     * @see https://en.wikipedia.org/wiki/Shift_JIS
     */
    Kanji = 0b1000,
    /**
     * ECI: AIM ECI(Extended Channel Interpretation).
     *
     * This mode does not need to be used, just enable ECI in {@link CreatorOptions}.
     * @see https://en.wikipedia.org/wiki/Extended_Channel_Interpretation
     */
    ECI = 0b0111,
    // StructuredAppend = 0b0011,
    // FNC1FirstPosition = 0b0101,
    // FNC1SecondPosition = 0b1001,
    // Terminator = 0b0000,
}

/**
 * QR Creator Options.
 *
 * @export
 * @interface CreatorOptions
 */
export interface CreatorOptions {
    /**
     * the version for QR code.
     * 
     * If not specified, the creator selects the most appropriate version based on the size of the content.
     * 
     * @see https://www.qrcode.com/en/about/version.html
     * @type {number}
     */
    version?: number;
    /**
     * whether to enable ECI.
     * 
     * ECI: AIM ECI(Extended Channel Interpretation).
     * 
     * @see https://en.wikipedia.org/wiki/Extended_Channel_Interpretation
     * @type {boolean}
     */
    enableECI?: boolean;
    /**
     * error correction level
     * 
     * If not specified, default error correction level is Level M (Medium, approx 15%).
     * 
     * @see https://en.wikipedia.org/wiki/QR_code#Error_correction
     * @type {ErrorCorrectionLevel}
     */
    errorCorrectionLevel?: ErrorCorrectionLevel;
    /**
     * Mask Pattern
     * 
     * If not specified, the creator will select the mask pattern with the lowest penalty.
     * 
     * @see https://en.wikipedia.org/wiki/QR_code#Encoding
     * @type {MaskPattern}
     */
    maskPattern?: MaskPattern;
}

/**
 * QR code boolean matrix.
 * A two-dimensional matrix that represents rows and columns
 * 
 * true: The grid that needs to be filled.
 * 
 * false: The grid that needs to be empty.
 */
export type QRMatrix = Nullable<boolean>[][];
