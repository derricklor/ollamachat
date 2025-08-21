import { use, useEffect, useState, useRef } from 'react'

import OpenAI from 'openai'

const openai = new OpenAI({
    baseURL: 'http://localhost:11434/v1/',

    // required but ignored
    apiKey: 'ollama',
    dangerouslyAllowBrowser: true,// This is only for local development, not recommended for production
})


export default function App() {
    const [modelName, setmodelName] = useState('')
    const [userInput, setUserInput] = useState('')
    const [chatHistory, setChatHistory] = useState([])
    const [isThinking, setIsThinking] = useState(false)
    const [availableModels, setAvailableModels] = useState([])
    const [error, setError] = useState(null)
    const chatEndRef = useRef(null);

    async function fetchAvailableModels() {
        try {
            const listCompletion = await openai.models.list()
            const models = listCompletion.data.map(model => model.id)
            setAvailableModels(models)
            setmodelName(models[0] || "llama3.2:latest") // Set default model if available
        } catch (error) {
            console.error('Error fetching available models:', error)
            setError('Failed to fetch available models. Please check your Ollama server.')
        }
    }


    // To use getChatCompletion, call it from an event handler or useEffect
    async function getChatCompletion(content, model = 'llama3.2') {
        setIsThinking(true)
        const newUserMessage = { role: 'user', content: content };
        const updatedHistory = [...chatHistory, newUserMessage];
        setChatHistory(updatedHistory);
        setUserInput('');

        try {
            const chatCompletion = await openai.chat.completions.create({
                messages: updatedHistory,
                model: model,
            })
            const assistantMessage = chatCompletion.choices[0].message.content;
            setChatHistory(prev => [...prev, { role: 'assistant', content: assistantMessage }]);

        } catch (error) {
            console.error('Error fetching chat completion:', error)
            setError('Failed to get chat completion. Please check your input and model selection.')
        }
        setIsThinking(false)
    }


    useEffect(() => {
        fetchAvailableModels()
    }, [])

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

    return (
        <div className="bg-gradient-to-b from-gray-800 to-gray-900 text-white min-h-screen flex flex-col items-center p-4">
            <h1 className="text-4xl font-bold mb-12">Ollama Chat</h1>
            <div className="w-full max-w-6xl grid grid-cols-3 justify-items-center gap-4">
                <div className="col-start-1">
                    <div className="w-full max-w-2xl bg-gray-700 p-6 rounded-lg shadow-lg flex flex-col">
                        <div>
                            <h4 className="text-lg font-semibold">Select a model:</h4>
                            <select
                                value={modelName}
                                onChange={(e) => setmodelName(e.target.value)}
                                className="mt-2 w-full p-2 rounded bg-gray-600 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {availableModels.map((model, idx) => (
                                    <option key={idx} value={model}>
                                        {model}
                                    </option>
                                ))}
                            </select>
                            <small className="text-gray-400">(Pulled models will be shown here)</small>
                        </div>
                        {error && <p className="text-red-500 mt-2">{error}</p>}
                    </div>
                </div>

                <div className="w-full col-span-2 max-w-2xl bg-gray-700 p-6 rounded-lg shadow-lg flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold">Chat History</h4>
                        <button
                            onClick={() => setChatHistory([])}
                            className="bg-gray-500 hover:bg-gray-600 font-bold py-2 px-4 rounded"
                            >
                            Clear History
                        </button>
                    </div>
                    <div className="flex-grow overflow-y-auto min-h-0 max-h-[70vh] pr-4">
                        {chatHistory.map((message, index) => (
                            <div key={index} className={`flex my-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-3 rounded-lg ${message.role === 'user' ? 'bg-blue-600' : 'bg-gray-600'}`}>
                                    <p><strong>{message.role === 'user' ? 'You' : 'Assistant'}:</strong> {message.content}</p>
                                </div>
                            </div>
                        ))}
                        {isThinking && <p>Thinking...</p>}
                        <div ref={chatEndRef} />


                    </div>
                    <div className="flex flex-col items-end">
                        <textarea
                            className="w-3/5 p-2 rounded bg-gray-600 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    getChatCompletion(userInput, modelName);
                                }
                            }}
                            placeholder="Type your message here"
                        ></textarea>
                        <button
                            onClick={() => getChatCompletion(userInput, modelName)}
                            className="mt-4 bg-blue-600 hover:bg-blue-700 font-bold py-2 px-4 rounded"
                        >
                            Send
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}


