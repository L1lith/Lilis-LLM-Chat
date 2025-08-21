import MessageList from "./MessageList";
import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
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
import ModelPicker from "./ModelPicker";
import DotTyping from "./DotTyping";
import convertMessagesToOpenAIFormat from "../functions/convertMessagesToOpenAIFormat";
import saveError from "../functions/saveError";
import pkg from "../../package.json";
import { mkdir, randomUUID, openAIRequest, getLatestPackage } from "../functions/fs";
import syncToJSON from "../functions/syncToJSON";
import db from "../../database";
import { openURL } from "../functions/fs";
import getWindow from "../functions/getWindow";

function getStartingAPI() {
  if (!db.currentAPI || db.currentAPI === "null") return null;
  return db.APIs.find((api) => api.id === db.currentAPI) || null;
}

export default function Chat() {
  let input = null;
  let inputValueCache = ''
  let submitButton = null;
  const [activePopup, setActivePopup] = createSignal(null);
  const [messages, setMessages] = createSignal([]);
  const [awaitingResponse, setAwaitingResponse] = createSignal(false);
  const [conversation, setConversation] = createSignal(null);
  const [currentAPI, setCurrentAPI] = createSignal(null);
  const [currentModel, setCurrentModel] = createSignal(null);
  const [statusMessages, setStatusMessages] = createSignal([]);
  const [modelChoices, setModelChoices] = createSignal(null);
  const [AIThinking, setAIThinking] = createSignal(false);
  const [files, setFiles] = createSignal([])

  let messageSound
  let errorSound

  const ensureLogoTextDisplayedCorrectly = ()=>{
    const logoTextEl = document.getElementById('logo-text')
    if (!logoTextEl) return console.warn('Unable to identify the logo text element')
    if (db.enableLogoText !== false) {
      // We make it invisible and short so it will still take up some space to ensure
      // the messages don't go underneath the settings and conversation tray icons
      logoTextEl.style.removeProperty('opacity')
      logoTextEl.style.removeProperty('height')
    } else {
      logoTextEl.style.opacity = 0
      logoTextEl.style.height = '1em'
    }
  }

  onMount(()=>{
    db.on('enableLogoText', ensureLogoTextDisplayedCorrectly)
  })

  const dropListener = event => {
      event.preventDefault();
      console.log('droppable!')
      if (activePopup() !== null) return // Don't allow uploading files while in popups
      const file = event.dataTransfer.files[0]; // Just taking the first one
     
      if (files().some(sFile => sFile.path === file.path)) return // File already in memory
      const fileObject = {
        path: file.path,
        name: file.name,
        type: file.type
      }
      setFiles(files().concat([fileObject]))
    }
  const dragListener = e => e.preventDefault()

  onMount(()=>{
    console.log('found window?', getWindow())
    if (getWindow()) {
      document.addEventListener('drop', dropListener);
      document.addEventListener('dragover', dragListener);
    }
  })
  onCleanup(()=>{
    if (getWindow()) {
      document.removeEventListener('drop', dropListener);
      document.removeEventListener('dragover', dragListener);
    }
  })

  createEffect(()=>{
    if (activePopup() === null) {
      input.value = inputValueCache // Load the last typed message back into the input field
      autoFocus() // Focus the typing field
    }
  })
  createEffect(() => {
    if (currentAPI() && currentAPI !== "null") {
      openAIRequest(currentAPI(), "models.list")
        .then((data) => {
          setModelChoices(data.body.filter((model) => model.type === "chat"));
          const {lastUsedModelID} = currentAPI()
          if (lastUsedModelID) {
            const matchedModel = modelChoices().find(model => model.id === lastUsedModelID)
            if (matchedModel) {
              setCurrentModel(matchedModel)
            } else {
              createStatusMessage("The last used model is not available currently.", 'info', 3000)
            }
          }
          console.log("got models", data.body);
        })
        .catch(handleError);
    } else {
      setModelChoices(null);
      setCurrentModel(null);
    }
  });

  const handleError = (error) => {
    console.error(error);
    createStatusMessage(
      (String(error).startsWith("Error: ") ? "" : "Error: ") + String(error),
      "error",
      5000
    );
    if (db.enableSoundEffects !== false) errorSound.play();
    saveError(error).catch(console.error);
  };

  onMount(() => {
    messageSound = new Audio('./sounds/decline.wav');
    messageSound.volume = 0.4
    errorSound = new Audio('./sounds/error.wav')
    errorSound.volume = 0.8
    syncToJSON(db, "lilis-llm-chat-config-private.json")
      .then((dbReady) => {
        const startingAPI = getStartingAPI()
        setCurrentAPI(startingAPI);
      })
      .catch(handleError);
    document.addEventListener("click", (e) => {
      let target = e.target.closest("a");
      if (target) {
        const url = target.getAttribute("href")
        if (url) {
          e.preventDefault()
          openURL(url)
        }
      }
    });
    window.db = db;
    mkdir("chats");
    getLatestPackage()
      .then((newPkg) => {
        console.log("got package", newPkg, pkg.version, newPkg.version);
        if (newPkg.version !== pkg.version) {
          createStatusMessage(
            `Your app is outdated. Your version: ${pkg.version}, latest version: ${newPkg.version}`,
            "info",
            10000
          );
        }
      })
      .catch(handleError);
  });

  const autoFocus = () => {
    if (activePopup() !== null) return;
    input.focus();
  };
  const clearInput = ()=>{
    input.value = ''
    inputValueCache = ''
  }

  onMount(() => {
    if (getWindow()) {
      window.addEventListener("focus", autoFocus);
      autoFocus();
    }
  });
  onCleanup(() => {
    if (getWindow()) {
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
    if (convo === null) {
      convo = { created: Date.now(), messages: [], id: crypto.randomUUID() };
    }
    if (!("created" in message)) message.created = Date.now();
    message.id = randomUUID();
    convo.messages = convo.messages.concat([message]);
    convo.lastActive = Date.now();
    setMessages(convo.messages);
    setConversation(convo);
    saveConversation(convo).catch(handleError)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const prompt = input.value.trim();
    if (!prompt.trim()) return;
    if (currentAPI() === null) {
      return handleError("You must create and select an API in the settings");
    }

    if (currentModel() === null) {
      return handleError("You must select a model, click the robot");
    }

    appendNewMessage({ from: "User", content: input.value, files: files() });
    setFiles([])
    clearInput()
    autoAdjustInputHeight();
    setAwaitingResponse(true);
    let AIResponse;
    try {
      AIResponse = await getAIResponse();
    } catch (err) {
      handleError(err);
      //appendNewMessage({ from: "System", content: String(err), type: "error" });
      setAwaitingResponse(false);
      autoFocus();
      return;
    }
    appendNewMessage({ from: "AI", content: AIResponse });
    if (db.enableSoundEffects !== false) messageSound.play();
    setAwaitingResponse(false);
    autoFocus();
  };
  const getAIResponse = async () => {
    if (
      !currentAPI() ||
      currentAPI() === "null" ||
      !currentModel ||
      !Array.isArray(messages() || messages().length < 1)
    )
      throw new Error("Missing the model or the API or the messages.");
    setAIThinking(true);
    let response;
    try {
      response = await openAIRequest(currentAPI(), "chat.completions.create", {
        model: currentModel().id,
        messages: convertMessagesToOpenAIFormat(messages()),
      });
    } catch (error) {
      handleError(error);
      setAIThinking(false);
      throw error;
    }
    setAIThinking(false);
    return response.choices[0].message.content;
  };
  let isShiftDown = false;
  const handleKeyDown = (event) => {
    const { key } = event;
    if (key === "Shift") {
      isShiftDown = true;
    } else if (key === "Enter") {
      if (!isShiftDown /*&& !input.value.includes('\n')*/) {
        event.preventDefault();
        // Trigger Submit
        submitButton.click();
      }
    }
    //console.log('down', key, isShiftDown)
  };
  const handleKeyUp = ({ key }) => {
    if (key === "Shift") {
      isShiftDown = false;
    }
    //console.log('up', key, isShiftDown)
  };
  const onInput = () => {
    inputValueCache = input.value
    autoAdjustInputHeight()
  };
  const autoAdjustInputHeight = ()=>{
    input.style.height = "";
    input.style.height = `min(calc(${input.scrollHeight}px - 2em), 30vh)`;
  }
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
      currentPopupElement = (
        <Settings setCurrentAPI={setCurrentAPI} currentAPI={currentAPI} />
      );
    } else if (activePopup() === "model-picker") {
      currentPopupElement = (
        <ModelPicker
          currentModel={currentModel}
          modelChoices={modelChoices}
          onModelSelect={(model) => {
            setCurrentModel(model);
            setActivePopup(null);
          }}
        />
      );
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
    } else if (!Array.isArray(modelChoices()) || modelChoices().length < 1) {
      createStatusMessage("Error loading the model choices", "error", 5000);
    } else {
      setActivePopup("model-picker");
    }
    // Todo: Fetch the model choices, then set the model choices
  };

  const resetChat = () => {
    setConversation(null);
    setMessages([]);
    setFiles([])
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
                  "model-selector " +
                  (currentAPI() === null
                    ? "error"
                    : currentModel() === null
                    ? "ready"
                    : "active")
                }
              >
                <span innerHTML={AIChat} />
                {AIThinking() ? (
                  <span class="dots">
                    <DotTyping />
                  </span>
                ) : null}
              </button>
            </span>
            <textarea
              onInput={onInput}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              class="prompt"
              disabled={awaitingResponse()}
              ref={input}
            />
            <span className="toolbar right">
              <button innerHTML={Send} ref={submitButton} type="submit" />
              <button type="button" onClick={resetChat} innerHTML={Refresh}/>
            </span>
          </form>
        </>
      )}
    </div>
  );
}
