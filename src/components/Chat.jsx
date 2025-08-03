import MessageHistory from "./MessageHistory"
import { createSignal } from "solid-js"
import Send from '../icons/send.svg?raw'
import "../styles/chat.scss"

export default function Chat() {
    let input = null
    const [messages, setMessages] = createSignal([])
    const [awaitingResponse, setAwaitingResponse] = createSignal(false)

    const handleSubmit = async e => {
        e.preventDefault()
        setMessages(messages().concat([{from: 'User', content: input.value}]))
        const prompt = input.value.trim()
        if (!prompt) return
        input.value=''
        setAwaitingResponse(true)
        let AIResponse
        try {
            AIResponse = await getAIResponse()
        } catch(err) {
            console.error(err)
            setMessages(messages().concat([{from: 'System', content: String(err)}]))
            setAwaitingResponse(false)
            return
        }
        setMessages(messages().concat([{from: 'AI', content: AIResponse}]))
        setAwaitingResponse(false)
    }
    const getAIResponse = async () => {
        await new Promise((res)=>setTimeout(res, 1500))
        return 'hi im a bot'
    }

    return <div class="chat">
        <MessageHistory messages={messages}/>
        <form class="prompter" onSubmit={handleSubmit}>
            <input class="prompt" disabled={awaitingResponse()} ref={input}/>
            <button type="submit"><div innerHTML={Send}></div></button>
        </form>
    </div>
}