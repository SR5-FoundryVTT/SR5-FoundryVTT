import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { CharacterImporter } from '../../../module/apps/importer/actorImport/characterImporter/CharacterImporter';
import { SR5TestingDocuments } from "../../utils";
import { SR5Actor } from "../../../module/actor/SR5Actor";

export const characterInfoUpdaterTesting = (context: QuenchBatchContext) => {
    const { describe, it, assert, before, after } = context;

    let testActorFactory;
    let importOptions = {}
    let chummerFile;

    before(async () => {
      testActorFactory = new SR5TestingDocuments(SR5Actor)
    })

    beforeEach(async () => {
      chummerFile = {
        characters: {
            character: {}
        }
      }
    })

    after(async () => {
        await testActorFactory.teardown();
    })

    describe("Chummer Character Info Updater handles alias correctly", () => {

      it("Imports name", async () => {

        chummerFile.characters.character = {
          alias : "ImportTester"
        }
          
          const character = await testActorFactory.create({ type: 'character', 'system.metatype': 'human' });
          await new CharacterImporter().importChummerCharacter(character, chummerFile, importOptions)
        
          assert.strictEqual(character.name, "ImportTester")
          assert.strictEqual(character.prototypeToken.name, "ImportTester")
  
      });

      it("Sets placeholder when no alias", async () => {
          
          const character = await testActorFactory.create({ type: 'character', 'system.metatype': 'human' });
          await new CharacterImporter().importChummerCharacter(character, chummerFile, importOptions)

          assert.strictEqual(character.name, "[Name not found]")
          assert.strictEqual(character.prototypeToken.name, "[Name not found]")
  
      });
    })

    describe("Chummer Character Info Updater handles attributes correctly", () => {

      it("Imports standard attributes", async () => {

        chummerFile.characters.character = {
          attributes :[
            "0",
            {
              "attributecategory_english": "Standard",
              "attribute": [
                {
                  "name_english": "BOD",
                  "name": "KON",
                  "base": "3",
                  "total": "3",
                  "min": "1",
                  "max": "6",
                  "aug": "10",
                  "bp": "0",
                  "metatypecategory": "Standard"
                },
                {
                  "name_english": "AGI",
                  "name": "GES",
                  "base": "3",
                  "total": "3",
                  "min": "1",
                  "max": "6",
                  "aug": "10",
                  "bp": "0",
                  "metatypecategory": "Standard"
                },
                {
                  "name_english": "REA",
                  "name": "REA",
                  "base": "5",
                  "total": "5",
                  "min": "1",
                  "max": "6",
                  "aug": "10",
                  "bp": "0",
                  "metatypecategory": "Standard"
                },
                {
                  "name_english": "STR",
                  "name": "STR",
                  "base": "1",
                  "total": "1",
                  "min": "1",
                  "max": "6",
                  "aug": "10",
                  "bp": "0",
                  "metatypecategory": "Standard"
                },
                {
                  "name_english": "CHA",
                  "name": "CHA",
                  "base": "2",
                  "total": "2",
                  "min": "1",
                  "max": "6",
                  "aug": "10",
                  "bp": "10",
                  "metatypecategory": "Standard"
                },
                {
                  "name_english": "INT",
                  "name": "INT",
                  "base": "6",
                  "total": "6",
                  "min": "1",
                  "max": "6",
                  "aug": "10",
                  "bp": "0",
                  "metatypecategory": "Standard"
                },
                {
                  "name_english": "LOG",
                  "name": "LOG",
                  "base": "4",
                  "total": "4",
                  "min": "1",
                  "max": "6",
                  "aug": "10",
                  "bp": "0",
                  "metatypecategory": "Standard"
                },
                {
                  "name_english": "WIL",
                  "name": "WIL",
                  "base": "5",
                  "total": "5",
                  "min": "1",
                  "max": "6",
                  "aug": "10",
                  "bp": "0",
                  "metatypecategory": "Standard"
                },
                {
                  "name_english": "EDG",
                  "name": "EDG",
                  "base": "3",
                  "total": "3",
                  "min": "2",
                  "max": "7",
                  "aug": "7",
                  "bp": "15",
                  "metatypecategory": "Special"
                },
                {
                  "name_english": "ESS",
                  "name": "ESS",
                  "base": "1",
                  "total": "1",
                  "min": "1",
                  "max": "6",
                  "aug": "6",
                  "bp": "0",
                  "metatypecategory": "Standard"
                }
              ]
            }
          ]
        }
          
          const character = await testActorFactory.create({ type: 'character', 'system.metatype': 'human' });
          await new CharacterImporter().importChummerCharacter(character, chummerFile, importOptions)
        
          assert.strictEqual(character.system.attributes.body.value, 3)
          assert.strictEqual(character.system.attributes.charisma.value, 2)
          assert.strictEqual(character.system.attributes.intuition.value, 6)
          assert.strictEqual(character.system.attributes.logic.value, 4)
          assert.strictEqual(character.system.attributes.reaction.value, 5)
          assert.strictEqual(character.system.attributes.strength.value, 1)
          assert.strictEqual(character.system.attributes.willpower.value, 5)
          assert.strictEqual(character.system.attributes.agility.value, 3)

          assert.strictEqual(character.system.attributes.edge.value, 3)
          assert.strictEqual(character.system.attributes.essence.value, 6)
  
      });

      it("Imports magic attribute", async () => {

        chummerFile.characters.character = {
          attributes :[
            "0",
            {
              "attributecategory_english": "Standard",
              "attribute": [
                {
                  "name_english": "MAG",
                  "name": "MAG",
                  "base": "7",
                  "total": "7",
                  "min": "6",
                  "max": "12",
                  "aug": "12",
                  "bp": "35",
                  "metatypecategory": "Special"
                }
              ]
            }
          ]
        }
          
          const character = await testActorFactory.create({ type: 'character', 'system.metatype': 'human' });
          await new CharacterImporter().importChummerCharacter(character, chummerFile, importOptions)

          assert.strictEqual(character.system.attributes.magic.value, 7)
          assert.strictEqual(character.system.attributes.resonance.value, 0)
  
      });

      it("Imports resonance attribute", async () => {

        chummerFile.characters.character = {
          attributes :[
            "0",
            {
              "attributecategory_english": "Standard",
              "attribute": [
                {
                  "name_english": "RES",
                  "name": "RES",
                  "base": "7",
                  "total": "7",
                  "min": "6",
                  "max": "12",
                  "aug": "12",
                  "bp": "35",
                  "metatypecategory": "Special"
                }
              ]
            }
          ]
        }
          
          const character = await testActorFactory.create({ type: 'character', 'system.metatype': 'human' });
          await new CharacterImporter().importChummerCharacter(character, chummerFile, importOptions)
      
          assert.strictEqual(character.system.attributes.magic.value, 0)
          assert.strictEqual(character.system.attributes.resonance.value, 7)  
      });

    })

  
}

