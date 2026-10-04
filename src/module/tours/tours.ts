import Sr5Tour from "./sr5Tours";

export default async function registerSR5Tours() {
    try {

        game.tours.register(
            'shadowrun5e',
            'ConditionMonitor',
            await Sr5Tour.fromJSON('/systems/shadowrun5e/dist/tours/ConditionMonitor.json'),
        );


    //      game.tours.register(
    //       'shadowrun5e',
    //       'CharacterImport',
    //        // @ts-expect-error TODO: fvtt-types v14 - Commented-out tour registration, original type error was never documented.
    //       await Sr5Tour.fromJSON('/systems/shadowrun5e/dist/tours/character-import.json'),
    //     );
    //

    } catch (err) {
        console.log(err);
    }
}
