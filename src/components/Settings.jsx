import APIPicker from "./APIPicker";
import "../styles/settings.scss"
import DotTyping from "./DotTyping";
import pkg from '../../package.json'
import saveError from "../functions/saveError";
import { createSignal, onMount } from "solid-js";
import getLatestPackage from "../functions/getLatestPackage";
import {openURL, openExplorer} from '../functions/fs'

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
        <button onClick={()=>openExplorer(".")}>Open Data Directory</button>
        <button onClick={()=>openLink("https://github.com/L1lith/Lilis-LLM-Chat")}>View Source Code on GitHub (and give me a star? it's free!)</button>
        <button onClick={()=>openLink("https://github.com/L1lith/ESMV")}>View ESMV Eco-Friendly License (this app's license)</button>
        <span>App Version: {pkg.version}{latestVersion() === null || latestVersion() === pkg.version ? '' : ' (Outdated)'}</span>
        <span>Latest App Version: {latestVersion() === null ? 'loading...' : latestVersion()}</span>
    </div>
}