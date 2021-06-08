declare namespace Shadowrun {
    export type Movement = {
        walk: {
            value: number;
            mult: number;
            base: number;
        };
        run: {
            value: number;
            mult: number;
            base: number;
        };
        sprint: number;
        swimming: number;
    };


}