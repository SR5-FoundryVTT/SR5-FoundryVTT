import Sr5Tour from "./sr5Tours";

export default async function registerSR5Tours() {
    try {

        game.tours.register(
            'shadowrun5e',
            'ConditionMonitor',
            await Sr5Tour.fromJSON('/systems/shadowrun5e/dist/tours/ConditionMonitor.json'),
        );

        game.tours.register(
            'shadowrun5e',
            'RiggerSwarm',
            await Sr5Tour.fromJSON('/systems/shadowrun5e/dist/tours/RiggerSwarm.json'),
        );

        game.tours.register(
            'shadowrun5e',
            'Autosofts',
            await Sr5Tour.fromJSON('/systems/shadowrun5e/dist/tours/Autosofts.json'),
        );

        game.tours.register(
            'shadowrun5e',
            'MatrixNoise',
            await Sr5Tour.fromJSON('/systems/shadowrun5e/dist/tours/MatrixNoise.json'),
        );


    //      game.tours.register(
    //       'shadowrun5e',
    //       'CharacterImport',
    //        // @ts-expect-error
    //       await Sr5Tour.fromJSON('/systems/shadowrun5e/dist/tours/character-import.json'),
    //     );
    //

    } catch (err) {
        console.log(err);
    }
}
