# ChatGPT API Stream

Here is a simple demo that demonstrates how to use the ChatGPT API in stream mode.
With this project, you can easily deploy a WebSocket server for engaging in a stream of conversations with ChatGPT.

If you find this project useful, please help us by giving it a star.

## Newss

- **2023-03-26**: project start

## Usage

0. Obtain an OpenAI API Key from [OpenAI API Keys](https://platform.openai.com/account/api-keys).
1. Download this project
2. Configure your [environment variables](.env.example) correctly.
3. Run
```
npm i
npm run start
```

The WebSocket Server is start

## Test

Here, I'm testing using the <code>wscat</code> tool, although you can use any WebSocket client to test.
```
npm i -g wscat
wscat --connect ws://127.0.0.1:9010/chat/
```

say any thing you want
and it will reply message with stream mode

## Improve this project

This project is always seeking ways to improve and welcomes feedback and contributions from its users. If you have any suggestions or ideas, please feel free to create an issue or submit a pull request on the GitHub repository.

