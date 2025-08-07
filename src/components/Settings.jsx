import APIPicker from "./APIPicker";
import "../styles/settings.scss"
import getDataDirectory from "../functions/getDataDirectory";
import DotTyping from "./DotTyping";
import pkg from '../../package.json'
import openURL from '../functions/openURL'
import saveError from "../functions/saveError";
import { createSignal, onMount } from "solid-js";
import getLatestPackage from "../functions/getLatestPackage";

export default function Settings(props) {
    const {setCurrentAPI, currentAPI} = props
    const [latestVersion, setLatestVersion] = createSignal(null)

    onMount(()=>{
        getLatestPackage().then(newPkg => {
            setLatestVersion(newPkg.version)
        }).catch(saveError)
    })
    const openLink = link => {
        openURL(link).catch(saveError)
    }
    return <div class="settings-panel">
        <h1>Settings</h1>
        <APIPicker setCurrentAPI={setCurrentAPI} currentAPI={currentAPI}/>
        <button onClick={()=>require('open-file-explorer')(getDataDirectory())}>Open Data Directory</button>
        <button onClick={()=>openLink("https://github.com/L1lith/Lilis-LLM-Chat")}>View Source Code on GitHub</button>
        <span>App Version: {pkg.version}{latestVersion() === null || latestVersion() === pkg.version ? '' : ' (Outdated)'}</span>
        <span>Latest App Version: {latestVersion() === null ? 'loading...' : latestVersion()}</span>
    </div>
}