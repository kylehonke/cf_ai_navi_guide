# Navi AI

Navi is a serverless, context-aware AI companion for *The Legend of Zelda: Ocarina of Time*. Unlike generic chatbots, this "Navi" is constrained by your current game state, ensuring she never suggests items or locations you can't access yet.

<h3 align="center">Try it out: <a href="https://cf-ai-navi-guide.pages.dev">navi-ai</a></h3>

---

## Why?

Inspiration for this project comes from my own experience 100%ing, speedrunning and doing challenge runs in the game. Ocarina of Time is a few years old (lol) so when I began my emulation journey, I sought the help of numerous LLMs to refresh my memory. After having to type 'no spoilers' 50 times only to recieve hallucinations that don't even make sense in-game, I thought "Why not build a Navi that actually understands the game state and can provide context-aware hints?" I learned to build this entire architecture in three nights using Cloudflare documentation, tutorials on the Cloudflare website, some generative AI and **a lot** of trial and error. The result is an AI companion that can provide genuinely helpful hints without spoiling the fun of (re)discovery. I hope you enjoy!

---

## 🏗️ Architecture & Tech Stack

This project leverages the **Cloudflare Developer Platform** for a low-latency, serverless architecture.

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React + Vite + Tailwind CSS | Interactive retro themed UI for managing state and chatting |
| **Backend** | Cloudflare Workers (Hono) | API routing & orchestration |
| **AI Model** | Workers AI (Llama 3) | Acts as Navi, providing vague hints |
| **State** | Durable Objects | Persistent, consistent storage for game state (Inventory/Age) |

### Workflow
1.  **User Input**: Player asks "How do I clear the Water Temple?" via Frontend UI.
2.  **Context Injection**: The Worker fetches the player's session from the Durable Object.
3.  **Prompt Engineering**: The Worker combines the user's question + current state + System Persona.
4.  **Inference**: Workers AI generates a response based *strictly* on that constrained context.
5.  **Response**: Navi replies "Hey! Listen! Have you checked the central pillar?" (Avoiding spoilers like "Use the Longshot" if the player doesn't have it).

---

## 🎮 User Interface & Functionality

The UI is designed to inform the AI without forcing the user to type every detail.

![UI Screenshot Placeholder 1]
*(Caption: The Quest Status sidebar allowing quick toggles for Age and Inventory items.)*

### How UI Elements Inform the AI
*   **Age Toggles (Child/Adult)**:
    *   *Child*: AI locks out Adult topics (ie Spirit Temple, Ganon).
    *   *Adult*: AI assumes Child progression is complete.
*   **Inventory Grid**:
    *   Toggling **"Bow"** tells the AI: "Player has cleared Forest Temple."
    *   Missing **"Bombs"** tells the AI: "Suggest finding the Bomb Bag before trying to open that wall."
*   **Chat**: The chat is context-aware. If you say "I'm in the Forest Temple," the AI updates its internal context to focus hints on that specific dungeon.

![UI Screenshot Placeholder 2]
*(Caption: The Chat Interface where Navi provides vague, helpful nudges.)*

---

## 🛠️ Setup & Usage

### Prerequisites
*   Node.js & npm
*   Cloudflare Account
*   Wrangler CLI (`npm install -g wrangler`)

### Installation
1.  **Clone & Install**:
    ```sh
    npm install         # Install backend deps
    cd frontend
    npm install         # Install frontend deps
    ```
2.  **Run Locally**:
    ```sh
    # Terminal 1: Backend
    npx wrangler dev
    
    # Terminal 2: Frontend
    cd frontend
    npm run dev
    ```

### Deployment
1.  **Backend**: `npx wrangler deploy`
2.  **Frontend**: `cd frontend && npm run build && npx wrangler pages deploy dist`

---

## 🔐 Security & Design Decisions

### Why Serverless?
*   **Cost**: Workers AI is extremely cheap for hobbyist use compared to running a dedicated GPU instance.
*   **Speed**: Global edge network ensures Navi responds instantly.

### Security Measures
*   **Input Validation**: Strict limits on message length (1000 chars) and history size (50 msgs) to prevent Prompt Injection or DoS attacks.
*   **Session Isolation**: Each user gets a unique Session ID, ensuring one player's inventory doesn't leak into another's.
*   **CORS**: Configured to prevent unauthorized cross-origin use in production.

