/**
 * Mask Pattern
 * @readonly
 * @enum {number}
 */
export const enum MaskPattern {
    PATTERN000 = 0b000,
    PATTERN001 = 0b001,
    PATTERN010 = 0b010,
    PATTERN011 = 0b011,
    PATTERN100 = 0b100,
    PATTERN101 = 0b101,
    PATTERN110 = 0b110,
    PATTERN111 = 0b111
}

export type MaskFunc = (x: number, y: number) => boolean;

/**
 * Get mask function by mask pattern
 *
 * @export
 * @param {number} maskPattern
 * @returns {MaskFunc}
 */
export function getMaskFunc(maskPattern: number): MaskFunc {
    switch (maskPattern) {
        case MaskPattern.PATTERN000:
            return (x: number, y: number): boolean => ((x + y) & 0x1) === 0;
        case MaskPattern.PATTERN001:
            return (x: number, y: number): boolean => (y & 0x1) === 0;
        case MaskPattern.PATTERN010:
            return (x: number, y: number): boolean => x % 3 === 0;
        case MaskPattern.PATTERN011:
            return (x: number, y: number): boolean => (x + y) % 3 === 0;
        case MaskPattern.PATTERN100:
            return (x: number, y: number): boolean => ((((x / 3) >> 0) + ((y / 2) >> 0)) & 0x1) === 0;
        case MaskPattern.PATTERN101:
            return (x: number, y: number): boolean => ((x * y) & 0x1) + ((x * y) % 3) === 0;
        case MaskPattern.PATTERN110:
            return (x: number, y: number): boolean => ((((x * y) & 0x1) + ((x * y) % 3)) & 0x1) === 0;
        case MaskPattern.PATTERN111:
            return (x: number, y: number): boolean => ((((x * y) % 3) + ((x + y) & 0x1)) & 0x1) === 0;
        default:
            throw new Error(`invalid mask: ${maskPattern}`);
    }
}