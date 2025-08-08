import { createEffect, createSignal, onMount } from "solid-js";
import { format, compareAsc } from "date-fns"
import timeAgo from 'node-time-ago'
import searchDir from '../functions/searchDir'
import "../styles/conversationTray.scss"
import Pen from '../icons/pen.svg?raw'
import Checkmark from '../icons/checkmark.svg?raw'
import saveConversation from '../functions/saveConversation'
import saveError from '../functions/saveError'
import {readFile, join, rm} from '../functions/fs'

export default function ConversationTray(props) {
    const activeConversation = props.conversation
    const {setConversation, setActivePopup, setMessages} = props
  const [conversations, setConversations] = createSignal(null);
  const [editingConversationName, setEditingConversationName] = createSignal(null)
  let renameInput = null
  const sortConversations = conversations => {
    console.log(conversations)
    return conversations.sort((convoA, convoB) => (convoB.lastActive || convoB.created) - (convoA.lastActive || convoA.created))
  }
  onMount(async ()=>{
    const chatsPaths = await searchDir("chats", info => info.shortPath.endsWith('.json') && info.isFile)
    console.log(chatsPaths)
    const conversations = await Promise.all(chatsPaths.map(async chatPath => JSON.parse(await readFile(chatPath.fullPath, 'utf8'))))
    setConversations(sortConversations(conversations))
  })
  createEffect(()=>{
    editingConversationName()
    if (renameInput) renameInput.focus()
  })
  const viewConversation = conversation=>{
    setConversation(conversation)
    setMessages(conversation.messages)
    setActivePopup(null)
  }
  const deleteConversation = conversation=>{
    if (activeConversation()?.id === conversation.id) setConversation(null)
    setConversations(sortConversations(conversations().filter(check => check.id !== conversation.id)))
    const chatFile = join('chats', conversation.id + '.json')
    rm(chatFile).catch(error => {
      console.error(error)
      saveError(error)
    })
  }

  const onInputKeyDown = (e, conversation) => {
    if (e.key === 'Enter') {
        doRename(conversation)
    }
  }
  const doRename = conversation => {
    const newName = renameInput.value.trim()
    if (!newName) return
    conversation.name = newName
    saveConversation(conversation)
    setEditingConversationName(null)
  }

  return (
    <div class="conversation-tray">
      <h1>Conversations</h1>
      {conversations() === null ? (
        <span>Loading...</span>
      ) : (
        <table class="conversations">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Last Active</th>
                    <th>Created</th>
                    <th>ID</th>
                    <th>Actions</th>
                </tr>
            </thead>
          <For each={conversations()}>{(conversation, i) => <tr class={"conversation" + (activeConversation()?.id === conversation.id ? ' active' : '')}>
                <td>{editingConversationName() === conversation.id ? <><input onLoad={console.log} onKeyDown={e => onInputKeyDown(e, conversation)} placeholder="enter a name" ref={renameInput} class="naming"/><div class="finish-rename" onClick={()=>doRename(conversation)} innerHTML={Checkmark}></div></> : (<>{conversation.name || "Untitled"}<div class="rename" onClick={()=>setEditingConversationName(conversation.id)} innerHTML={Pen}></div></>)}</td>
                <td>{timeAgo(conversation.lastActive || conversation.created)}</td>
                <td>{format(new Date(conversation.created), 'MMM do, Y')}</td>
                <td>{conversation.id.substring(0, 3)}...{conversation.id.substring(conversation.id.length - 3)}</td>
                <td class="controls"><button onClick={()=>viewConversation(conversation)}>View</button><button onClick={()=>deleteConversation(conversation)}>Delete</button></td>
            </tr>}</For>
        </table>
      )}
    </div>
  );
}
