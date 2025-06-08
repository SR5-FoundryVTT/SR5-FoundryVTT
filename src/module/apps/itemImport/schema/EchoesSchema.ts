// AUTO‑GENERATED — DO NOT EDIT

import { BonusSchema } from './BonusSchema';
import { Empty, Many } from './Types';

export interface Echo {
    bonus?: BonusSchema;
    hide?: Empty;
    id: { _TEXT: string; };
    limit?: { _TEXT: string; };
    name: { _TEXT: string; };
    page: { _TEXT: string; };
    source: { _TEXT: string; };
};

export interface EchoesSchema {
    $: { xmlns: string; "xmlns:xsi": string; "xsi:schemaLocation": string; };
    echoes: {
        echo: Many<Echo>;
    };
};
