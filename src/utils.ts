import * as vscode from 'vscode';
import { readFileSync } from 'fs';

export function getWebViewContent(extensionUri: vscode.Uri, fileName: string): string {
  const diskPath = vscode.Uri.joinPath(extensionUri, fileName);
  const fullPath = diskPath.fsPath;
  const fileContent = readFileSync(fullPath);
  const decoder = new TextDecoder();
  const content = decoder.decode(fileContent);
  return content;
}
