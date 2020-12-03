const path = require("path");
const analyser = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = env => {
    return {
        entry: {
            content: {
                import: "./src/content/index.tsx",
                dependOn: "shared"
            },
            background: {
                import: "./src/background/index.ts",
                dependOn: "shared"
            },
            popup: {
                import: "./src/popup/index.tsx",
                dependOn: "shared"
            },
            shared: ["styled-components", "webextension-polyfill", "preact"]
        },
        mode: env.production ? "production" : "development",
        devtool: env.production ? undefined : "inline-source-map",
        plugins: [
            new analyser({analyzerMode: env.analyse ? "server" : "disabled"}),
        ],
        output: {
            path: path.resolve(__dirname, "dist"),
            filename: "[name]-bundle.js",
            publicPath: "/output"
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js"],
            alias: {
                "react": "preact/compat",
                "react-dom": "preact/compat",
            }
        },
        module: {
            rules: [
                { 
                    test: /\.tsx?$/, 
                    loader: 'ts-loader', 
                    exclude: /node_modules/ 
                }
            ]
        }
    }
}