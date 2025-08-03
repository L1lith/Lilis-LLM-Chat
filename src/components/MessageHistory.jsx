export default function MessageHistory(props) {
    return <div class="messages">
        {props.messages().map(message => (
            <div class={"message " + (message.from)}>
                {message.content}
            </div>
            ))}
        </div>
}