# ContestLens 🔍

> **A browser userscript that analyzes LeetCode contest replays to detect suspicious submission patterns.**

ContestLens runs directly on LeetCode profile and problem pages, allowing you to inspect a user's recent contest history and analyze typing behavior from official contest replays — all without leaving the website.

> **Note:** ContestLens is designed for educational and analytical purposes. Its results are probabilistic and should never be treated as proof of misconduct.

---

##  Features

###  Contest History Scanner

* Scan the **last 5 contests** attended by any user directly from their LeetCode profile.
* View contest information in a clean, interactive panel.

###  Keystroke Analysis

Analyze every accepted submission for:

* External code pastes
* Large bulk insertions
* Focus-loss (tab switching)
* Typing behavior patterns

###  Smart Detection

Reduces false positives by distinguishing:

* Internal editor cut/paste
* Code refactoring
* Genuine external pastes

###  One-Click Replay

Automatically computes the correct contest ranking page and opens the official LeetCode replay for the selected submission.

###  Submission Celebration

Displays a GTA/Minecraft-inspired animated overlay whenever you successfully submit a solution.

###  Shadow DOM Isolation

The entire UI is rendered inside a Shadow DOM, preventing conflicts with LeetCode's styling.

---

## 🚦 Verdict Legend

| Verdict           | Meaning                                                           |
| ----------------- | ----------------------------------------------------------------- |
|  **Clean**      | Natural typing pattern with no suspicious activity detected.      |
|  **Borderline** | Small external pastes detected (possibly an IDE workflow).        |
|  **Suspicious** | Large external paste or physically impossible insertion detected. |
|  **Skipped**     | No accepted submission available for analysis.                    |

>  ContestLens uses heuristics. Users who solve problems in a local IDE and paste their final solution may be flagged. Results should not be considered definitive evidence.

---

#  Installation

## 1. Install a Userscript Manager

| Browser               | Extension                    |
| --------------------- | ---------------------------- |
| Chrome / Edge / Brave | Tampermonkey                 |
| Firefox               | Tampermonkey or Greasemonkey |

---

## 2. Enable User Scripts

### Chrome / Edge / Brave

1. Open `chrome://extensions/`
2. Enable **Developer Mode**
3. Open **Tampermonkey → Manage Extension**
4. Enable **Allow User Scripts**

Firefox requires no additional configuration after installing Tampermonkey or Greasemonkey.

---

## 3. Install ContestLens

Open:

```text
dist/contestlens.user.js
```

Tampermonkey will automatically detect the userscript and prompt for installation.

If it doesn't:

* Navigate to the `dist/` folder
* Open `contestlens.user.js`
* Click **Raw**

---

#  Usage

1. Visit any LeetCode profile

```
https://leetcode.com/u/<username>
```

2. Click the **ContestLens** floating button.
3. Press **Scan Last 5 Contests**.
4. Select a contest to analyze every problem.
5. Click **▶** to jump directly to the official contest replay.

---

# 🛠 Tech Stack

| Layer      | Technology         |
| ---------- | ------------------ |
| UI         | React 19           |
| Language   | TypeScript         |
| Styling    | Tailwind CSS v3    |
| Build Tool | Vite 7             |
| Userscript | vite-plugin-monkey |
| Isolation  | Shadow DOM         |

---

#  Project Structure

```text
contestlens/
├── assets/                   # Bundled audio and image assets
├── dist/                     # Production userscript
├── docs/                     # Additional documentation
└── src/
    ├── components/
    │   ├── ContestCard.tsx
    │   ├── FloatingButton.tsx
    │   ├── MemeOverlay.tsx
    │   └── SettingsView.tsx
    │
    ├── hooks/
    │   ├── useSettings.ts
    │   └── useUsername.ts
    │
    ├── lib/
    │   ├── analysis.ts
    │   ├── api.ts
    │   ├── interceptors.ts
    │   ├── settings.ts
    │   └── themes.ts
    │
    ├── styles/
    │   └── global.css
    │
    ├── types/
    │   └── index.ts
    │
    ├── App.tsx
    ├── main.tsx
    └── vite-env.d.ts
```

---

#  Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Type checking:

```bash
npm run type-check
```

Build the production userscript:

```bash
npm run build
```

The generated userscript will be available at:

```text
dist/contestlens.user.js
```

---

# ⚠️ Disclaimer

ContestLens only uses publicly accessible contest replay data and the same GraphQL endpoints used by the official LeetCode website.

The analysis is entirely heuristic-based and is intended for educational, analytical, and informational purposes only. Results are probabilistic and should not be interpreted as definitive proof of cheating or misconduct.

ContestLens is **not affiliated with or endorsed by LeetCode**.

---

# 📄 License

Released under the **MIT License**.
