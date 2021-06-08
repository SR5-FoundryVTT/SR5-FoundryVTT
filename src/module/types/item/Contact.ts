declare namespace Shadowrun {
    export interface ContactData extends ContactPartData, DescriptionPartData {

    }

    export interface ContactPartData {
        type: string;
        connection: number;
        loyalty: number;
        family: boolean;
        blackmail: boolean;
    }
}
