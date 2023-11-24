import Sr5Tour from "./sr5Tours";

export default async function registerSR5Tours() {
  try {

     // @ts-expect-error
    game.tours.register(
      'shadowrun5e',
      'ConditionMonitor',
       // @ts-expect-error
      await Sr5Tour.fromJSON('/systems/shadowrun5e/dist/tours/ConditionMonitor.json'),
    );

     // @ts-expect-error
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
