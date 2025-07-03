import { Uri, Event, SourceControl } from "vscode";

export interface GitExtension {
  getAPI(version: 1): API;
}

export interface API {
  readonly state: "uninitialized" | "initialized";
  readonly onDidChangeState: Event<"uninitialized" | "initialized">;
  readonly onDidOpenRepository: Event<Repository>;
  readonly onDidCloseRepository: Event<Repository>;
  readonly repositories: Repository[];
}

export interface Repository {
  readonly rootUri: Uri;
  readonly sourceControl: SourceControl;
  readonly state: RepositoryState;
}

export interface RepositoryState {
  readonly HEAD: Branch | undefined;
  readonly onDidChange: Event<void>;
}

export interface Branch {
  readonly name?: string;
}
