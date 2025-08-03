import MessageHistory from "./MessageHistory"
import { createSignal, onCleanup, onMount } from "solid-js"
import Send from '../icons/send.svg?raw'
import Settings from '../icons/settings.svg?raw'
import Inbox from '../icons/inbox.svg?raw'
import "../styles/chat.scss"

export default function Chat() {
    let input = null
    let submitButton = null
    const [chatUnfocused, setChatUnfocused] = createSignal(false)
    const [messages, setMessages] = createSignal([])
    const [awaitingResponse, setAwaitingResponse] = createSignal(false)


    const autoFocus = () => {
        if (chatUnfocused()) return
        input.focus()
    };
    onMount(()=>{
        if (typeof global?.window !== 'undefined') {
            window.addEventListener('focus', autoFocus)
        }
    })
    onCleanup(()=>{
        if (typeof global?.window !== 'undefined') {
            window.removeEventListener('focus', autoFocus)
        }
    })

    const handleSubmit = async e => {
        e.preventDefault()
        setMessages(messages().concat([{from: 'User', content: input.value}]))
        const prompt = input.value.trim()
        if (!prompt.trim()) return
        input.value=''
        autoAdjustInputHeight()
        setAwaitingResponse(true)
        let AIResponse
        try {
            AIResponse = await getAIResponse()
        } catch(err) {
            console.error(err)
            setMessages(messages().concat([{from: 'System', content: String(err)}]))
            setAwaitingResponse(false)
            autoFocus()
            return
        }
        setMessages(messages().concat([{from: 'AI', content: AIResponse}]))
        setAwaitingResponse(false)
        autoFocus()
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
    const autoAdjustInputHeight = ()=>{
        input.style.height = "";input.style.height = `min(calc(${input.scrollHeight}px - 2em), 30vh)`
    }

    return <div class="chat">
        <div class="inbox" innerHTML={Inbox}></div>
        <div class="settings" innerHTML={Settings}></div>
        <MessageHistory messages={messages}/>
        <form class="prompter" onSubmit={handleSubmit}>
            <textarea onInput={autoAdjustInputHeight} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} class="prompt" disabled={awaitingResponse()} ref={input}/>
            <button ref={submitButton} type="submit"><div innerHTML={Send}></div></button>
        </form>
    </div>
}