# AI Prompts Used

This file lists prompts used for AI-assisted planning and coding.

---

## Google Gemini

"Help me plan an AI-powered application using Cloudflare Workers, Durable Objects, and Workers AI that includes an LLM, workflow/coordination, chat input, and memory/state."

## Google Antigravity

"I am building a Cloudflare-based 'Spoiler-Free Hint Guide' for Ocarina of Time. The goal is to use Llama 3 on Workers AI to act as 'Navi,' but I need to prevent it from hallucinating items the player doesn't have yet.
I plan to use Durable Objects to store the user's current session state (Child/Adult, Inventory, Dungeons). Can you help me scaffold a Hono-based Cloudflare Worker where the Durable Object state is injected into the LLM's system prompt? The frontend will be React/Vite."

## Cloudflare

In order to better familiarize myself with the services provided by Cloudflare, I used the following prompts on the site's built-in AI assistant:

- How do I ensure Workers AI functionality is enabled? Is it enabled by default for free plan users?
- Explain how to create a Workers AI binding using a Wrangler config file.
- What is my workers URL, and how do I find it?
- Explain CORS, how to implement it, and any potential security risks of an open configuration.