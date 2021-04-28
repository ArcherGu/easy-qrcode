/**
 * 
 * @readonly
 * @export
 * @enum {number}
 */
export enum Mode {
    ECI = 0x7, // 0111
    Numeric = 0x1, // 0001
    Alphanumeric = 0x2, // 0010
    Byte = 0x4,// 0100
    Kanji = 0x8,// 1000
    StructuredAppend = 0x3,// 0011
    FNC1FirstPosition = 0x5,// 0101
    FNC1SecondPosition = 0x9,// 1001
    Terminator = 0x0,
}
