# Manual Publishing Guide - Ready2Merge

Follow these steps to bundle your extension and upload it manually to the Visual Studio Code Marketplace.

## Prerequisites

1.  **VSCE Installed**: You must have the Visual Studio Code Extension Manager (`vsce`) installed globally.
    ```powershell
    npm install -g @vscode/vsce
    ```
2.  **Microsoft Account**: A Microsoft account to access the Marketplace management console.

---

## Step 1: Bundle the Extension (.VSIX)

Before uploading, you need to package the extension into a single `.vsix` file.

1.  Open your terminal in the project root (`d:\my-projects\ready2merge`).
2.  Run the compile step to ensure your latest code is included:
    ```powershell
    npm run compile
    ```
3.  Generate the package:
    ```powershell
    vsce package
    ```
    -   This will create a file named `ready2merge-0.1.0.vsix` in your root directory.
    -   *Note: If `vsce` warns about missing repository or LICENSE, ensure you've committed those files.*

---

## Step 2: Access the Management Console

1.  Go to the [Visual Studio Marketplace Management Console](https://marketplace.visualstudio.com/manage).
2.  Sign in with your Microsoft account.

---

## Step 3: Create a Publisher (First Time Only)

If you haven't published an extension before, you need to create a **Publisher ID**.

1.  Click on **Create Publisher**.
2.  Enter the Name: `selvakannanr`.
3.  Enter the ID: `selvakannanr`.
4.  Save the profile.

---

## Step 4: Manual Upload

1.  In your Publisher dashboard, click the **+ New Extension** button.
2.  Select **Visual Studio Code**.
3.  In the upload dialog, drag and drop your **`ready2merge-0.1.0.vsix`** file (or click to browse).
4.  The Marketplace will validate the file. This may take a few minutes.
5.  Once validated, your extension will be live!

---

## Verification Before Shipping

> [!IMPORTANT]
> Ensure these files are present in your root folder before running `vsce package`:
> - `icon.png` (The logo)
> - `LICENSE` (MIT)
> - `README.md` (The store page content)
> - `CHANGELOG.md` (Release notes)

The `.vscodeignore` file I created will automatically exclude your source code (`src/`) and test folders, keeping the package clean.
