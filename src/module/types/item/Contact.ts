declare namespace Shadowrun {
    export type ContactData = ContactPartData & DescriptionPartData;

    export type ContactPartData = {
        type: string;
        connection: number;
        loyalty: number;
        family: boolean;
        blackmail: boolean;
    };
}
