import React from "react";
import ReactDOM from "react-dom";
import ContentApp from "./components/content-app";

const root = document.createElement("div");
root.id = "rickrollblocker-root";

document.body.insertBefore(root, document.body.childNodes[0]);

ReactDOM.render(
    <ContentApp />,
    root
);