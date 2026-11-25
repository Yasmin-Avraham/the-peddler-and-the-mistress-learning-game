# The Peddler and the Mistress — Learning Game

**Escape from Heleni's Forest** is an interactive Hebrew (RTL) classroom board game based on S.Y. Agnon's classic short story *"The Lady and the Peddler"*.

Designed for 11th-grade Special Education students preparing for the Israeli Literature Bagrut exam, the game is built for full-screen classroom projection with teacher-led facilitation.

Link: https://yasmin-avraham.github.io/the-peddler-and-the-mistress-learning-game/

---

## Features

- **Interactive Forest Trail Map (RTL):** An atmospheric night-forest SVG map with 5 key story stations moving right-to-left:
  1. **The Storm in the Forest** – Exposition
  2. **The Shed & the Hunting Knife** – Foreshadowing
  3. **Feasts of Meat and Wine** – Food Motif & Assimilation
  4. **The Clues and the Danger** – Realization & Suspense
  5. **Shema Prayer & the Escape** – Climax & Salvation
- **Two-Team Race:** Two teams (Team A and Team B) compete along the trail with animated hopping tokens, progress bars, and turn indicators.
- **3 Differentiated Difficulty Levels (15 Questions Total):**
  - 🟢 **Basic – Sheet Retrieval (+1 step):** 5 direct recall questions from the story and summary sheet.
  - 🟡 **Intermediate – Comprehension & Motifs (+2 steps):** 5 comprehension questions covering motifs, symbols, the recurring *return/courtship* root motif, irony, and allegory.
  - 🔴 **Bagrut Challenge – Answer Formulation (+3 steps):** 5 Bagrut-style questions requiring a textual example plus an explanation of meaning and critique.
- **Built-in Learning Scaffolds:** Every question card includes a toggleable **Hint** (guiding students where to look on their summary sheet) and a toggleable **Full Teacher Answer**.
- **Teacher Control Panel:**
  - Rename both teams on the fly.
  - Manually adjust team positions (`+1` / `-1`).
  - Switch between **Full Track (12 steps with stepping stones)** for a full lesson and **Quick Track (4 steps, 1 per station)** for shorter sessions.
  - Pick any specific question directly by topic or reset the question bank.
  - Start a new game at any time.
- **Synthesized Audio & Celebration:** Built-in Web Audio API sound effects (with a mute toggle) and a Canvas confetti victory screen when a team reaches Station 5.
- **Zero Build Setup:** Pure HTML, CSS, and vanilla JavaScript — runs directly in any modern browser.

---

## Getting Started

No installation or build tools are required.

1. Clone or download this repository.
2. Open `index.html` directly in any modern web browser (Chrome, Edge, Firefox, Safari).
   - *Optional:* Serve locally with any static server, e.g. `npx serve .` or `python -m http.server`.
3. Press `F11` in your browser for full-screen classroom projection.

> **Note:** An internet connection is only needed to load the `Heebo` and `Frank Ruhl Libre` fonts from Google Fonts; the game gracefully falls back to system fonts offline.

---

## Keyboard Shortcuts

While a question card is open (the letter shortcuts also work when the keyboard is set to the Hebrew layout):

| Key | Action |
| --- | --- |
| `H` | Toggle Hint |
| `A` | Toggle Full Teacher Answer |
| `Esc` | Close modal and return question to the bank |

---

## Project Structure

```text
.
├── index.html      # Main RTL page structure, SVG forest backdrop, and modals
├── styles.css      # Dark-forest & gold high-contrast theme and animations
├── questions.js    # Station definitions, difficulty config, and 15-question bank
├── app.js          # Game engine, Bezier trail geometry, Web Audio SFX, confetti
├── README.md       # Project documentation
└── .gitignore      # Git ignore rules
```

---

## Customizing Questions

To edit or add questions, modify the `QUESTIONS_BANK` array in `questions.js`. Each question object follows this structure:

```js
{
  id: "g6",
  level: "green", // "green" | "yellow" | "red"
  topic: "נושא השאלה",
  question: "נוסח השאלה?",
  hint: "רמז – היכן לחפש בדף הסיכום.",
  answer: [
    "<strong>חלק ראשון:</strong> פירוט התשובה."
  ]
}
```
