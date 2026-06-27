# ContestLens 

 A browser userscript that analyzes LeetCode contest replays to detect suspicious submission patterns, in simple words if you cheat, I would know ^_-


# Installation

 1. Install a Userscript Manager

| Browser               | Extension (this is safe, don't worry)                   |
| --------------------- | ---------------------------- |
| Chrome / Edge / Brave | Tampermonkey                 |
| Firefox               | Tampermonkey or Greasemonkey |

 2. Enable User Scripts 

1. Open `chrome://extensions/`
2. Enable **Developer Mode**
3. Open **Tampermonkey → Manage Extension**
4. Enable **Allow User Scripts**

 3. Install ContestLens

Here is the link buddy:

```text
https://greasyfork.org/en/scripts/584515-contestlens
```

Tampermonkey will detect the userscript and prompt for installation.
# Features

* Scan the last **5 contests** attended by any user.
* Analyze typing patterns for suspicious submissions.
* Detect external pastes, bulk insertions, and tab switching.
* Smart filtering to reduce false positives.
* One-click access to official contest replays (catch the cheater red-handed).
* Fully isolated UI using Shadow DOM.
  

# How to use it ?

1. Visit any LeetCode profile: `leetcode.com/u/<username>`
2. Click the **ContestLens** floating button.
3. Select **Scan Last 5 Contests**.
4. Click a contest to analyze its submissions.
5. Use **▶** to open the official replay.


#  Read this or suffer

ContestLens uses heuristic analysis based on publicly available contest replay data and the same GraphQL endpoints used by LeetCode. Results are probabilistic and should **not** be treated as proof of cheating or misconduct. ContestLens is **not affiliated with or endorsed by LeetCode**.

# License

MIT License.
