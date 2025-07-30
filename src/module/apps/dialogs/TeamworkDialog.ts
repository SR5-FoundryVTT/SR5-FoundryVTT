import { FormDialog, FormDialogData, FormDialogOptions } from "./FormDialog";
import { SR5Actor } from "../../actor/SR5Actor";
import { AttributeEntry, LimitEntry, LimitKey, SkillEntry, SkillGroup, TeamworkData, TeamworkFlow } from "../../actor/flows/TeamworkFlow";
import { SR5 } from "../../config";

import { Translation } from "../../utils/strings";
import { FLAGS, SYSTEM_NAME } from "@/module/constants";

export interface TeamWorkDialogData extends Omit<FormDialogData, "templateData"> {
  templateData: {
    actors: SR5Actor[];
    skills: SkillGroup[];
    attributes: AttributeEntry[];
    filter: string;
    limits: LimitEntry[];
    request: boolean;
    specialization: boolean;
    cancelled: boolean;
    showAllowOtherSkills: boolean;
    lockedSkill: boolean;
  } & TeamworkData;
}

/**
 * Presents and manages the teamwork test configuration dialog.
 *
 * This dialog class handles:
 *  - Initializing form state from provided `TeamworkDialogOptions` (actors, pre-selected actor/skill/attribute, thresholds, limits, specialization, etc.).
 *  - Rendering the Handlebars template and binding UI event listeners (input changes, button clicks, drag/drop support).
 *  - Validating and normalizing user selections into a `Partial<TeamworkData>` result.
 *  - Providing live result previews and feedback via `updateResult()`.
 *  - Returning the finalized configuration or cancellation flag through the `select()` method.
 *
 */
export class TeamWorkDialog extends FormDialog {
  override data: TeamWorkDialogData;
  private baseActors: SR5Actor[];
  private baseSkills: SkillGroup[];
  private filter: string;
  private lockedSkill: boolean;

/**
 * Initializes a new TeamworkDialog with given data and window options.
 *
 * @param teamworkData  Partial configuration for the teamwork test:
 *   - `actors?`: list of eligible {@link SR5Actor} instances (defaults to user-owned actors)
 *   - `actor?`: pre-selected {@link SR5Actor}
 *   - `skill?`: pre-selected {@link SkillEntry}
 *   - `attribute?`: pre-selected {@link AttributeEntry}
 *   - `threshold?`: initial pass threshold (number)
 *   - `allowOtherSkills?`: whether alternate skills are permitted (boolean)
 *   - `limit?`: initial {@link LimitEntry} override
 *   - `request?`: if true, dialog opens in request-only mode (no immediate roll)
 * @param options       {@link FormDialogOptions} to customize dialog behavior and appearance.
 *                      `applyFormChangesOnSubmit` is disabled by default.
 */
  constructor(
    teamworkData: {
      actors?: SR5Actor[];
      actor?: SR5Actor;
      skill?: SkillEntry;
      attribute?: AttributeEntry;
      threshold?: number;
      allowOtherSkills?: boolean;
      limit?: LimitEntry;
      request?: boolean;
    },
    // @ts-expect-error // TODO: default option value with all the values...
    options: FormDialogOptions = {}) {
      // Prevent automatic form data binding on submit; we apply changes manually in onAfterClose
    options.applyFormChangesOnSubmit = false;

    console.log("TWDialog constructor actors: ", teamworkData.actors)

    const actors = teamworkData.actors ?? game.actors?.filter(actor => actor.testUserPermission(game.user!, "OWNER")) ?? [];
    const actor = teamworkData.actor ?? actors[0] ?? undefined;
    const attributes = actor
      ? TeamworkFlow.buildAttributeList(actor)
      : [];
    const skills = TeamworkFlow.buildSkillGroups(actor);
    const givenSkill: SkillEntry | undefined = teamworkData.skill
      ? skills
        .flatMap(g => g.skills)
        .find(s => s.id === teamworkData.skill?.id || s.label === teamworkData.skill?.id)
      : undefined;
    const skill: SkillEntry = givenSkill ?? skills[0]?.skills[0]!;
    const attributeKey = teamworkData.attribute?.name ?? skill?.attribute
    const attribute = attributes.find(a =>
      a.name === attributeKey || a.label === attributeKey
    );

    const threshold = teamworkData.threshold ?? 0;
    const showAllowOtherSkills = game.settings.get(SYSTEM_NAME, FLAGS.AllowDifferentSkillForTeamworkTests) as boolean;
    const allowOtherSkills = Boolean(showAllowOtherSkills && teamworkData.allowOtherSkills);
    const limit = teamworkData.limit?.name != undefined && teamworkData.limit.name !== "" ? teamworkData.limit.name : skill?.limit ?? "";
    const limits = TeamworkFlow.limitList;
    const request = Boolean(teamworkData.request);
    const lockedSkill = !request && (!showAllowOtherSkills || !allowOtherSkills);

    const templateData = {
      actors,
      actor,
      attributes,
      skills,
      attribute,
      skill,
      threshold,
      showAllowOtherSkills,
      allowOtherSkills,
      filter: '',
      limit: {
        name: typeof limit === "string" ? limit : '',
        label: typeof limit === "string" ? limits[limit] : '',
        base: typeof limit === "number" ? limit : undefined
      },
      limits,
      request,
      lockedSkill,
      specialization: false
    };

    const buttons = {
      roll: { label: game.i18n.localize("SR5.Roll"), icon: '<i class="fas fa-handshake"></i>' },
      cancel: { label: game.i18n.localize("SR5.Dialogs.Common.Cancel") }
    };

    const data: FormDialogData = {
      templateData,
      templatePath: "systems/shadowrun5e/dist/templates/apps/dialogs/teamwork-dialog.html",
      title: "Teamwork",
      content: "",
      buttons 
    };

    super(data, options);

    this.baseActors = actors;
    this.baseSkills = TeamworkFlow.buildSkillGroups(actor);
  }

