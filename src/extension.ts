const vscode = require('vscode');
const axios = require('axios');

function activate(context) {
  // Register the 'pgibler.viewChatWindow' command
  context.subscriptions.push(vscode.commands.registerCommand('pgibler.viewChatWindow', () => {
    // Create a new webview panel
    const panel = vscode.window.createWebviewPanel(
      'chatbot',
      'Chatbot',
      vscode.ViewColumn.One,
      {}
    );

    // Load the HTML content for the panel
    panel.webview.html = `
      <html>
        <head>
          <style>
            /* Add styles for the chat window here */
          </style>
        </head>
        <body>
          <div id="chat-window"></div>
          <form id="input-form">
            <input type="text" id="input-field" />
            <button type="submit">Send</button>
          </form>

          <script>
            // Add JavaScript code for sending messages and displaying responses here
            const vscode = acquireVsCodeApi();
            const inputForm = document.getElementById('input-form');
            const inputField = document.getElementById('input-field');
            const chatWindow = document.getElementById('chat-window');

            inputForm.addEventListener('submit', event => {
              event.preventDefault();
              const prompt = inputField.value;
              inputField.value = '';
              chatWindow.innerHTML += '<div class="prompt">' + prompt + '</div>';
              chatWindow.scrollTop = chatWindow.scrollHeight;
              vscode.postMessage({ command: 'send-prompt', text: prompt });
            });

            window.addEventListener('message', event => {
              if (event.data.command === 'show-response') {
                const response = event.data.text;
                chatWindow.innerHTML += '<div class="response">' + response + '</div>';
                chatWindow.scrollTop = chatWindow.scrollHeight;
              }
            });
          </script>
        </body>
      </html>
    `;

    // Define the 'sendMessage' function for sending prompts to the ChatGPT API
    function sendMessage(message) {
      const apiUrl = 'https://api.chatgpt.com/send-message';
      const apiKey = 'YOUR_API_KEY_HERE';

      return axios.post(apiUrl, {
        message: message,
        apiKey: apiKey
      })
        .then(response => {
          return response.data.message;
        })
        .catch(error => {
          console.log(error);
        });
    }

    // Handle messages sent from the webview
    panel.webview.onDidReceiveMessage(message => {
      if (message.command === 'send-prompt') {
        const prompt = message.text;
        sendMessage(prompt)
          .then(response => {
            panel.webview.postMessage({ command: 'show-response', text: response });
          });
      }
    });
  }));
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

exports.activate = activate;
