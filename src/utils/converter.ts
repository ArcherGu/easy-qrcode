import { SJIS_UTF8_MAPPING } from "./sjis_utf8_mapping";

type SJISConverterMapping = { [byte: number]: number; };

export interface SJISConverterMappings {
    UTF8_TO_SJIS: SJISConverterMapping;
    SJIS_TO_UTF8: SJISConverterMapping;
}

let mappings: SJISConverterMappings;
export function getSJISConverterMappings(): SJISConverterMappings {
    if (!mappings) {
        const UTF8_TO_SJIS: SJISConverterMapping = {};
        const SJIS_TO_UTF8: SJISConverterMapping = {};

        for (const item of SJIS_UTF8_MAPPING) {
            const kanji: string = item[1];

            for (let j: number = 0; j < kanji.length; j++) {
                const kCode: number = item[0] + j;
                const uCode: number = kanji.charAt(j).charCodeAt(0);

                UTF8_TO_SJIS[uCode] = kCode;
                SJIS_TO_UTF8[kCode] = uCode;
            }
        }

        mappings = { UTF8_TO_SJIS, SJIS_TO_UTF8 };
    }

    return mappings;
}

export function toSJIS(text: string): number[] {
    const bytes: number[] = [];
    const length: number = text.length;
    const { UTF8_TO_SJIS } = getSJISConverterMappings();

    for (let i: number = 0; i < length; i++) {
        const code: number = text.charCodeAt(i);
        const byte: number = UTF8_TO_SJIS[code];

        if (byte != null) {
            bytes.push(byte >> 8); // 8 bits higher
            bytes.push(byte & 0xFF);// 8 bits lower
        } else {
            throw new Error(`illegal char: ${String.fromCharCode(code)}`);
        }
    }

    return bytes;
}

export function toUTF8(text: string): number[] {
    const bytes: number[] = [];
    const length: number = text.length;

    let pos: number = 0;

    for (let i: number = 0; i < length; i++) {
        let code: number = text.charCodeAt(i);

        if (code < 128) {
            bytes[pos++] = code;
        } else if (code < 2048) {
            bytes[pos++] = (code >> 6) | 192;
            bytes[pos++] = (code & 63) | 128;
        } else if ((code & 0xfc00) === 0xd800 && i + 1 < length && (text.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
            // Surrogate Pair
            code = 0x10000 + ((code & 0x03ff) << 10) + (text.charCodeAt(++i) & 0x03ff);

            bytes[pos++] = (code >> 18) | 240;
            bytes[pos++] = ((code >> 12) & 63) | 128;
            bytes[pos++] = ((code >> 6) & 63) | 128;
            bytes[pos++] = (code & 63) | 128;
        } else {
            bytes[pos++] = (code >> 12) | 224;
            bytes[pos++] = ((code >> 6) & 63) | 128;
            bytes[pos++] = (code & 63) | 128;
        }
    }

    return bytes;
}

export function toUTF16(text: string): number[] {
    const bytes: number[] = [];
    const length: number = text.length;

    for (let i: number = 0; i < length; i++) {
        bytes.push(text.charCodeAt(i));
    }

    return bytes;
}
