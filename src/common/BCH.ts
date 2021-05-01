const G15_MASK: number = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

const G15: number = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);

const G18: number = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);

function getBCHDigit(data: number): number {
    let digit: number = 0;

    while (data !== 0) {
        digit++;
        data >>>= 1;
    }

    return digit;
}

const G18_BCH: number = getBCHDigit(G18);

export function getBCHVersion(data: number): number {
    let offset: number = data << 12;

    while (getBCHDigit(offset) - G18_BCH >= 0) {
        offset ^= G18 << (getBCHDigit(offset) - G18_BCH);
    }

    return (data << 12) | offset;
}

const G15_BCH: number = getBCHDigit(G15);

export function getBCHVersionInfo(data: number): number {
    let offset: number = data << 10;

    while (getBCHDigit(offset) - G15_BCH >= 0) {
        offset ^= G15 << (getBCHDigit(offset) - G15_BCH);
    }

    return ((data << 10) | offset) ^ G15_MASK;
}