import { ImportHelper } from './ImportHelper';
import { ImportStrategy } from './ImportStrategy';

export class XMLStrategy extends ImportStrategy {
    public intValue(jsonData: object, key: string, fallback: number | undefined = undefined): number {
        try {
            return parseInt(jsonData[key][ImportHelper.CHAR_KEY]);
        } catch (e) {
            if (fallback !== undefined) {
                return fallback;
            } else {
                throw e;
            }
        }
    }

    public stringValue(jsonData: object, key: string | number, fallback: string | undefined = undefined): string {
        try {
            return jsonData[key][ImportHelper.CHAR_KEY];
        } catch (e) {
            if (fallback !== undefined) {
                return fallback;
            } else {
                throw e;
            }
        }
    }

    public objectValue(jsonData: object, key: string | number, fallback: object | null | undefined = undefined): object | null {
        try {
            return jsonData[key];
        } catch (e) {
            if (fallback !== undefined) {
                return fallback;
            } else {
                throw e;
            }
        }
    }
}
