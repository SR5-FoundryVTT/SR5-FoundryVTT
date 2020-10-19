import ModList = Shadowrun.ModList;
import ModListEntry = Shadowrun.ModListEntry;

export class PartsList<TType> {
    get list(): ModList<TType> {
        return this._list.slice();
    }

    get length(): number {
        return this._list.length;
    }

    get total(): number {
        let total = 0;
        for (const part of this._list) {
            if (typeof part.value === 'number') {
                total += part.value;
            }
        }
        return total;
    }

    get isEmpty(): boolean {
        return this.total === 0;
    }

    getPartValue(name: string): TType | undefined {
        return this._list.find((part) => part.name === name)?.value;
    }

    clear(): void {
        this._list.length = 0;
    }

    private _list: ModList<TType>;

    constructor(parts?: ModList<TType>) {
        let actualParts = [] as ModList<TType>;
        if (parts) {
            if (Array.isArray(parts)) {
                actualParts = parts;
            } else if (typeof parts === 'object') {
                for (const [name, value] of Object.entries(parts)) {
                    if (value !== null && value !== undefined) {
                        // if it's a number, we are dealing with an array as an object
                        if (!isNaN(Number(name)) && typeof value === 'object') {
                            actualParts.push({
                                name: (value as ModListEntry<TType>).name,
                                value: (value as ModListEntry<TType>).value,
                            });
                        } else {
                            actualParts.push({
                                name,
                                value,
                            } as ModListEntry<TType>);
                        }
                    }
                }
            }
        }
        this._list = actualParts;
    }

    addPart(name: string, value: TType): void {
        this._list.push({
            name,
            value,
        });
    }

    addUniquePart(name: string, value?: TType, overwrite = true): void {
        const index = this._list.findIndex((part) => part.name === name);
        if (index > -1) {
            // if we exist and should've overwrite, return
            if (!overwrite) return;

            this._list.splice(index, 1);
            // if we are passed undefined, remove the value
            if (value === undefined || value === null) return;
            // recursively go through until we no longer have a part of this name
            this.addUniquePart(name, value);
        } else if (value) {
            this.addPart(name, value);
        }
    }

    removePart(name: string): boolean {
        const index = this._list.findIndex((part) => part.name === name);
        if (index > -1) {
            this._list.splice(index, 1);
            return true;
        }
        return false;
    }

    getMessageOutput() {
        return this.list;
    }

    static AddUniquePart<TType>(list: ModList<TType>, name: string, value: TType, overwrite = true): ModList<TType> {
        const parts = new PartsList(list);
        parts.addUniquePart(name, value, overwrite);
        return parts._list;
    }

    static Total(list: ModList<number>) {
        const parts = new PartsList(list);
        return parts.total;
    }
}
