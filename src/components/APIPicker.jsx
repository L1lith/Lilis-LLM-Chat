import { createEffect, createSignal } from "solid-js";
import Add from '../icons/add.svg?raw'
import Trash from '../icons/trash.svg?raw'
import isValidURL from "../functions/isValidURL";
import db from "../../database";

export default function APIPicker() {
  const [APIList, setAPIList] = createSignal(db.APIs || []);
  const [currentView, setCurrentView] = createSignal(null)
  const [formError, setFormError] = createSignal(null)
  let apiURLRef = null
  let apiKeyRef = null
  let apiNameRef = null

  createEffect(()=>{
    db.APIs = APIList() // Automatically sync the APIList to the file system
  })

  const resetView = ()=>{
    setCurrentView(null)
    setFormError(null)
  }

  const addNewAPI = e=>{
    e.preventDefault()
    const URL = apiURLRef.value.trim()
    const key = apiKeyRef.value.trim()
    const name = apiNameRef.value.trim()
    const formData = {URL, key, name}
    const foundFormError = getFormError(formData)
    setFormError(foundFormError)
    if (foundFormError) return // Don't let the form submit if the data is invalid
    // We've received a seemingly valid API config let's add it to the list now     
    setAPIList(APIList().concat([formData]))
    setCurrentView(null)
  }

  const getFormError = formData => {
    if (!formData.URL) return "Please supply an API URL"
    if (!isValidURL(formData.URL)) return "API URL is not a valid URL"
    if (!formData.key) return "Please supply an API Key"
    return null
  }
  
  const deleteAPI = (api) => {
    setAPIList(APIList().filter(apiItem => apiItem !== api))
  }
  

  const renderContent = ()=>{
    if (currentView() === "add-api") {
    return <form onSubmit={addNewAPI}>
      <h1>Add an API</h1>
      {formError() ? <span class="error">Error: {formError()}</span> : null}
      <label for="api-url">Base URL*</label>
      <input ref={apiURLRef} id="api-url"/>
      <label for="api-key">Private Key*</label>
      <input ref={apiKeyRef} id="api-key"/>
      <label for="api-name">Name</label>
      <input ref={apiNameRef} id="api-name"/>
      <div class="controls">
        <button type="submit">Save API</button>
        <button onClick={resetView}>Cancel</button>
      </div>
    </form>
    } else if (currentView() == 'loading') {
      return <span>Loading APIs...</span>
  } else {
    return (
    <>
      <h2>APIs</h2>
      {<>
            {APIList().length < 1 ? <span>No APIs yet. Press the + icon to add a new one.</span> : (
        <ul class="api-list">
          {APIList().map((api, i) => (
            <li class="api">
              <span class="title">- {api.name || `API #${i + 1}`} -</span>
              <span class="url"><strong>URL:</strong> {api.URL}</span>
              <span class="key"><strong>Key:</strong> {api.key}</span>
              <div onClick={()=>{deleteAPI(api);}} class="delete-api" innerHTML={Trash}></div>
            </li>
          ))}
        </ul>
      )}
      <div onClick={()=>{setCurrentView('add-api');}} class="add" innerHTML={Add}></div>
      </>}
    </>
  );
  }
  }
  return <div class={"api-picker " + (currentView() || 'main')}>{renderContent()}</div>
}

