import '../css/bundle.scss';
import { HandlebarManager } from './handlebars/HandlebarManager';
import { HooksManager } from './hooks';

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

HandlebarManager.registerHelpers();
await HooksManager.registerHooks();
