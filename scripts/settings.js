export const moduleName = 'Sanas-Foundry-QoL';

export function registerSettings() {
	// Register the setting for Party Mappings
	// Used with html enrichers
    // Format: {"John": "Actor.uuid123", "Jane": "Actor.uuid456"}
    game.settings.register(moduleName, "partyMappings", {
        name: "Party Actor Mappings",
        hint: "A JSON object mapping names to Actor UUIDs. Example: {\"John\": \"Actor.v3p9Xj48Z123\", \"Jane\": \"Actor.w9L2kP11X456\"}",
        scope: "world",
        config: true,
        type: String,
        default: '{}',
        onChange: () => window.location.reload() // Reload to apply changes to text
    });
}