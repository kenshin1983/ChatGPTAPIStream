import * as dotenv from 'dotenv';
import url from 'url'
import { WebSocketServer } from 'ws';
import { Configuration, OpenAIApi } from 'openai'

// init config to env
dotenv.config();

const PORT = process.env.PORT || 9010


const routes = {
    '/chat': chatModule
}

// init websocket server
const server = new WebSocketServer({ port: PORT });

server.on('connection', (ws, req) => {
    console.log('Client connected url: ', req.url);
    dispatcher(req.url, ws)
});

// common
function dispatcher(uri, ws) {
    const location = url.parse(uri, true);
    const key = location.query.token

    if (routes[location.pathname] && key) {
        // init openai
        const configuration = new Configuration({
            apiKey: key
        })
        const openai = new OpenAIApi(configuration);
        (routes[location.pathname])(ws, openai)
    } else {
        console.log('Unknown path: ', location.pathname, ' key: ', key)
        ws.close()
    }
   
}

function result(code, msg, data) {
    return JSON.stringify({code, msg, data})
}

function getId() {
    return new Date().getTime()
}

// module
// 消息体 { type, msgid, token, data }
// type: ping / chat
function chatModule(ws, openai) {
    ws.on('message', async (message) => {
        try {
            const json = JSON.parse(message.toString())
            console.log(json)
            switch (json.type) {
                case 'ping':
                    ws.send(result(0, 'OK', { msgid: getId(), content: 'pang'}));
                    break;

                case 'login': 
                    // todo
                    break;

                case 'chat':
                    chatgptchat(json.data, openai, (data) => {
                        ws.send(result(0, 'OK', { msgid: getId(), content: JSON.parse(data)}));
                    })
                    break;
                default:
                    ws.send(result(10002, 'error type:', json.type))
            }
        } catch(e) {
            console.error('revice error message: ', message.toString())
            ws.send(result(10001, 'Error parameter'))
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
}

async function chatgptchat(messages, openai, handleMessage) {
  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messages,
    //   messages: [{ role: "user", content: content }],
            // max_tokens: 100,
        // temperature: 0,
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