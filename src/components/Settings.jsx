import APIPicker from "./APIPicker";
import "../styles/settings.scss";
import DotTyping from "./DotTyping";
import pkg from "../../package.json";
import saveError from "../functions/saveError";
import { createSignal, onMount } from "solid-js";
import { openURL, openExplorer, getLatestPackage } from "../functions/fs";
import ToggleSwitch from "./ToggleSwitch";
import db from "../../database";

export default function Settings(props) {
  const { setCurrentAPI, currentAPI } = props;
  const [latestVersion, setLatestVersion] = createSignal(null);

  onMount(() => {
    getLatestPackage()
      .then((newPkg) => {
        setLatestVersion(newPkg.version);
      })
      .catch(saveError);
  });
  const openLink = (link) => {
    openURL(link).catch(saveError);
  };
  return (
    <div class="settings-panel">
      <h1>Settings</h1>
      <APIPicker setCurrentAPI={setCurrentAPI} currentAPI={currentAPI} />
      <div class="sound effects">
        <h3>Enable Sound Effects</h3>
        <ToggleSwitch
          activeByDefault={db.enableSoundEffects !== false}
          baseWidth="6em"
          onToggle={(active) => (db.enableSoundEffects = active)}
        />
      </div>
      <div class="info">
        <h2>~ Links & Info ~</h2>
        <nav class="links">
          <ul>
            <li>
              <button onClick={() => openLink("https://webslc.com/download-llm-chat-latest")}>
                Download Latest App Version
              </button>
            </li>
            <li>
              <button onClick={() => openExplorer(".")}>
                Open Data Directory
              </button>
            </li>
            <li>
              <button
                onClick={() =>
                  openLink("https://github.com/L1lith/Lilis-LLM-Chat")
                }
              >
                View Source Code on GitHub (and give me a star? it's free!)
              </button>
            </li>
            <li>
              {" "}
              <button
                onClick={() => openLink("https://github.com/L1lith/ESMV")}
              >
                View ESMV Eco-Friendly License (this app's license)
              </button>
            </li>
          </ul>
        </nav>
        <span>
          Your App Version: {pkg.version}
          {latestVersion() === null || latestVersion() === pkg.version
            ? ""
            : " (Outdated)"}
        </span>
        <span>
          Latest App Version:{" "}
          {latestVersion() === null ? "loading..." : latestVersion()}
        </span>
      </div>
      <div class="credits">
        <h2>Credits</h2>
        <span>Some of the sounds in this project were created by David Mckee (ViRiX) soundcloud.com/virix</span>
      </div>
    </div>
  );
}
