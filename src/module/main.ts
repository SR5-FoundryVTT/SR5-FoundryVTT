import { EditorManager } from './apps/editor/EditorManager';
import { HandlebarManager } from './handlebars/HandlebarManager';
import {HooksManager} from "./hooks";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */


HooksManager.registerHooks();
HandlebarManager.registerHelpers();
EditorManager.registerMenuItems();