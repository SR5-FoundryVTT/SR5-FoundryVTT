// AUTO‑GENERATED — DO NOT EDIT - Check utils/generate_schemas.py for more info

import { Empty, Many, OneOrMany, IntegerString } from './Types';

export interface Skill {
    attribute: { _TEXT: "AGI" | "BOD" | "CHA" | "INT" | "LOG" | "MAG" | "REA" | "RES" | "STR" | "WIL"; };
    category: { _TEXT: string; };
    default: { _TEXT: "False" | "True"; };
    exotic?: { _TEXT: "True"; };
    id: { _TEXT: string; };
    name: { _TEXT: string; };
    page?: { _TEXT: IntegerString; };
    requiresflymovement?: { _TEXT: "True"; };
    requiresgroundmovement?: { _TEXT: "True"; };
    requiresswimmovement?: { _TEXT: "True"; };
    skillgroup: Empty | { _TEXT: string; };
    source?: { _TEXT: "SR5"; };
    specs: Empty | {
        spec?: OneOrMany<{ _TEXT: string; }>;
    };
    translate?: OneOrMany<{ _TEXT: string; }>;
    altpage?: OneOrMany<{ _TEXT: string; }>;
    altnameonpage?: OneOrMany<Empty>;
};

export interface SkillsSchema {
    $: { xmlns: ""; "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance"; "xsi:schemaLocation": "http://www.w3.org/2001/XMLSchema skills.xsd"; };
    categories: {
        category: Many<{ _TEXT: string; $: { translate?: string; type: "active" | "knowledge"; }; }>;
    };
    knowledgeskills: {
        skill: Many<Skill>;
    };
    skillgroups: {
        name: Many<{ _TEXT: string; }>;
    };
    skills: {
        skill: Many<Skill>;
    };
};
