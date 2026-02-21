import { moduleName } from './settings.js';

export function registerCustomEnrichers() {
    
    // 1. Mapping for all DnD5e Skills
    const SKILL_MAP = {
        "acrobatics": "acr", "animalhandling": "ani", "arcana": "arc", "athletics": "ath", 
        "deception": "dec", "history": "his", "insight": "ins", "intimidation": "itm", 
        "investigation": "inv", "medicine": "med", "nature": "nat", "perception": "prc", 
        "performance": "prf", "persuasion": "per", "religion": "rel", "sleightofhand": "slt", 
        "stealth": "ste", "survival": "sur"
    };

    const resolveActor = (identifier) => {
        // Fetch mappings from settings
        let mappings = {};
        try {
            mappings = JSON.parse(game.settings.get(moduleName, "partyMappings"));
        } catch (e) { console.error(`${moduleName} | Failed to parse partyMappings`, e); }

        const target = mappings[identifier] || identifier;
        return fromUuidSync(target) || game.actors.getName(target);
    };

    /**
     * Centralized logic to grab the actual data point
     */
    const getActorValue = (actor, tag) => {
        const sys = actor.system;
        const type = tag.toLowerCase();
		// Modifiers
        if (type.endsWith("mod")) {
            const abl = type.replace("mod", "");
            return sys.abilities[abl]?.mod ?? 0;
        } 
		// Base Stats
        if (["str", "dex", "con", "int", "wis", "cha"].includes(type)) {
            return sys.abilities[type]?.value ?? 0;
        }
		// Skills
        if (SKILL_MAP[type]) {
            return sys.skills[SKILL_MAP[type]]?.total ?? 0;
        }
		// Specific Attributes
        switch (type) {
            case "level":  return sys.details.level;
            case "prof":   return sys.attributes.prof;
            case "ac":     return sys.attributes.ac.value;
            case "maxhp":  return sys.attributes.hp.max;
            default:       return null;
        }
    };

    // --- 1. THE DEEP ROLL INTERCEPTOR (The Fix!) ---
    // This intercepts the formula string immediately before Foundry calculates the math.
    const originalReplaceFormulaData = Roll.replaceFormulaData;
    Roll.replaceFormulaData = function(formula, data, options) {
        if (typeof formula === "string") {
            formula = formula.replace(/@([A-Za-z]+)\[([^\]]+)\]/g, (match, tag, id) => {
                const actor = resolveActor(id);
                if (!actor) return match; // If actor isn't found, leave it alone
                
                const value = getActorValue(actor, tag);
                return value !== null ? value : match; // Swap the tag for the raw number
            });
        }
        // Hand the clean, raw-number formula back to the normal Dice engine
        return originalReplaceFormulaData.call(this, formula, data, options);
    };

    // --- 2. THE VISUAL ENRICHER ---
	// handles making standalone tags look pretty in journals
    CONFIG.TextEditor.enrichers.push({
        pattern: /@([A-Za-z]+)\[([^\]]+)\]/g,
        enricher: async (match) => { 
            const [fullMatch, tag, id] = match;
            
            const actor = resolveActor(id);
            if (!actor) return null;

            const value = getActorValue(actor, tag);
            if (value === null) return null;

            const displayValue = (tag.toLowerCase().endsWith("mod") || SKILL_MAP[tag.toLowerCase()] || tag.toLowerCase() === "prof") 
                ? (value >= 0 ? `+${value}` : value) 
                : value;

            const span = document.createElement("span");
            span.classList.add("inline-roll", "dnd5e", "recharge");
            span.innerHTML = `<i class="fas fa-user-circle"></i> ${displayValue}`;
            span.title = `${actor.name} | ${tag}`;
            return span;
        }
    });

	// --- 3. INLINE ROLL COLOR HIGHLIGHTING (Crits & Fumbles) ---
    // Intercept the creation of the inline roll button and color natural 1's red and natural 20's green
    const originalToAnchor = Roll.prototype.toAnchor;
    Roll.prototype.toAnchor = async function(...args) {
        // Build the native anchor element first
        const anchor = await originalToAnchor.apply(this, args);
        
        // If the roll hasn't been evaluated yet, just return it
        if (!this._evaluated) return anchor;

        // Look for a d20/d100/d1000 in the roll's dice terms
        const d20 = this.dice.find(d => d.faces === 20 || d.faces === 100 || d.faces === 1000);
        if (d20) {
            // Find the active result (this ignores dropped dice from advantage/disadvantage)
            const activeRoll = d20.results.find(r => r.active);
            
            if (activeRoll) {
                if (activeRoll.result === 20 || activeRoll.result === 100 || activeRoll.result === 1000) {
                    // Natural 20 - Green theme
                    anchor.style.color = "#18520b";
                    anchor.style.fontWeight = "bold";
                } else if (activeRoll.result === 1) {
                    // Natural 1 - Red theme
                    anchor.style.color = "#aa0200";
                    anchor.style.fontWeight = "bold";
                }
            }
        }
        
        return anchor;
    };
}
