import "../styles/modelPicker.scss";

function abbreviateContextLength(contextLength) {
  if (contextLength >= 1000000) {
    return Math.round(contextLength / 100000) / 10 + 'm'
  } else if (contextLength >= 1000) {
    return Math.round(contextLength / 100) / 10 + 'k'
  }
  return contextLength
}

export default function ModelPicker({ modelChoices, onModelSelect }) {
  return (
    <div class="model-picker">
      <h1>Pick a model:</h1>
      <ul>
        <For
          each={modelChoices().sort((a, b) => {
            return a.display_name.localeCompare(b.display_name, "en", {
              numeric: true,
            });
          })}
        >
          {(model) => (
            <li onClick={() => onModelSelect(model)}>{model.display_name}{model.context_length ? ', ' + abbreviateContextLength(model.context_length) + ' tokens' : ''}</li>
          )}
        </For>
      </ul>
    </div>
  );
}
