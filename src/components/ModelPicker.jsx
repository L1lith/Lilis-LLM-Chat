import "../styles/modelPicker.scss"

export default function ModelPicker({modelChoices, onModelSelect}) {
    return <div class="model-picker">
        <h1>Pick a model:</h1>
        <ul>
            <For each={modelChoices()}>
                {model => (<li onClick={()=>onModelSelect(model)}>
                    {model.display_name}
                </li>)}
            </For>
        </ul>
    </div>
}