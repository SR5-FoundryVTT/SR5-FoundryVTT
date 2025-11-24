import { HandlebarManager } from './handlebars/HandlebarManager';
import {HooksManager} from "./hooks";
import '../css/bundle.scss';

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */


HandlebarManager.registerHelpers();
HooksManager.registerHooks();
