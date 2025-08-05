import { createEffect } from "solid-js";

export default function MessageList(props) {
  let inner = null;
  createEffect(() => {
    props.messages();
    inner.scrollTop = inner.scrollHeight;
  });
  return (
    <div class="messages">
      <ol ref={inner} class="inner">
        <For each={props.messages() || []}>
          {(message, i) => (
            <li class={"message " + message.from.toLowerCase()}>
              <span class="author">{message.from}</span>
              <span class="content">{message.content.trim()}</span>
            </li>
          )}
        </For>
      </ol>
    </div>
  );
}
