// @ts-check
import { defineConfig } from "astro/config";
import solidJs from "@astrojs/solid-js";
//import { importToRequirePlugin } from "vite-plugin-import-to-require";
import { join } from "path";
import electron from "astro-electron";

// const userDataDirectory = join(
//   process.env.APPDATA ||
//     (process.platform == "darwin"
//       ? process.env.HOME + "/Library/Preferences"
//       : process.env.HOME + "/.local/share"),
//   "Lili's LLM Chat"
// );

// https://astro.build/config
export default defineConfig({
  integrations: [
    solidJs(),
    electron({
      main: { entry: "app/main.js" },
      preload: { input: "app/preload.js" },
    }),
  ],
  output: "static",
  // vite: {
  //   define: {
  //     //"process.env.DATA_DIRECTORY": JSON.stringify(userDataDirectory),
  //   },
  //   plugins: [
  //     // nodePolyfills({
  //     //   // To add only specific polyfills, add them here. If no option is passed, adds all polyfills
  //     //   include: ["path"],
  //     // }),
  //   ],
  // },
});
