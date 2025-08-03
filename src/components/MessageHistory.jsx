import { createEffect } from "solid-js"

export default function MessageHistory(props) {
    let inner = null
    createEffect(()=>{
        props.messages()
        inner.scrollTop = inner.scrollHeight;
    })
    return <div class="messages">
                <div ref={inner} class="inner">
                    {props.messages().map(message => (
                <div class={"message " + (message.from.toLowerCase())}>
                    <span class="author">{message.from}</span>
                    <span class="content">{message.content.trim()}</span>
                </div>
                ))}
                </div>
        </div>
}