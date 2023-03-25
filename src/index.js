import * as dotenv from 'dotenv';
dotenv.config();

// websocket server
import { WebSocketServer } from 'ws';
const server = new WebSocketServer({ port: 9010 });

import { Configuration, OpenAIApi } from "openai"
const url = 'https://api.openai.com/v1/models';
const configuration = new Configuration({
    apiKey: process.env.API_KEY
  });
  const openai = new OpenAIApi(configuration);

server.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('message', async (message) => {
        console.log(`Received message: ${message}`);
         socket.send(`You said: ${message}`);
            chat(message.toString(), (data) => {
                socket.send(data);

            })
    });

    socket.on('close', () => {
        console.log('Client disconnected');
    });
});

async function chat(content, handleMessage) {
  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: content }],
            max_tokens: 100,
        temperature: 0,
        stream: true,
    }, { responseType: 'stream' });

completion.data.on('data', data => {
        const lines = data.toString().split('\n').filter(line => line.trim() !== '');
        for (const line of lines) {
            const message = line.replace(/^data: /, '');
            if (message === '[DONE]') {
                return; // Stream finished
            }
            try {
                    console.log(`Receive stream message: ${message}`)
                    handleMessage(message)
            } catch(error) {
                console.error('Could not JSON parse stream message', message, error);
            }
        }
    });
  } catch (e) {
    console.log("OpenAI API fail: ", e)
  }
}