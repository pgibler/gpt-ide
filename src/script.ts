import * as vscode from 'vscode';
import { getResponseFromApi } from './api';
import * as path from 'path';
import * as fs from 'fs';

export async function sendPromptAndGetResponse(prompt: string) {
  const response = await getResponseFromApi(prompt);
  return response;
}

let panel: vscode.WebviewPanel | undefined;

function getWebViewContent(extensionPath: string, fileName: string): string {
  const filePath = path.join(extensionPath, fileName);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return fileContent;
}

function createWebView(context: vscode.ExtensionContext) {
  const columnToShowIn = vscode.window.activeTextEditor
    ? vscode.window.activeTextEditor.viewColumn
    : undefined;

  if (panel) {
    panel.reveal(columnToShowIn);
  } else {
    panel = vscode.window.createWebviewPanel(
      'gptChat',
      'GPT Chat',
      columnToShowIn || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    const html = getWebViewContent(context.extensionPath, 'chatWindow.html');

    panel.webview.html = html;

    panel.webview.onDidReceiveMessage(
      async (message: { command: string; text: string }) => {
        switch (message.command) {
          case 'newPrompt':
            const promptInput = document.getElementById(
              'promptInput'
            ) as HTMLInputElement;
            const promptList = document.getElementById('promptList');
            const prompt = promptInput.value;
            if (prompt) {
              promptInput.value = '';
              const listItem = document.createElement('li');
              listItem.innerText = `You: ${prompt}`;
              if (promptList) {
                promptList.appendChild(listItem);
              }

              const response = await getResponseFromApi(prompt);

              const responseItem = document.createElement('li');
              responseItem.innerText = `ChatGPT: ${response}`;
              if (promptList) {
                promptList.appendChild(responseItem);
              }

              panel?.webview.postMessage({
                command: 'updateChatWindow',
              });
            }
            break;
        }
      },
      undefined,
      context.subscriptions
    );
  }
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('gpt-chat.start', () => {
      createWebView(context);
    })
  );
}

export function deactivate() {
  panel?.dispose();
}
