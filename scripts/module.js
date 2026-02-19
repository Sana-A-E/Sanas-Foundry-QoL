import { registerCustomEnrichers } from './enrichers.js';
import { registerSettings, moduleName } from './settings.js';

Hooks.once('init', () => {
	registerSettings();
    registerCustomEnrichers();
});
