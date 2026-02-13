import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { GameStateDO } from './GameStateDO';

const app = new Hono();

app.use('/*', cors({ origin: 'https://77a8a0a5.cf-ai-navi-guide.pages.dev' }));

app.post('/chat', async (c) => {
    try {
        const { messages, sessionId } = await c.req.json();
        const userSessionId = sessionId || "default";

        // SECURITY NOTE: In a real production app, use signed cookies or tokens for session management.
        // Client-generated IDs are used here for simplicity in this demo.

        if (!messages || !Array.isArray(messages)) {
            return c.json({ error: "Invalid messages format" }, 400);
        }

        // Heuristic Check: "I just got the Master Sword"
        const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";

        if (lastMessage.includes("got the master sword") || lastMessage.includes("pulled the master sword")) {
            const id = c.env.GAME_STATE.idFromName(userSessionId);
            const stub = c.env.GAME_STATE.get(id);
            const currentState = await (await stub.fetch("http://do/state")).json();
            if (currentState.age === "child") {
                await stub.fetch("http://do/state", {
                    method: "POST",
                    body: JSON.stringify({ age: "adult", inventory: [...currentState.inventory, "Master Sword"] })
                });
            }
        }

        // Heuristic Check: Location updates
        // Map Location -> [Prereq Locations]
        const LOCATION_PATHS = {
            "forest temple": ["kokiri forest", "lost woods", "sacred forest meadow", "forest temple"],
            "lost woods": ["kokiri forest", "lost woods"],
            "sacred forest meadow": ["kokiri forest", "lost woods", "sacred forest meadow"],
            "hyrule field": ["kokiri forest", "hyrule field"],
            "market": ["kokiri forest", "hyrule field", "market"],
            "hyrule castle": ["kokiri forest", "hyrule field", "market", "hyrule castle"],
            "castle courtyard": ["kokiri forest", "hyrule field", "market", "hyrule castle", "castle courtyard"],
            "temple of time": ["kokiri forest", "hyrule field", "market", "temple of time"],
            "lon lon ranch": ["kokiri forest", "hyrule field", "lon lon ranch"],
            "kakariko": ["kokiri forest", "hyrule field", "kakariko village"],
            "kakariko village": ["kokiri forest", "hyrule field", "kakariko village"],
            "graveyard": ["kokiri forest", "hyrule field", "kakariko village", "graveyard"],
            "death mountain": ["kokiri forest", "hyrule field", "kakariko village", "death mountain trail"],
            "death mountain trail": ["kokiri forest", "hyrule field", "kakariko village", "death mountain trail"],
            "goron city": ["kokiri forest", "hyrule field", "kakariko village", "death mountain trail", "goron city"],
            "dodongo's cavern": ["kokiri forest", "hyrule field", "kakariko village", "death mountain trail", "dodongo's cavern"],
            "death mountain crater": ["kokiri forest", "hyrule field", "kakariko village", "death mountain trail", "death mountain crater"],
            "fire temple": ["kokiri forest", "hyrule field", "kakariko village", "death mountain trail", "death mountain crater", "fire temple"],
            "zora's river": ["kokiri forest", "hyrule field", "zora's river"],
            "zora's domain": ["kokiri forest", "hyrule field", "zora's river", "zora's domain"],
            "zora's fountain": ["kokiri forest", "hyrule field", "zora's river", "zora's domain", "zora's fountain"],
            "jabu-jabu": ["kokiri forest", "hyrule field", "zora's river", "zora's domain", "zora's fountain", "jabu-jabu's belly"],
            "jabu-jabu's belly": ["kokiri forest", "hyrule field", "zora's river", "zora's domain", "zora's fountain", "jabu-jabu's belly"],
            "lake hylia": ["kokiri forest", "hyrule field", "lake hylia"],
            "water temple": ["kokiri forest", "hyrule field", "lake hylia", "water temple"],
            "gerudo valley": ["kokiri forest", "hyrule field", "gerudo valley"],
            "gerudo's fortress": ["kokiri forest", "hyrule field", "gerudo valley", "gerudo's fortress"],
            "haunted wasteland": ["kokiri forest", "hyrule field", "gerudo valley", "gerudo's fortress", "haunted wasteland"],
            "spirit temple": ["kokiri forest", "hyrule field", "gerudo valley", "gerudo's fortress", "haunted wasteland", "desert colossus", "spirit temple"]
        };

        // Simple Title Case helper
        const toTitleCase = (str) => str.replace(/\b\w/g, s => s.toUpperCase()).replace("Of", "of").replace("The", "the"); // Basic

        // Check if user mentioned a location (Longest string first to match specific locations)
        const sortedLocations = Object.entries(LOCATION_PATHS).sort((a, b) => b[0].length - a[0].length);

        for (const [loc, path] of sortedLocations) {
            if (lastMessage.includes(loc)) {
                const id = c.env.GAME_STATE.idFromName(userSessionId);
                const stub = c.env.GAME_STATE.get(id);

                // Format path to Title Case for UI
                const properPath = path.map(p => {
                    if (p === "jabu-jabu's belly") return "Jabu-Jabu's Belly";
                    if (p === "zora's domain") return "Zora's Domain";
                    if (p === "zora's river") return "Zora's River";
                    if (p === "zora's fountain") return "Zora's Fountain";
                    if (p === "dodongo's cavern") return "Dodongo's Cavern";
                    if (p === "gerudo's fortress") return "Gerudo's Fortress";
                    if (p === "lon lon ranch") return "Lon Lon Ranch";
                    if (p === "forest temple") return "Forest Temple";
                    if (p === "fire temple") return "Fire Temple";
                    if (p === "water temple") return "Water Temple";
                    if (p === "spirit temple") return "Spirit Temple";
                    if (p === "shadow temple") return "Shadow Temple";
                    if (p === "temple of time") return "Temple of Time";
                    return toTitleCase(p);
                });

                await stub.fetch("http://do/state", {
                    method: "POST",
                    body: JSON.stringify({
                        current_dungeon: properPath[properPath.length - 1]
                    })
                });
                break; // Found a match, stop
            }
        }

        const id = c.env.GAME_STATE.idFromName(userSessionId);
        const stub = c.env.GAME_STATE.get(id);

        // Get context
        const stateRes = await stub.fetch("http://do/context");
        const state = await stateRes.json();

        // Infer Game Progress for AI Context
        let inferredHistory = [];
        if (state.age === "adult") {
            inferredHistory.push("Completed Child Dungeons (Deku Tree, Dodongo's Cavern, Jabu-Jabu)");
            inferredHistory.push("Has Ocarina of Time");
            inferredHistory.push("Has Master Sword");
        }
        if (state.inventory.includes("Bow")) inferredHistory.push("Completed Forest Temple");
        if (state.inventory.includes("Megaton Hammer")) inferredHistory.push("Completed Fire Temple");
        if (state.inventory.includes("Longshot")) inferredHistory.push("Completed Water Temple");
        if (state.inventory.includes("Hover Boots")) inferredHistory.push("Completed Shadow Temple");
        if (state.inventory.includes("Silver Gauntlets")) inferredHistory.push("Completed Spirit Temple (Child Half)");
        if (state.inventory.includes("Mirror Shield")) inferredHistory.push("Completed Spirit Temple");

        const systemPrompt = `You are Navi, the fairy guide from Ocarina of Time. 
    Your goal is to give hints without spoiling the game or suggesting impossible actions.
    
    TONE:
    - High-pitched, annoying but helpful.
    - Start sentences with "Hey!", "Listen!", "Watch out!".
    - Be brief.
    
    CURRENT STATE:
    - Link's Age: ${state.age}
    - Inventory: ${JSON.stringify(state.inventory)}
    - Current Location: ${state.current_dungeon}
    - Medallions: ${JSON.stringify(state.medallions)}
    - Implied Progress: ${inferredHistory.join("; ")}
    
    RULES:
    1. Prefer suggesting items in the inventory, but if a new item is required, hint at where to find it (e.g., "Have you checked the chest in the big room?").
    2. If Age is "child", DO NOT mention adult-only items (Hookshot, Bow, Hammer, Mirror Shield) unless the user specifically asks how to get them (then say "You need to be older!").
    3. If Age is "adult", DO NOT suggest child-only paths.
    4. If the user asks about a puzzle they lack the item for, say "You might need something else first..." or "Look around for a new item!".
    5. Give helpful nudges. You CAN give the solution if the user seems very stuck, but try to be vague first.
    6. Be high-energy!
    
    Example:
    User: "How do I cross the gap in Water Temple?"
    State: Inventory implies NO Longshot.
    Navi: "Hey! That gap looks too wide for just a jump! Maybe you need a new item to reach across?" (Do not say "use the Longshot").
    `;

        const response = await c.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
            messages: [
                { role: "system", content: systemPrompt },
                ...messages
            ]
        });

        return c.json(response);
    } catch (e) {
        return c.json({ error: e.message }, 500);
    }
});

// Proxy state requests to the Durable Object
app.all('/state', async (c) => {
    const sessionId = c.req.header('X-Session-ID') || "default";
    const id = c.env.GAME_STATE.idFromName(sessionId);
    const stub = c.env.GAME_STATE.get(id);
    return stub.fetch(c.req.raw);
});

export default {
    fetch: app.fetch,
};

export { GameStateDO };
