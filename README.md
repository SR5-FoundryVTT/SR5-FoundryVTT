# Shadowrun5e for Foundry Virtual Tabletop
Manifest: https://raw.githubusercontent.com/smilligan93/SR5-FoundryVTT/master/system.json

I will always be happy to look at a Pull Request if there are features or bugs you'd like to work on.
If you're not a programmer and would like to support the project, 
## General Information (Read before playing)
It's complicated, it's a work in progress, but it is _kinda_ stable. I try to break as little as possible.
#### Other Actor Sheet Plans
Originally I planned on making a Grunt sheet, but quickly found myself just expanding on the Character sheet. At the moment, there is no plan for a Grunt sheet.
- Vehicle sheet is my next planned sheet. 
- Host, IC, Spirits, and Sprites are planned.
## Character Sheet

![alt text](https://raw.githubusercontent.com/smilligan93/SR5-FoundryVTT/master/screenshots/CharacterSheet.jpg)
### Misc Tab & Overrides
- A lot of the sheet auto-calculates things, overrides can be found in the Misc tab
- Awakened and Emerged can be selected in Misc Tab
- Drain resist can be selected there as well, any attribute can be selected (combines with willpower)
### Header area
- Limits are top right, **auto-calculated**
- Wounds appear in the top right when applicable, **auto-calculated**
- Stun and Physical Tracks start at 0 and go up to _fill_ the track, **auto-calculated**
  - _(This was changed in version 0.5.3... or somewhere in that version area)_
  - clicking on the appropriate track will perform the appropriate healing roll
- Movement (walk / run / srpint), **auto-calculated**
- Edge can be rolled, explicit uses of edge _should_ decrement edge value
- Initiative can be selected from the dropdown, checkbox toggles **Blitz (edge)** usages
- Essence is based on cyberware from gear, **auto-calculated**
#### Roll Line
- Each link can be rolled
- Drain appears if Emerged or Awakened is selected
- Dice Icon in the middle provides just a regular "Shadowrun5e" roll
### Skills tab
#### Attributes
- Attributes can be rolled, value provided should be the total "permanent" value
  - +Tmp field is for temporary changes from the current situation. This also affects the appropriate limit.
    - There is currently no way to increase an attribute and **not** have it affect the limit
#### Skills
- Hidden by default if they're value is 0
- Clicking the **Active Skills** header will show them all
- Rolling on a skill that has a value of 0 will default automatically
- Language and Knowledge skills can be added on the right
### Actions Tab
- Actions are displayed in a list similar to other gear locations.
- See Gears tab for how to roll them
### Gears Tab
- Gear is displayed in order, weapons to start.
- Mousing over the Item icon should turn into a dice-like icon. Clicking that will post the Item Card to chat.
- Clicking the name of the item will display the description of the item.
- Equipping items have certain effects.
  - Armor - Calculates Armor value
  - Device - Calculates Matrix attributes in the matrix tab
  - Cyberware - Calculates Essence attribute and have actions
### Magic Tab
- Only shows if actor is set as Awakened
- Powers and Spells are displayed here.
- Rolls similar to Gear
### Matrix Tab
- Hot Sim changes the matrix initiative and adds a +2 to "matrix rolls"
- Running Silent adds a -2 to "matrix rolls"
  - determines if it's a matrix roll by the limit
### Bio Tab
- Metatype can be input here (no impact on the sheet)
- Description is underneath
#### Qualities
- Has actions on the items
- Rolls similar to Gear
### Social Tab
- SIN, Lifestyles, and Contacts
- Rolls similar to Gear
### Misc Tab
- Chummer Import - See Chummer Import section
## Item Sheet
Items in Foundry is anything that isn't an "actor" -- this includes spells, adept powers, Lifestyles, etc.

![alt text](https://raw.githubusercontent.com/smilligan93/SR5-FoundryVTT/master/screenshots/Weapon.jpg)
### Description Tab
- Basic information and description about the item
### Weapon/Action/Spell Tab
All Items have similar setup to them. The sheet doesn't force the attribute for an item to allow homebrew
#### Weapon
- RC (recoil compensation) is the _weapon_ value, character RC is added at the time of roll
- Ammo Count is just the current ammo count, doesn't matter what _ammo_ is equipped
#### Spell
- Drain value is the _F_ value _(-1 for F-1)_
### Action
- Dice Poll Mod adds the provided value to the roll (to account for effects from Qualities, etc.)
- Limit can be increased by an attribute to stay in sync
### Damage
- Damage value can be increased by an attribute
### Opposed Test
- What kind of test the opposition has to make, leave blank if none
## Chummer Import
Chummer Import should be considered Experimental.
The importer itself is found in the 'Misc' tab on the character sheet.
### A few rules to follow
**The Import Is Not Perfect**
- Cleanup is needed, mostly on weapons.
  - Weapon attachments do not import correctly
  - recoil does not import correctly
  - limits are set to a fixed value on melee weapons
  - 
- Don't import to the same character sheet multiple times without unchecking the appropriate boxes.
  - The importer does not check to see if it's going to duplicate things
### Licences
Icons provided by Font Awesome: https://fontawesome.com/license
