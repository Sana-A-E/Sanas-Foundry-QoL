import { registerCustomEnrichers } from './enrichers.js';
import { registerSettings, moduleName } from './settings.js';
import { registerRandomChoices } from './inlineRandomChoices.js';

Hooks.once('init', () => {
	registerSettings();
    registerCustomEnrichers();
	registerRandomChoices();
});
