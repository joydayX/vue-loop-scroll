import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { libInjectCss } from "vite-plugin-lib-inject-css";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    libInjectCss(),
    dts({
      tsconfigPath: "./tsconfig.app.json",
      exclude: ["lib/**/__tests__/"],
      rollupTypes: true, // 将所有的类型声明打包到一个文件中
    }),
  ],
  esbuild: {
    drop: ["console", "debugger"], // 删除console和debugger
  },
  build: {
    lib: {
      entry: resolve(__dirname, "lib/main.ts"),
      name: "VueLoopScroll",
      formats: ["es", "cjs", "umd"],
      fileName: (format) => {
        const formatMap = {
          es: "esm",
          cjs: "cjs",
          umd: "umd",
        };
        const directory = formatMap[format as keyof typeof formatMap];
        return `${directory}/index.js`;
      },
    },
    rollupOptions: {
      external: ["vue", "vue/jsx-runtime"],
      output: {
        globals: {
          vue: "Vue",
        },
        assetFileNames: "assets/[name][extname]",
      },
    },
    // 禁止复制 public 目录
    copyPublicDir: false,
  },
});
