# 🏆 FitForge Arena: The Future of Competitive Fitness

FitForge Arena is a cutting-edge, AI-powered competitive calisthenics platform designed for athletes who want to test their limits against global rivals. Built with advanced computer vision and large language models, it turns every repetition into a data-driven battle for dominance.

## 🎯 The Vision: AI Fitness Challenge Arena

FitForge Arena redefines the workout experience by pitting two athletes against each other in real-time, no-equipment bodyweight duels.

**Format:** Best-of-three rounds of pure intensity.

**AI Judging:** No more "half-reps". Our Computer Vision engine ensures that every rep follows perfect form, or it simply doesn't count.

**The Strategy:** It's not just about strength; it's about intelligence. The loser of each round gains the tactical advantage, choosing the next exercise to exploit their opponent's weaknesses based on real-time AI analytics.

## 🤖 AI Integration: The Judge, Coach, and Narrator

The application's unique features are driven by two distinct AI technologies working in concert:

### 1. The Computer Vision (CV) Judge (Objective Accuracy)

The player's own device (webcam or phone camera) acts as the unbiased official, ensuring fairness and accuracy.

- **Rep and Form Validation:** The CV engine (TensorFlow.js/MediaPipe) analyzes the player's movements in real-time. It only counts a repetition if the body hits the exact angles and depths required for perfect form (e.g., chest within one inch of the floor for a push-up).

- **Real-Time Feedback:** Players receive instant visual or audio cues (e.g., "Deeper!", "Perfect Rep") if their form falters.

### 2. The LLM Strategist (The Brain)

Powered by the Python backend (FastAPI + OpenRouter), the Large Language Model manages the strategy and experience.

- **Strategy Advisor:** After a round loss, the LLM analyzes the player's strengths/weaknesses and the opponent's performance history. It recommends the most advantageous counter-exercise for the loser to pick to maximize their chances of winning the next round.

- **Form Referee:** Before each round begins, the LLM generates the strict, official form rules for the chosen exercise, which are then enforced by the CV Judge, removing all human ambiguity.

- **Hype Generator / Narrator:** The LLM provides dramatic, personalized commentary and post-round analysis (e.g., "The Machine sees fit to bestow the title 'Tricep Terror' upon Person B..."), turning data into an engaging narrative.

## ⚡ Core App Features

- **Real-Time Synchronization:** Scores update instantly (rep-by-rep) across the network using WebSockets, giving players a true feeling of a neck-and-neck race.

- **Dynamic Difficulty:** The LLM can introduce adaptive handicaps (e.g., forcing a dominant player to perform a harder variation like a Diamond Push-up) to ensure balanced, highly challenging matches.

- **Battle History:** Detailed statistics are tracked, including personal records for every exercise, win/loss ratios, and streaks, fueling long-term competitive drive.

- **Universal Access:** The competition requires zero equipment, meaning battles can take place anywhere using a standard webcam or smartphone.

## 🚀 Technology Stack

- **Frontend:** React.js + TypeScript + Vite + Tailwind CSS
- **Backend:** FastAPI (Python) + Uvicorn + WebSockets
- **CV Judge:** MediaPipe/TensorFlow.js (runs locally in browser)
- **LLM Intelligence:** OpenRouter API (Python SDK)
- **Database:** Cloud-based database (PostgreSQL)
- **Authentication:** Firebase Authentication
- **Hosting:** Vercel (Frontend) + Railway (Backend)
- **Multiplayer Sync:** WebSockets (Rep-by-Rep)

## 📚 Documentation

For technical implementation details, see [PLAN.md](./PLAN.md).
