import { ImportStrategy } from './ImportStrategy';

export class JSONStrategy extends ImportStrategy {
    public intValue(jsonData: object, key: string, fallback: number | undefined = undefined): number {
        throw new Error('Unimplemented');
    }

    public stringValue(jsonData: object, key: string | number, fallback: string | undefined = undefined): string {
        throw new Error('Unimplemented');
    }

    public objectValue(jsonData: object, key: string | number, fallback: object | null | undefined = undefined): object | null {
        throw new Error('Unimplemented');
    }
}
