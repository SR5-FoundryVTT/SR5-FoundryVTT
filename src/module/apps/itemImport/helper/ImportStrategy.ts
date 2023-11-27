export abstract class ImportStrategy {
    public abstract intValue(jsonData: object, key: string, fallback: number | undefined): number;
    public abstract stringValue(jsonData: object, key: string | number, fallback: string | undefined): string;
    public abstract objectValue(jsonData: object, key: string | number, fallback: object | null | undefined): object | null;
}
export type ItemComparer = (item: Item) => boolean;
