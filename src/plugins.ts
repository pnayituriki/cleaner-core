import { INormalizerPlugin } from "./types";

const globalPlugins: INormalizerPlugin[] = [];

export const PluginRegistry = {
  register(plugin: INormalizerPlugin) {
    globalPlugins.push(plugin);
  },
  clear() {
    globalPlugins.length = 0;
  },
  getAll(): INormalizerPlugin[] {
    return [...globalPlugins];
  },
};
