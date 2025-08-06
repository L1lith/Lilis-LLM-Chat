import MessageList from "./MessageList";
import { createSignal, onCleanup, onMount} from "solid-js";
import Send from "../icons/send.svg?raw";
import Refresh from "../icons/refresh.svg?raw";
import SettingsIcon from "../icons/settings.svg?raw";
import cancel from "../icons/cancel.svg?raw";
import AIChat from "../icons/ai-chat.svg?raw";
import Inbox from "../icons/inbox.svg?raw";
import "../styles/chat.scss";
import ConversationTray from "./ConversationTray";
import Settings from "./Settings";
import saveConversation from "../functions/saveConversation";
import db from '../../database'

function getStartingAPI() {
    if (!db.currentAPI || db.currentAPI === "null") return null
    return db.APIs.find(api => api.id === db.currentAPI) || null
}

export default function Chat() {
  let input = null;
  let submitButton = null;
  const [activePopup, setActivePopup] = createSignal(null);
  const [messages, setMessages] = createSignal([]);
  const [awaitingResponse, setAwaitingResponse] = createSignal(false);
  const [conversation, setConversation] = createSignal(null);
  const [currentAPI, setCurrentAPI] = createSignal(null);
  const [currentModel, setCurrentModel] = createSignal(null);
  const [statusMessages, setStatusMessages] = createSignal([]);

  let conversationsDir = null;

  onMount(() => {
    const { join } = require("path");
    const { mkdirSync } = require("fs");
    setCurrentAPI(getStartingAPI())
    conversationsDir = join(process.env.DATA_DIRECTORY, "chats");
    mkdirSync(conversationsDir, { recursive: true });
    createStatusMessage("disappearing in 3 seconds", "info", 3000);
  });

  const autoFocus = () => {
    if (activePopup() !== null) return;
    input.focus();
  };
  onMount(() => {
    if (typeof global?.window !== "undefined") {
      window.addEventListener("focus", autoFocus);
      autoFocus();
    }
  });
  onCleanup(() => {
    if (typeof global?.window !== "undefined") {
      window.removeEventListener("focus", autoFocus);
    }
  });
  const createStatusMessage = (
    message,
    type = "info",
    lifeSpan = 3000,
    avoidRedundantMessages = true
  ) => {
    if (
      avoidRedundantMessages &&
      statusMessages().some(
        (checkM) => checkM.message === message && checkM.type === type
      )
    )
      return; // There's already a message being displayed for this
    if (typeof message != "string")
      throw new Error("Expected a status message");
    if (!["info", "error"].includes(type))
      throw new Error("Invalid Status Message Type");
    if (isNaN(lifeSpan) || lifeSpan < 1)
      throw new Error("Invalid Status message lifespan");
    const statusMessage = { message, type, lifeSpan };
    setStatusMessages(statusMessages().concat(statusMessage));
    if (lifeSpan < Infinity) {
      setTimeout(() => {
        setStatusMessages(
          statusMessages().filter((compareM) => compareM !== statusMessage)
        );
      }, lifeSpan);
    }
  };
  const appendNewMessage = (message) => {
    let convo = conversation();
    const crypto = require("crypto");
    if (convo === null) {
      convo = { created: Date.now(), messages: [], id: crypto.randomUUID() };
    }
    if (!("created" in message)) message.created = Date.now();
    message.id = crypto.randomUUID();
    convo.messages = convo.messages.concat([message]);
    convo.lastActive = Date.now();
    setMessages(convo.messages);
    setConversation(convo);
    saveConversation(convo);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const prompt = input.value.trim();
    if (!prompt.trim()) return;
    if (currentAPI() === null) {
      return createStatusMessage(
        "You must create and select an API in the settings",
        "error",
        5000
      );
    }

    if (currentModel() === null) {
      return createStatusMessage("You must select a model", "error", 5000);
    }

    appendNewMessage({ from: "User", content: input.value });
    input.value = "";
    autoAdjustInputHeight();
    setAwaitingResponse(true);
    console.log("awaiting AI response");
    let AIResponse;
    try {
      AIResponse = await getAIResponse();
    } catch (err) {
      console.error(err);
      createStatusMessage(String(err), "error", 8000);
      //appendNewMessage({ from: "System", content: String(err), type: "error" });
      setAwaitingResponse(false);
      autoFocus();
      return;
    }
    appendNewMessage({ from: "AI", content: AIResponse });
    console.log("got ai response");
    setAwaitingResponse(false);
    autoFocus();
  };
  const getAIResponse = async () => {
    await new Promise((res) => setTimeout(res, 1500));
    return "hi im a bot";
  };
  let isShiftDown = false;
  const handleKeyDown = ({ key }) => {
    if (key === "Shift") {
      isShiftDown = true;
    } else if (key === "Enter") {
      if (!isShiftDown /*&& !input.value.includes('\n')*/) {
        // Trigger Submit
        submitButton.click();
      }
    }
  };
  const handleKeyUp = ({ key }) => {
    if (key === "Shift") {
      isShiftDown = false;
    }
  };
  const autoAdjustInputHeight = () => {
    input.style.height = "";
    input.style.height = `min(calc(${input.scrollHeight}px - 2em), 30vh)`;
  };
  const renderPopup = () => {
    if (activePopup() === null) return;
    let currentPopupElement = null;
    if (activePopup() === "conversationTray") {
      currentPopupElement = (
        <ConversationTray
          conversation={conversation}
          setConversation={setConversation}
          setActivePopup={setActivePopup}
          setMessages={setMessages}
        />
      );
    } else if (activePopup() === "settings") {
      currentPopupElement = <Settings setCurrentAPI={setCurrentAPI} currentAPI={currentAPI} />;
    } else {
      throw new Error("Invalid Popup Name");
    }
    return (
      <span class="popup">
        <div
          onClick={() => setActivePopup(null)}
          class="close"
          innerHTML={cancel}
        ></div>
        {currentPopupElement}
      </span>
    );
  };

  const selectModel = () => {
    if (currentAPI() === null) {
      createStatusMessage(
        "You must create and select an API in the settings",
        "error",
        5000
      );
    }
  };

  const resetChat = () => {
    setConversation(null);
    setMessages([]);
  };

  return (
    <div class="chat">
      {activePopup() ? (
        renderPopup()
      ) : (
        <>
          <div
            onClick={() => setActivePopup("conversationTray")}
            class="inbox"
            innerHTML={Inbox}
          ></div>
          <div
            onClick={() => setActivePopup("settings")}
            class="settings"
            innerHTML={SettingsIcon}
          ></div>
          <MessageList messages={messages} />
          <form class="prompter" onSubmit={handleSubmit}>
            <ol class="status-messages">
              <For each={statusMessages()}>
                {(statusMessage) => (
                  <li
                    class={"status-message " + (statusMessage.type || "info")}
                  >
                    {statusMessage.message}
                  </li>
                )}
              </For>
            </ol>
            <span className="toolbar left">
              <button
                onClick={selectModel}
                class={
                  "model-selector" +
                  (currentAPI() === null || currentModel() === null
                    ? " error"
                    : "")
                }
                innerHTML={AIChat}
              ></button>
            </span>
            <textarea
              onInput={autoAdjustInputHeight}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              class="prompt"
              disabled={awaitingResponse()}
              ref={input}
            />
            <span className="toolbar right">
              <button innerHTML={Send} ref={submitButton} type="submit" />
              <button onClick={resetChat} innerHTML={Refresh}></button>
            </span>
          </form>
        </>
      )}
    </div>
  );
}
