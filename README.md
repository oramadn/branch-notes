# Branch Notes 📝

Never lose your train of thought. Branch Notes automatically manages and opens notes for each of your Git branches, keeping you organized and focused.

![Branch Notes Demo](https://github.com/oramadn/branch-notes/blob/main/images/branch-notes-demo.gif)

---

## Why Branch Notes?

When you're juggling multiple branches, you're also juggling different contexts, to-do lists, and ideas. Branch Notes saves you from mental clutter by linking a dedicated note file to each branch. Switch a branch, and your notes for that branch instantly appear right beside your code.

## Features

* ✅ **Automatic Note Switching:** Opens the correct note file when you check out a new branch.
* ✅ **On-the-Fly Creation:** If a note for a branch doesn't exist, it's created for you instantly.
* ✅ **Sidebar View:** Get a clear overview of all branch notes in your project right from the Activity Bar.
* ✅ **Customizable Storage:** Store all your notes in a central directory of your choice.

## Getting Started

1.  Install the **Branch Notes** extension.
2.  Open a project that uses Git.
3.  Switch to a new branch.
4.  That's it! A new note file will open in a side panel, ready for your ideas.

## Extension Settings

You can configure a custom storage path for your notes in your VS Code settings. If not set, notes will be stored in a `.vscode-branch-notes` folder in your home directory.

* `branchNotes.storagePath`: The absolute path to the directory where all branch notes will be stored.

```json
{
  "branchNotes.storagePath": "/Users/your-name/Documents/MyGitNotes"
}
```

Created with ❤️ by **[Omar Ramadan](httpsis.com/oramadn)**
