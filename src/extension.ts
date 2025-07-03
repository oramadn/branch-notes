import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { API, GitExtension, Repository } from "./git";

function getGitApi(): API | undefined {
  const gitExtension = vscode.extensions.getExtension<GitExtension>("vscode.git")?.exports;
  if (!gitExtension) {
    vscode.window.showWarningMessage("Git extension is not available.");
    return undefined;
  }
  return gitExtension.getAPI(1);
}

/**
 * The core logic for opening a note for a given repository.
 */
async function openNoteForRepository(repo: Repository) {
  const config = vscode.workspace.getConfiguration("branchNotes");
  const storagePath = config.get<string>("storagePath");

  if (!storagePath || storagePath.trim() === "") {
    vscode.window
      .showWarningMessage('Please set the "Branch Notes: Storage Path" in your settings.', "Open Settings")
      .then((selection) => {
        if (selection === "Open Settings") {
          vscode.commands.executeCommand("workbench.action.openSettings", "branchNotes.storagePath");
        }
      });
    return;
  }

  const projectName = path.basename(repo.rootUri.fsPath);
  const branchName = repo.state.HEAD?.name;

  if (!branchName) {
    vscode.window.showWarningMessage("Could not determine the current branch name for this repository.");
    return;
  }

  const sanitizedBranchName = branchName.replace(/[\\/]/g, "-");
  const projectNotesPath = path.join(storagePath, projectName);
  const noteFilePath = path.join(projectNotesPath, `${sanitizedBranchName}.md`);

  try {
    fs.mkdirSync(projectNotesPath, { recursive: true });

    if (!fs.existsSync(noteFilePath)) {
      fs.writeFileSync(noteFilePath, `# Notes for ${projectName} - ${branchName}\n\n`);
    }

    const noteUri = vscode.Uri.file(noteFilePath);

    if (vscode.window.activeTextEditor?.document.uri.fsPath === noteUri.fsPath) {
      return;
    }

    const document = await vscode.workspace.openTextDocument(noteUri);
    await vscode.window.showTextDocument(document, { preview: false, viewColumn: vscode.ViewColumn.Beside });
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to open branch note: ${error}`);
  }
}

/**
 * Logic for the manual command "Open Note for Current Branch".
 */
async function openNoteForActiveFile() {
  const api = getGitApi();
  if (!api || api.repositories.length === 0) {
    vscode.window.showWarningMessage("No Git repository found in your workspace.");
    return;
  }

  let repoToUse: Repository | undefined;

  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(activeEditor.document.uri);
    if (workspaceFolder) {
      repoToUse = api.repositories.find((r) => r.rootUri.fsPath === workspaceFolder.uri.fsPath);
    }
  } else if (api.repositories.length === 1) {
    repoToUse = api.repositories[0];
  }

  if (repoToUse) {
    await openNoteForRepository(repoToUse);
  } else {
    vscode.window.showInformationMessage(
      "Could not determine which repository to use. Please open a file from your desired project."
    );
  }
}

/**
 * Logic for handling the automatic branch change.
 */
async function handleBranchChange(repo: Repository) {
  const config = vscode.workspace.getConfiguration("branchNotes");
  const storagePath = config.get<string>("storagePath");

  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) {
    return;
  }

  const activeFilePath = activeEditor.document.uri.fsPath;
  if (!storagePath || !activeFilePath.startsWith(storagePath)) {
    return;
  }

  await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  await openNoteForRepository(repo);
}

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand("branch-notes.openNote", openNoteForActiveFile);
  context.subscriptions.push(disposable);

  const api = getGitApi();
  if (!api) return;

  const setupRepoEventListener = (repo: Repository) => {
    repo.state.onDidChange(() => handleBranchChange(repo));
  };

  api.repositories.forEach(setupRepoEventListener);

  api.onDidOpenRepository(setupRepoEventListener);
}

export function deactivate() {}
