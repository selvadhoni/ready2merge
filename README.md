<align center>
  <img src="https://raw.githubusercontent.com/selvadhoni/ready2merge/main/icon.png" width="128" />
  <h1>Ready2Merge</h1>
  <p><b>Master the DNA of any codebase. Merge with absolute confidence.</b></p>
</align>

---

**Ready2Merge** is a professional-grade VS Code extension that bridges the gap between chaos and strict linting. It learns the unique patterns, habits, and "DNA" of your specific repository and provides lightweight, non-blocking feedback when your changes drift from that baseline.

No external rules. No forced "best practices." Just your team's code, analyzed locally and respected.

---

## 🧬 The Ready2Merge DNA Analysis
Ready2Merge doesn't just scan files; it understands your project's soul.

```text
[ Project DNA Scan ] ➔ Found 1,240 patterns
  ├── Identifiers ...... [ camelCase ]  ✅
  ├── Logic Patterns ... [ Stable ]     ✅
  └── Docker Casing .... [ UPPERCASE ]  ✅

[ Result: Staged changes are 100% consistent. Ready to Merge. ]
```

---

## 💎 The Three Pillars

### 1. Repository DNA 🧬
Linters often enforce arbitrary rules. Ready2Merge focuses on **truth**. It scans your project to understand:
- **Typical Density**: How many logs and TODOs are normal for your scale?
- **Naming Traditions**: Does your team prefer `camelCase` or `snake_case`?
- **Dockerfile Standards**: Are instructions typically `UPPERCASE` or `lowercase`?

### 2. PR Readiness Check 🛡️
Run a sanity check on your staged changes before firing off a PR.
- **Drift Detection**: Catch that one `snake_case` total in a 10k line `camelCase` project.
- **Spike Alerts**: Identify when a file has 5x the usual amount of `console.log`s.
- **Dependency Hygiene**: Get alerted if you edited `.env` but forgot to update `.env.example`.

### 3. Pinpoint Navigation 🎯
Don't waste time searching for issues.
- Every warning in the Output Panel is a **live link**.
- **Ctrl+Click** any alert to jump directly to the **line and column** where the drift was detected.

---

## 🛠️ How it Works

Ready2Merge is built for performance and privacy.

- **Zero-AI Engine**: Uses advanced local regex and statistical analysis.
- **The Baseline**: Patterns are stored in `.ready2merge/baseline.json`. Commit this file to your repo to ensure the entire team stays in sync with the project's DNA.
- **Non-Obtrusive**: All results go to a dedicated Output Channel. No red squiggles to distract your flow.

---

## ⌨️ Command Reference

| Command | Purpose |
| :--- | :--- |
| `Ready2Merge: Initialize Baseline` | Create the initial DNA profile for your project. |
| `Ready2Merge: Check PR Readiness` | Analyze current changes against the baseline. |
| `Ready2Merge: Repository Insights` | View a high-level statistical report of your project. |
| `Ready2Merge: Refresh Baseline` | Re-learn patterns after large architectural shifts. |

---

## ⚙️ Understanding Indicators

| Icon | Status | Action |
| :--- | :--- | :--- |
| 🟢 | **Stable** | Perfectly consistent with repository DNA. |
| 🟡 | **Drift** | A pattern mismatch was found. Recommended review. |
| 🔵 | **Info** | Summary data or statistical insights. |

---

## 🔒 Privacy First
- **Offline Always**: No data is sent to any server.
- **Local Analysis**: Everything happens within your local VS Code environment.
- **No Telemetry**: We don't track your code or your habits.

---

## 🚀 Getting Started

1. **Install** from the Marketplace.
2. Open your project root.
3. Run `Ready2Merge: Initialize Baseline` via the Command Palette (`Ctrl+Shift+P`).
4. **Commit** the `.ready2merge/` folder.
5. Code as usual, and run `Check PR Readiness` before you commit!

---

## 🤝 Contributing & Support
Built with 💚 for the engineering community by **selvakannanr**.

- **Issues**: Found a bug? [Open an issue](https://github.com/selvadhoni/ready2merge/issues)
- **Repo**: [View on GitHub](https://github.com/selvadhoni/ready2merge)

---
<p align="center">
  <i>"Merge with confidence, not constraints."</i>
</p>
