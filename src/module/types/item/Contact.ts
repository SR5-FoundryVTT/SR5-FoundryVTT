declare namespace Shadowrun {
    export interface ContactData extends
        ContactPartData,
        ImportFlags,
        DescriptionPartData {

    }

    export interface ContactPartData {
        type: string;
        connection: number;
        loyalty: number;
        family: boolean;
        blackmail: boolean;
        group: boolean;
    }
}
