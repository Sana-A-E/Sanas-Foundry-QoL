export function registerRandomChoices() {
    
    /**
     * A custom parser that safely extracts @Pick options, 
     * perfectly respecting nested brackets like @UUID[Actor.123].
     */
    const processPicks = (text, defaultSeparator = ', ') => {
        if (!text.includes('@Pick')) return text;
        
        let out = "";
        let i = 0;
        
        while (i < text.length) {
            let idx = text.indexOf("@Pick", i);
            if (idx === -1) {
                out += text.slice(i);
                break;
            }
            out += text.slice(i, idx);
            i = idx;
            
            // 1. Read the Count (e.g., the '2' in @Pick2)
            let j = idx + 5; // Length of "@Pick"
            let countStr = "";
            while (j < text.length && /[0-9]/.test(text[j])) {
                countStr += text[j];
                j++;
            }
            let count = countStr ? parseInt(countStr) : 1;
            
            if (text[j] !== '[') {
                // False alarm (e.g., someone just typed "@Pick" without brackets)
                out += "@Pick" + countStr;
                i = j;
                continue;
            }
            j++; // Skip the '['
            
            // 2. Read Options, counting nested brackets to stay safe
            let bracketDepth = 1;
            let optionsStr = "";
            while (j < text.length && bracketDepth > 0) {
                if (text[j] === '[') bracketDepth++;
                if (text[j] === ']') bracketDepth--;
                if (bracketDepth > 0) optionsStr += text[j];
                j++;
            }
            
            // 3. Read Optional Separator in { }
            let sep = defaultSeparator;
            if (j < text.length && text[j] === '{') {
                j++; // Skip '{'
                let sepStr = "";
                let braceDepth = 1;
                while (j < text.length && braceDepth > 0) {
                    if (text[j] === '{') braceDepth++;
                    if (text[j] === '}') braceDepth--;
                    if (braceDepth > 0) sepStr += text[j];
                    j++;
                }
                sep = sepStr;
            }
            
            // 4. Process the choices and pick randomly (without replacement)
            const choices = optionsStr.split('|');
            const selected = [];
            const numToPick = Math.min(count, choices.length);
            
            for (let k = 0; k < numToPick; k++) {
                const randomIdx = Math.floor(Math.random() * choices.length);
                selected.push(choices.splice(randomIdx, 1)[0]); // Removes and returns the pick
            }
            
            out += selected.join(sep);
            i = j;
        }
        return out;
    };

    // --- 1. INTERCEPT TEXT EDITOR (Journals, Chat Cards, etc.) ---
    const originalEnrichHTML = TextEditor.enrichHTML;
    TextEditor.enrichHTML = function(content, options) {
        if (typeof content === "string") {
            // Default separator is a comma and a space
            content = processPicks(content, ', '); 
        }
        return originalEnrichHTML.call(this, content, options);
    };

    // --- 2. INTERCEPT ROLL ENGINE (So @Pick works inside [[ ]] formulas) ---
    const originalReplaceFormulaData = Roll.replaceFormulaData;
    Roll.replaceFormulaData = function(formula, data, options) {
        if (typeof formula === "string") {
            // Default separator for rolls is ' + ' (e.g., rolling 2 random dice types)
            formula = processPicks(formula, ' + ');
        }
        return originalReplaceFormulaData.call(this, formula, data, options);
    };
}
