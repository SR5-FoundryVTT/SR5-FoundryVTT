import Sr5Tour from "./sr5Tours";

export default async function registerSR5Tours() {
  try {

     // @ts-expect-error
    game.tours.register(
      'shadowrun5e',
      'Tracks',
       // @ts-expect-error
      await Sr5Tour.fromJSON('/systems/shadowrun5e/dist/tours/tracks.json'),
    );

  } catch (err) {
    console.log(err);
  }
}
