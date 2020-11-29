const path = require("path");
const analyser = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = env => {
    return {
        entry: {
            content: "./src/content/index.tsx",
            background: "./src/background/index.ts",
            popup: "./src/popup/index.tsx"
        },
        mode: env.production === "production" ? "production" : "development",
        devtool: env.production === "production" ? undefined : "inline-source-map",
        plugins: [
            new analyser({analyzerMode: env.analyse ? "server" : "disabled"})
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
        },
        devServer: {
            contentBase: "./wwwroot",
            publicPath: "/output",
            hot: true,
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            historyApiFallback: true,
            index: "index.html"
        }
    }
}