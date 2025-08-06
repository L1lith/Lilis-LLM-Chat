import APIPicker from "./APIPicker";
import "../styles/settings.scss"
import getDataDirectory from "../functions/getDataDirectory";
import toggleSwitch from './ToggleSwitch'
import ToggleSwitch from "./ToggleSwitch";

export default function Settings() {
    return <div class="settings-panel">
        <h1>Settings</h1>
        <APIPicker/>
        <button onClick={()=>require('open-file-explorer')(getDataDirectory())}>Open Data Directory</button>      
        <ToggleSwitch/>
    </div>
}