module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "babel-plugin-module-resolver",
        {
          root: ["./"],
          alias: {
            "@/api": "./src/api",
            "@/components": "./src/components",
            "@/constants": "./src/constants",
            "@/lib": "./src/lib",
            "@/styles": "./src/styles",
            "@/types": "./src/types",
            "@/hooks/useColorScheme": "./src/hooks/useColorScheme",
            "@/hooks/useThemeColor": "./src/hooks/useThemeColor",
            "@": "./",
          },
        },
      ],
    ],
  };
};
