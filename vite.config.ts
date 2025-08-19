import { defineConfig } from "vite";

import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";

const DEFAULT_PORT = 3000;

export default defineConfig({
  server: { port: parseInt(process.env.PORT || DEFAULT_PORT.toString(), 10) },
  ssr: { noExternal: ["react-dropzone"] },
  plugins: [
    tailwindcss(),
    tsConfigPaths(),
    tanstackStart({ target: "node-server", customViteReactPlugin: true }),
    viteReact(),
  ],
});
