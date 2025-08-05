// @ts-check
import { defineConfig } from "astro/config";
import solidJs from "@astrojs/solid-js";
//import { importToRequirePlugin } from "vite-plugin-import-to-require";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import getDataDirectory from "./src/functions/getDataDirectory";

// https://astro.build/config
export default defineConfig({
  integrations: [solidJs()],
  vite: {
    define: {
      "process.env.DATA_DIRECTORY": JSON.stringify(getDataDirectory()),
    },
    plugins: [
      // nodePolyfills({
      //   // To add only specific polyfills, add them here. If no option is passed, adds all polyfills
      //   include: ["path"],
      // }),
    ],
  },
});
