import { DurableObject } from "cloudflare:workers";

export class GameStateDO extends DurableObject {
    constructor(ctx, env) {
        super(ctx, env);
        this.state = ctx.storage;
        // Default state
        this.defaultState = {
            age: "child",
            current_dungeon: "Kokiri Forest",
            inventory: ["Kokiri Sword"],
            medallions: []
        };
    }

    async fetch(request) {
        const url = new URL(request.url);

        // Get or Update State
        if (url.pathname === "/state") {
            if (request.method === "GET") {
                let state = await this.state.get("game_state") || this.defaultState;
                return new Response(JSON.stringify(state), { headers: { "Content-Type": "application/json" } });
            } else if (request.method === "POST") {
                const body = await request.json();
                let currentState = await this.state.get("game_state") || this.defaultState;

                // Merge updates
                const newState = { ...currentState, ...body };

                await this.state.put("game_state", newState);
                return new Response(JSON.stringify(newState), { headers: { "Content-Type": "application/json" } });
            }
        }

        // Internal endpoint for Worker to get context
        if (url.pathname === "/context") {
            let state = await this.state.get("game_state") || this.defaultState;
            return new Response(JSON.stringify(state), { headers: { "Content-Type": "application/json" } });
        }

        return new Response("Not Found", { status: 404 });
    }
}