  static override get defaultOptions() {
    const options = super.defaultOptions;
    options.id = 'teamwork-dialog';
    options.classes = ['sr5', 'form-dialog'];
    options.resizable = true;
    options.height = 'auto';
    // @ts-expect-error width:auto
    options.width = 'auto';
    return options;
  }

  override get templateContent(): string {
    return 'systems/shadowrun5e/dist/templates/apps/dialogs/teamwork-dialog.html';
  }

  /**
 * Prepares and returns the dialog’s context data for rendering.
 *
 * This override:
 *  1. Calls the base `getData()` to assemble default template context.
 *  2. Ensures `baseActors` and `baseSkills` are initialized on first render.
 *  3. Updates `this.data.templateData.skills` to always reflect the latest skill groups for the selected actor.
 *
 * @returns The full {@link TeamWorkDialogData} context object for the Handlebars template.
 */
  override getData(): TeamWorkDialogData {
    console.log("🔍 Initial this.data.attribute =", this.data.templateData.attribute);
    const data = super.getData() as unknown as TeamWorkDialogData;

    if (!this.baseActors) {
      this.baseActors = this.data.templateData.actors;
      this.baseSkills = TeamworkFlow.buildSkillGroups(this.data.templateData.actor);
    }
    this.data.templateData.skills = this.baseSkills;
    return data;
  }

  /**
 * Attaches event listeners to the limit input fields to enforce mutual exclusivity
 * and validate numeric base values.
 *
 * This override:
 *  - Calls the base listener setup.
 *  - Disables the limit-name dropdown whenever a non-empty numeric base is entered.
 *  - On blur, parses and validates the base input, clearing invalid entries and re-enabling the dropdown.
 *  - Triggers initial input/change events to initialize the controls’ state.
 *
 * @param html The jQuery-wrapped HTML element of the dialog.
 */
  override activateListeners(html: JQuery) {
    super.activateListeners(html);
    const data = this.data.templateData;

    const limitBaseInput = html.find<HTMLInputElement>('input[name="limit.base"]');
    const LimitNameInput = html.find<HTMLSelectElement>('select[name="limit.name"]');

    limitBaseInput.on('input', () => {
      const val = limitBaseInput.val() as string;
      LimitNameInput.prop('disabled', val.trim() !== '');
    });

    limitBaseInput.on('blur', () => {
      const val = limitBaseInput.val() as string;
      const limit = Number.parseInt(val, 10);
      if (!val || isNaN(limit) || limit < 1) {
        limitBaseInput.val("");
        LimitNameInput.prop('disabled', false);
        // Zugriff auf deine data
        if (data.limit) data.limit.base = undefined;
      } else {
        if (data.limit) data.limit.base = limit;
      }
    });

    limitBaseInput.trigger('input');
    LimitNameInput.trigger('change');
  }


  override get title(): string {
    return "Teamwork";
  }

  override get buttons() {
    return {
      roll: { label: game.i18n.localize('SR5.Roll'), icon: '<i class="fas fa-dice-six"></i>' },
      cancel: { label: game.i18n.localize('SR5.Dialogs.Common.Cancel') }
    };
  }

