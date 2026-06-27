# ContestLens 

> **A browser userscript that analyzes LeetCode contest replays to detect suspicious submission patterns.**

ContestLens runs directly on LeetCode profile and problem pages, allowing you to inspect a user's recent contest history and analyze typing behavior from official contest replays without leaving the website.

---

# Installation

### 1. Install a Userscript Manager

| Browser               | Extension                    |
| --------------------- | ---------------------------- |
| Chrome / Edge / Brave | Tampermonkey                 |
| Firefox               | Tampermonkey or Greasemonkey |

### 2. Enable User Scripts (Chrome/Edge/Brave)

1. Open `chrome://extensions/`
2. Enable **Developer Mode**
3. Open **Tampermonkey → Manage Extension**
4. Enable **Allow User Scripts**

### 3. Install ContestLens

Open:

```text
dist/contestlens.user.js
```

Tampermonkey will detect the userscript and prompt for installation.

If it doesn't, open `dist/contestlens.user.js` and click **Raw**.

---

# ✨ Features

* Scan the last **5 contests** attended by any user.
* Analyze typing patterns for suspicious submissions.
* Detect external pastes, bulk insertions, and tab switching.
* Smart filtering to reduce false positives.
* One-click access to official contest replays.
* Animated submission celebration overlay.
* Fully isolated UI using Shadow DOM.

---

# 🚦 Verdicts

| Verdict           | Meaning                                                |
| ----------------- | ------------------------------------------------------ |
| 🟦 **Clean**      | No suspicious activity detected.                       |
| 🟧 **Borderline** | Small external pastes detected.                        |
| 🟥 **Suspicious** | Large external paste or impossible insertion detected. |
| ⬜ **Skipped**     | No accepted submission to analyze.                     |

---

# 🚀 Usage

1. Visit any LeetCode profile: `leetcode.com/u/<username>`
2. Click the **ContestLens** floating button.
3. Select **Scan Last 5 Contests**.
4. Click a contest to analyze its submissions.
5. Use **▶** to open the official replay.

---

# ⚠️ Disclaimer

ContestLens uses heuristic analysis based on publicly available contest replay data and the same GraphQL endpoints used by LeetCode. Results are probabilistic and should **not** be treated as proof of cheating or misconduct. ContestLens is **not affiliated with or endorsed by LeetCode**.

---

# 📄 License

MIT License.
