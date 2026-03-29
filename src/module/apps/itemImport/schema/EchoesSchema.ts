// AUTO‑GENERATED — DO NOT EDIT - Check utils/generate_schemas.py for more info

import { BonusSchema } from './BonusSchema';
import { Empty, Many, OneOrMany, IntegerString } from './Types';

export interface Echo {
    bonus?: BonusSchema;
    hide?: Empty;
    id: { _TEXT: string; };
    limit?: { _TEXT: IntegerString | "False"; };
    name: { _TEXT: string; };
    page?: { _TEXT: IntegerString; };
    source?: { _TEXT: "DT" | "DTD" | "DTR" | "KC" | "SR5"; };
    translate?: OneOrMany<{ _TEXT: string; }>;
    altpage?: OneOrMany<{ _TEXT: string; }>;
    altnameonpage?: OneOrMany<Empty>;
};

export interface EchoesSchema {
    $: { xmlns: ""; "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance"; "xsi:schemaLocation": "http://www.w3.org/2001/XMLSchema echoes.xsd"; };
    echoes: {
        echo: Many<Echo>;
    };
};
