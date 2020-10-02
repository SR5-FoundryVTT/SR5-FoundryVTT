import { HandlebarManager } from './handlebars/HandlebarManager';
import {HooksManager} from "./hooks";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */


HooksManager.registerHooks();
HandlebarManager.registerHelpers();