![](https://img.shields.io/badge/Foundry-v12-green)
<!--- Downloads @ Latest Badge -->
<!--- replace <user>/<repo> with your username/repository -->
<!--- ![Latest Release Download Count](https://img.shields.io/github/downloads/<user>/<repo>/latest/module.zip) -->

<!--- Forge Bazaar Install % Badge -->
<!--- replace <your-module-name> with the `name` in your manifest -->
<!--- ![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2F<your-module-name>&colorB=4aa94a) -->

# Sana's Quality of Life Improvements for Foundry VTT
A FoundryVTT module for DnD5e adding various new functionalities and improvments to Foundry. Tested to work on Foundry v12. Might work on higher versions too but hasn't been tested.
Currently you can't turn on or off features if you just want some features but not the others, but I might add this option in the future.

* [Dynamic Actor Enrichers](#📝-dynamic-actor-enrichers-(dnd5e))


## Changelog
* Added Dynamic Actor Enrichers for DnD5e

---
  
## 📝 Dynamic Actor Enrichers (DnD5e)

Stop manually updating your journal entries every time the party levels up or the Paladin finds a new suit of plate armor. This module adds custom **Text Enrichers** to Foundry VTT, allowing you to pull live data from any Actor directly into your journals, item descriptions, and chat messages. The numbers work inside inline rolls as well, so feel free to use them.

---

### ✨ Features

* **Live Data:** Automatically updates when an Actor's sheet changes.
* **Native Look:** Elements are styled to match Foundry's inline rolls (orange, bold, and interactive).
* **Flexible Lookup:** Reference actors by a custom **Alias**, their **UUID**, or simply their **Name**.
* **Smart Leveling:** `@Level` automatically calculates total character level for multiclassed PCs.
* **Inline Roll Integration:** Use your custom tags inside math formulas! `[[d20 + @StrMod[Jack]]]`

---

### 🚀 How to Use: The Enrichers

The syntax follows a simple pattern: `@Tag[Identifier]`. 

The `Identifier` can be a name you've set in your **Party Mappings**, a standard **Actor Name**, or a **UUID** (e.g., `Actor.abc123xyz`).

#### Available Tags

| Category | Tags | Output Example |
| :--- | :--- | :--- |
| **Attributes** | `@Level`, `@AC`, `@MaxHP`, `@Prof` | `12`, `18`, `95`, `+4` |
| **Ability Scores** | `@Str`, `@Dex`, `@Con`, `@Int`, `@Wis`, `@Cha` | `16`, `14`, `10` ... |
| **Ability Mods** | `@StrMod`, `@DexMod`, `@ConMod`, etc. | `+3`, `+2`, `+0` ... |
| **Skills** | `@Arcana`, `@Athletics`, `@Stealth`, etc. | `+7`, `+2`, `+5` ... |

> **Note:** All 18 DnD5e skills are supported using their full names (e.g., `@SleightOfHand[John]`).

#### Usage Examples
* "The party level is currently **@Level[John]**." ⮕ *The party level is currently **12**.*
* "Ok, here is my Arcana check: [[d20 **@Arcana[Jane]**]]" ⮕ *Ok, here is my Arcana check: **21***
* "The trap deals damage equal to 20% of your max health, Jack. That is [[0.2 * **@MaxHP[Actor.v3p9Xj48Z123]**]]." ⮕ *The trap deals damage equal to 20% of your max health, Jack. That is **12**.*

#### 🎲 Inline Roll Support

You can use these tags directly inside Foundry's native inline roll syntax `[[ ]]`. The module will automatically swap the tag for the correct numerical value before the dice are rolled.

**Examples:**
* `[[d20 + @StrMod[John]]]` ⮕ Foundry rolls: `d20 + 3`
* `[[@Level[Jane]d6 + @IntMod[Jane]]]` ⮕ Foundry rolls: `12d6 + 5`
* `The trap deals [[@Level[John] + @Prof[John]]] damage.`

> **Note:** Once a roll is sent to chat, the value is "locked in." If the actor's stats change later, you must re-roll to see the updated bonus in the chat.
---

### ⚙️ Configuration

#### Party Mappings (Aliases)
Instead of copy-pasting long UUIDs every time, you can define short-hand "Aliases" in the module settings.

1.  Go to **Configure Settings** > **Dynamic Actor Enrichers**.
2.  In the **Party Actor Mappings** field, enter a JSON object mapping your alias to an Actor's ID or UUID.

**Example Setting Value:**
```json
{
  "John": "Actor.v3p9Xj48Z123",
  "Jane": "Actor.w9L2kP11X456",
  "Tank": "Actor.v3p9Xj48Z123"
}
```

---

### 💡 Usage ideas

**Useful macros:** E.g. the party's member with the highest Survival is always the one looking for the shelter for the night. So I can prepare a macro using his Survival mod saying something like "Jack is looking for shelter (DC 10): [[d20 + @Survival[Jack]]]. 10- He finds a windbreaker, 15- he finds a cave, 20- wow, you accidentally stumble upon a dry and cozy ancient ruin!"

**Dynamic Party Overview Journal Entries:** I am also using it to set up a journal that dynamically populates character's current level and stats, which I use as context to send to Gemini using my [SmartChatAI_Gemini module](https://github.com/Sana-A-E/foundryvtt_SmartChatAI_Gemini), so that I can ask Gemini within Foundry questions like: 
  * "Quick! Come up with a medium difficulty encounter for my party"
  * "Quick! Come up with an Arcana puzzle the party should be able to solve."
  * "I knew I shouldn't have let them roll for stats in character creation... 🤦‍♀️ Help me calculate their current effective level so I can adjust the combat difficulty."
  * "Andrew wants to loot everything again... come up with some common stuff appropriate for his level."
