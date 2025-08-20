import { use, useEffect, useState } from 'react'

import OpenAI from 'openai'

const openai = new OpenAI({
    baseURL: 'http://localhost:11434/v1/',

    // required but ignored
    apiKey: 'ollama',
    dangerouslyAllowBrowser: true,// This is only for local development, not recommended for production
})


export default function App() {
    const [modelName, setmodelName] = useState("llama3.2")
    const [userInput, setUserInput] = useState('')
    const [assistantResponse, setAssistantResponse] = useState('')
    const [isThinking, setIsThinking] = useState(false)
    const [availableModels, setAvailableModels] = useState([])

    async function fetchAvailableModels() {
        try {
            const listCompletion = await openai.models.list()
            const models = listCompletion.data.map(model => model.id)
            setAvailableModels(models)
        } catch (error) {
            console.error('Error fetching available models:', error)
        }
    }

    
    // To use getChatCompletion, call it from an event handler or useEffect
    async function getChatCompletion(content, model='llama3.2') {
        setIsThinking(true)
        try {
            const chatCompletion = await openai.chat.completions.create({
                messages: [{ role: 'user', content: content }],
                model: model,
                //stream: false, // Change to true if you want to handle streaming
            })
            // Join all chunks to form the complete response
            // const chunks = [];
            // for await (const chunk of chatCompletion) {
            //     chunks.push(chunk.choices[0].delta.content || '');
            // }
            // If you want to set the response directly from the first choice
            setAssistantResponse(chatCompletion.choices[0].message.content)
            // If you want to set the response from the stream
            //setAssistantResponse(chunks.join(''))
            
        } catch (error) {
            console.error('Error fetching chat completion:', error)
        }
        setIsThinking(false)
    }

    
    useEffect(() => {
        fetchAvailableModels()
    }, [])

    return (
        <>
            <h1>Ollama Chat</h1>
            <div className="Chat">
                <h4>Available models on your local Ollama installation:</h4>
                <small>(Pull more models to populate this list.)</small>
                <ul style={{ listStyleType: "none" }}>
                {availableModels.map((model, idx) => (
                    <li key={idx}>
                        <input
                            type='radio'
                            name='modelname'
                            id={`model-${idx}`}
                            value={model}
                            checked={modelName === model}
                            onChange={(e) => setmodelName(e.target.value)}
                        />
                        {model}
                    </li>
                ))}
                </ul>
                
                
                <textarea
                    style={{width:30+"rem", height:5+"rem"}}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type your message here"
                ></textarea>
                <button onClick={() => getChatCompletion(userInput, modelName)}>
                    Send
                </button>
            </div>
            <div className="response">
                <p>Assistant Response: {isThinking && "Thinking..."}
                </p>
                <textarea style={{width:50+"rem", height:20+"rem"}} readOnly placeholder='LLM reponse' value={assistantResponse}></textarea>
            </div>
        </>
    )
}


