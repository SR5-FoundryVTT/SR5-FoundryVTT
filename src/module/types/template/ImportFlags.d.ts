declare namespace Shadowrun {
    export interface ImportFlags {
        importFlags: ImportFlagData;
    }

    export interface ImportFlagData {
        name: string;
        type: string;
        subType: string;
        isFreshImport: boolean;
    }
}
