// AUTO‑GENERATED — DO NOT EDIT - Check utils/generate_schemas.py for more info

import { BonusSchema } from './BonusSchema';
import { ConditionsSchema } from './ConditionsSchema';
import { Empty, Many, OneOrMany } from './Types';

export interface Echo {
    bonus?: BonusSchema;
    hide?: Empty;
    id: { _TEXT: string; };
    limit?: { _TEXT: string; };
    name: { _TEXT: string; };
    page: { _TEXT: string; };
    source: { _TEXT: string; };
    translate?: { _TEXT: string; };
};

export interface EchoesSchema {
    $: { xmlns: string; "xmlns:xsi": string; "xsi:schemaLocation": string; };
    echoes: {
        echo: Many<Echo>;
    };
};
