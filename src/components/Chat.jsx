import MessageHistory from "./MessageHistory"
import { createSignal } from "solid-js"
import Send from '../icons/send.svg?raw'
import "../styles/chat.scss"

export default function Chat() {
    let input = null
    let submitButton = null
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
    let isShiftDown = false
    const handleKeyDown = ({key})=>{
        if (key === "Shift") {
            isShiftDown = true
        } else if (key === "Enter") {
            if (!isShiftDown && !input.value.includes('\n')) {
                // Trigger Submit
                submitButton.click()
            }
        }
    }
    const handleKeyUp = ({key})=>{
        if (key === "Shift") {
            isShiftDown = false
        }
    }

    return <div class="chat">
        <MessageHistory messages={messages}/>
        <form class="prompter" onSubmit={handleSubmit}>
            <textarea onInput={function(){this.style.height = "";this.style.height = `min(calc(${this.scrollHeight}px - 2em), 30vh)`}} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} class="prompt" disabled={awaitingResponse()} ref={input}/>
            <button ref={submitButton} type="submit"><div innerHTML={Send}></div></button>
        </form>
    </div>
}