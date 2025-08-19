import { useState } from 'react'

import OpenAI from 'openai'

const openai = new OpenAI({
    baseURL: 'http://localhost:11434/v1/',

    // required but ignored
    apiKey: 'ollama',
    dangerouslyAllowBrowser: true,// This is only for local development, not recommended for production
})




export default function App() {
    const [count, setCount] = useState(0)
    const [userInput, setUserInput] = useState('')
    const [assistantResponse, setAssistantResponse] = useState('')
    
    // To use getChatCompletion, call it from an event handler or useEffect
    async function getChatCompletion(content, model='llama3.2') {
        try {
            const chatCompletion = await openai.chat.completions.create({
                messages: [{ role: 'user', content: content }],
                model: model,
            })
            setAssistantResponse(chatCompletion.choices[0].message.content)
        } catch (error) {
            console.error('Error fetching chat completion:', error)
        }
    }


    return (
        <>
            <h1>Ollama Chat</h1>
            <div className="input">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type your message here"
                />
                <button onClick={() => getChatCompletion(userInput)}>
                    Send
                </button>
            </div>
            <div className="response">
                <p>Assistant Response:</p>
                <pre>{assistantResponse}</pre>
            </div>
        </>
    )
}


