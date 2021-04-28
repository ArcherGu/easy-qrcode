import { AlphanumericData } from "./data/Alphanumeric";
import { BaseData } from "./data/BaseData";
import { ByteData } from "./data/Byte";
import { KanjiData } from "./data/Kanji";
import { NumericData } from "./data/Numeric";
import { QRContent } from "./QRContent";

export class Creator {
    private segments: BaseData[] = [];

    constructor() {
        // TODO: Init
    }

    /**
     * Add content to creator
     *
     * @param {(QRContent | string)} content
     * @returns {Creator}
     * @memberof Creator
     */
    public add(content: QRContent | string): Creator {
        let data: BaseData;
        if (content instanceof QRContent) {
            data = content.convertToData();
        }
        else if (toString.call(content) === '[object String]') {
            const TEST_NUMERIC = /^\d+$/;
            const TEST_ALPHANUMERIC = /^[0-9A-Z$%*+-./: ]+$/;
            if (TEST_NUMERIC.test(content)) {
                data = new NumericData(content);
            } else if (TEST_ALPHANUMERIC.test(content)) {
                data = new AlphanumericData(content);
            }

            try {
                data = new KanjiData(content);
            } catch (error) {
                data = new ByteData(content);
            }
        }
        else {
            throw new Error(`invalid content: ${content}`);
        }

        this.segments.push(data);

        return this;
    }

    public create(): Creator {
        return this;
    }
}