import "../styles/modelPicker.scss";
import Search from '../icons/search.svg?raw'
import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import db from "../../database";

function abbreviateContextLength(contextLength) {
  if (contextLength >= 1000000) {
    return Math.round(contextLength / 100000) / 10 + 'm'
  } else if (contextLength >= 1000) {
    return Math.round(contextLength / 100) / 10 + 'k'
  }
  return contextLength
}

export default function ModelPicker({ modelChoices, onModelSelect, currentModel}) {
  const [currentSearch, setCurrentSearch] = createSignal("")
  const [filteredModels, setFilteredModels] = createSignal(modelChoices())

  createEffect(()=>{
    window.models = modelChoices()
    if (currentSearch().trim().length > 0) {
      setFilteredModels(modelChoices().filter(model => model.display_name.toLowerCase().trim().includes(currentSearch().trim().toLowerCase())))
    } else {
      setFilteredModels(modelChoices())
    }
  })
  let searchInput
  let modelPicker

  const setLastUsedModel = model => {
    const newAPIs = [...db.APIs]
    const currentAPI = newAPIs.find(api => api.id === db.currentAPI)
    if (!currentAPI) throw new Error("Unable to find active API")
    if (model?.id) {
      currentAPI.lastUsedModelID = model?.id
    } else {
      delete currentAPI.lastUsedModelID
    }
    db.APIs = newAPIs // Trigger save
  }
  
  const currentModelID = currentModel()?.id 
  const focusListener = ()=>{
    searchInput.focus()
  }
  onMount(()=>{
    searchInput.focus()
    window.addEventListener('focus', focusListener)
  })
  onCleanup(()=>{
    window.removeEventListener('focus', focusListener)
  })
  return (
    <div ref={modelPicker} class="model-picker">
      <h1>Pick a model:</h1>
      <span class="search">
        <input ref={searchInput} onInput={e => {setTimeout(()=>{modelPicker.scrollTop = 0}, 0); setCurrentSearch(e.target.value)}} onFocusOut={()=>{searchInput.focus()}}/>
          <div
            onClick={() => searchInput.focus()}
            class="icon"
            innerHTML={Search}
          ></div>
      </span>
      <ul>
        <For
          each={filteredModels().sort((a, b) => {
            return a.display_name.localeCompare(b.display_name, "en", {
              numeric: true,
            });
          })}
        >
          {(model) => (
            <li class={"model" + (currentModelID && currentModelID === model.id ? ' active' : '')} onClick={() => {setLastUsedModel(model); onModelSelect(model)}}>{model.display_name}{model.context_length ? ', ' + abbreviateContextLength(model.context_length) + ' tokens' : ''}</li>
          )}
        </For>
      </ul>
    </div>
  );
}
