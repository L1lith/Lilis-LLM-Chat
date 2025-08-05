import { createSignal, onMount } from "solid-js";
import { format, compareAsc } from "date-fns"
import timeAgo from 'node-time-ago'
import searchDir from '../functions/searchDir'
import getDataDirectory from "../functions/getDataDirectory";
import "../styles/conversationTray.scss"

export default function ConversationTray(props) {
    const {setConversation, setActivePopup, setMessages} = props
  const [conversations, setConversations] = createSignal(null);
  onMount(async ()=>{
    const {join} = require('path')
    const chatsPaths = await searchDir(join(getDataDirectory(), 'chats'), info => console.log(info)||info.shortPath.endsWith('.json') && info.isFile)
    console.log(chatsPaths, join(getDataDirectory(), 'chats'))
    const {readFile} = require('fs/promises')
    const conversations = await Promise.all(chatsPaths.map(async chatPath => JSON.parse(await readFile(chatPath.fullPath, 'utf8'))))
    setConversations(conversations)
  })
  const viewConversation = conversation=>{
    setConversation(conversation)
    setMessages(conversation.messages)
    setActivePopup(null)
  }
  const deleteConversation = conversation=>{

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
          <For each={conversations()}>{(conversation, i) => <tr>
                <td>{conversation.name || "Untitled"}</td>
                <td>{timeAgo(conversation.lastActive || conversation.created)}</td>
                <td>{format(new Date(conversation.created), 'MMM do, Y')}</td>
                <td>{conversation.id.substring(0, 3)}...{conversation.id.substring(conversation.id.length - 3)}</td>
                <td><button onClick={()=>viewConversation(conversation)}>View</button><button onClick={()=>deleteConversation(conversation)}>Delete</button></td>
            </tr>}</For>
        </table>
      )}
    </div>
  );
}
