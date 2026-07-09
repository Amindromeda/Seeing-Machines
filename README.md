# Seeing Machines — A Multimodal Archive Companion

**[View the Live Project Installation]([https://YOUR_USERNAME.github.io/YOUR_REPO/](https://amindromeda.github.io/Seeing-Machines/))**

*Seeing Machines* is a retrieval-augmented system built over a personal archive of 346 generative visuals produced in TouchDesigner. This project investigates visual pareidolia in Vision-Language Models (VLMs). It asks: when a VLM describes a procedurally generated, non-representational image, does it stay honest about its uncertainty, or does it impose real-world objects and scenes that were never there?

**Author:** Amin Rasti Pour  
**Course:** CompSci for Designers 2 · MA Design for Digital Futures  
**Institution:** TH Nürnberg (Summer 2026)  
**Supervisors:** Moritz Schwind, Christopher Kopic  

---

## ⚙️ Architecture & Approach

The project evaluates retrieval through three distinct layers:
1. **The Finder (Level 1):** Direct semantic search using joint text-image embeddings (SigLIP 2).
2. **The Companion (Level 2):** Structured image captioning and conversational grounding (Gemma 3 4B), intentionally splitting literal visual descriptions from interpreted resemblances.
3. **The Critic (Level 3):** A hybrid fusion evaluation comparing precision across both retrieval routes to surface VLM hallucinations, skewed readings, and genuine ambiguity.

## 👁️ The Pareidolia Engine (Interactive Visualizer)

The background of the live project site features a custom-built, vanilla JavaScript visualizer conceptually tied to the thesis. 

Rather than standard generative noise, the background simulates the raw attention mechanism of a Vision-Language Model. Two autonomous "attention heads" roam across a faint substrate of data points. As they drift, they spontaneously hallucinate geometric bounding boxes and attempt to classify the empty void using the exact vocabulary from the project's search queries (e.g., `query: "asphalt"`, `class: "tree"`). 

**Interactivity:**
* **Attention Gravity:** Moving the cursor gently pulls the latent data points toward the user.
* **Scan Pulse:** Clicking anywhere on the canvas forces an immediate, localized VLM classification attempt.

---

## 💻 Local Development & Viewing

This project is a static site with no build step required. It utilizes plain HTML, CSS, and Vanilla JS.