  /**
 * Processes the dialog result after it closes, returning the selected configuration
 * or `undefined` if the user cancelled or required fields are missing.
 *
 * @param html The jQuery-wrapped HTML element of the dialog (not used for data retrieval).
 * @returns An object with the finalized selections:
 *   - `actor`: the chosen {@link SR5Actor}
 *   - `skill`: the chosen {@link SkillEntry}
 *   - `attribute`: the chosen {@link AttributeEntry}
 *   - `limit?`: optional {@link LimitEntry} override
 *   - `threshold`: numeric threshold value
 *   - `allowOtherSkills`: whether alternate skills are permitted
 *   - `specialization`: whether specialization was toggled
 *   or `undefined` if cancelled or missing required fields.
 */
  override onAfterClose(html: JQuery<HTMLElement>): {
    actor: SR5Actor,
    skill: SkillEntry,
    attribute: AttributeEntry,
    limit?: LimitEntry,
    threshold: number,
    allowOtherSkills: boolean,
    specialization: boolean
  } | undefined {

    if (this.selectedButton === "cancel") {
      return this._emptySelection() as any;
    }

    const {
      actor,
      skill,
      attribute,
      limit,
      threshold,
      allowOtherSkills,
      specialization
    } = this.data.templateData;

    if (!actor || !skill || !attribute) return this._emptySelection() as any;

    console.log("onAfterClose: ", {
      actor: actor,
      skill: skill,
      attribute: attribute,
      limit: limit,
      threshold: threshold ?? 0,
      allowOtherSkills: allowOtherSkills ?? false,
      specialization: specialization ?? false
    })


    return {
      actor: actor,
      skill: skill,
      attribute: attribute,
      limit: limit,
      threshold: threshold ?? 0,
      allowOtherSkills: allowOtherSkills ?? false,
      specialization: specialization ?? false
    };
  }

  override _emptySelection(): object {
    return { cancelled: true };
  }

  /**
 * Handles updates to form inputs, synchronizing changes in `templateData` and
 * re-rendering the dialog for dynamic fields (actor, filter, skill, attribute, limit, and toggles).
 *
 * This override:
 *  - Updates actor selection: rebuilds skill groups and resets filters.
 *  - Applies live filtering of the actor list based on the search term.
 *  - Responds to skill changes by updating the associated attribute and limit.
 *  - Updates attribute and limit selections from their respective inputs.
 *  - Toggles `specialization` and `allowOtherSkills` flags.
 *  - Delegates to the base handler for unrecognized fields.
 *
 * @param event The input event triggered on a form field change.
 * @returns A Promise that resolves once any necessary re-render has completed.
 */
  override async _onChangeInput(event: any): Promise<void> {
    const el = event.target as HTMLInputElement;
    const name = el.name;
    const data = this.data.templateData;

    switch (name) {
      case 'actor':
        const uuid = el.value;

        const actor = this.baseActors.find(a => a.uuid === uuid);
        if (!actor) return;
        data.actor = actor;

        this.baseSkills = TeamworkFlow.buildSkillGroups(actor);
        data.skills = this.baseSkills;

        data.filter = '';
        data.actors = this.baseActors;

        await this.render();
        return;

      case 'filter':
        data.filter = el.value;

        const term = data.filter.trim().toLowerCase();
        const filtered = this.baseActors.filter(a => (a.name ?? '').toLowerCase().includes(term));

        if (!filtered.some(a => a.uuid === data.actor.uuid)) {
          filtered.unshift(data.actor);
        }
        data.actors = filtered;
        await this.render();
        return

      case 'skill':
        const skillId = el.value;
        const newSkill: SkillEntry = this.baseSkills
          .flatMap(g => g.skills)
          .find(s => s.id === skillId)!;
          
        data.skill = newSkill;
        data.attribute = { name: newSkill.attribute, label: SR5.attributes[newSkill.attribute] };
        if (data.limit) data.limit.name = newSkill.limit;
        if (data.limit) data.limit.label = SR5.limits[newSkill.limit];

        await this.render();
        return;

      case 'attribute':
        const attributeKey = el.value;
        const attributes = TeamworkFlow.buildAttributeList(this.data.templateData.actor);
        const attribute = attributes.find(a => a.name === attributeKey)
          ?? attributes.find(a => a.label === attributeKey);
        if (attribute) {
          data.attribute = attribute;
        }
        return;

      case 'limit.name':
        console.log("[onChangeInput] limit.name changed:", el.value);
        const limitKey = el.value;
        const limits = TeamworkFlow.limitList;
        const limit = limits.find(a => a.name === limitKey)
          ?? limits.find(a => a.label === limitKey);
        console.log("[onChangeInput] found limit:", limit);
        if (limit) {
          data.limit = limit;
        }
        return;

      case "specialization":
        data.specialization = el.checked;
        return;

      case "allowOtherSkills":
        data.allowOtherSkills = el.checked;
        return;

      case 'limit.base':
        return;

      default:
        break;
    }

    await super._onChangeInput(event as any);
  }
}
