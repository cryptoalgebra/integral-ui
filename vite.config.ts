import { enabledModules } from "./config";
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import eslint from "vite-plugin-eslint";
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";

const disabledModules = Object.entries(enabledModules)
    .filter(([, isEnabled]) => !isEnabled)
    .map(([key]) => ({
        key,
        moduleDir: key,
    }));

const disabledAliases = disabledModules.map(({ moduleDir }) => ({
    find: new RegExp(`^src/modules/${moduleDir}`),
    replacement: path.resolve(__dirname, "src/modules/__empty_module.ts"),
}));

function ignoreDisabledModules(dirs: string[]) {
    const emptyModulePath = path.resolve(__dirname, "src/modules/__empty_module.ts");
    const emptyModuleCode = fs.readFileSync(emptyModulePath, "utf-8");

    return {
        name: "ignore-disabled-modules",
        load(id: string) {
            for (const dir of dirs) {
                if (id.includes(`/src/modules/${dir}/`)) {
                    return emptyModuleCode;
                }
            }
            return null;
        },
    };
}

if (disabledModules.length > 0) {
    console.log("🔌 [VITE] Disabled modules replaced with __empty_module.ts:");
    for (const { key, moduleDir } of disabledModules) {
        console.log(`   - ${key} → src/modules/${moduleDir} (replaced with src/modules/__empty_module.ts)`);
    }
} else {
    console.log("✅ [VITE] All modules are enabled");
}

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        ignoreDisabledModules(disabledModules.map((m) => m.moduleDir)),
        eslint({
            emitWarning: false,
            emitError: true,
            failOnWarning: false,
            failOnError: true,
        }),
    ],
    resolve: {
        alias: [
            { find: "@", replacement: path.resolve(__dirname, "./src") },
            { find: "jsbi", replacement: path.resolve(__dirname, "node_modules/jsbi/dist/jsbi-cjs.js") },
            { find: "config", replacement: path.resolve(__dirname, "./config") },
            ...disabledAliases,
        ],
    },
});
