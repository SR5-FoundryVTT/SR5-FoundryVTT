import { HandlebarManager } from './handlebars/HandlebarManager';
import {HooksManager} from "./hooks";
import '../css/bundle.scss';

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */


HooksManager.registerHooks();
HandlebarManager.registerHelpers();