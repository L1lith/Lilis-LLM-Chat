export default function MessageHistory(props) {
    return <div class="messages">
                <div class="inner">
                    {props.messages().map(message => (
                <div class={"message " + (message.from.toLowerCase())}>
                    <span class="author">{message.from}</span>
                    <span class="content">{message.content}</span>
                </div>
                ))}
                </div>
        </div>
}