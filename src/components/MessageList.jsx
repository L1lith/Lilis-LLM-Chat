import { createEffect } from "solid-js";
import {marked} from 'marked'
import DOMPurify from 'dompurify'

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
              <div class="content" innerHTML={DOMPurify.sanitize(marked.parse(message.content.trim()))}/>
            </li>
          )}
        </For>
      </ol>
    </div>
  );
}
