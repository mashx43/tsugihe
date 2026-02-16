import { render } from "solid-js/web";
import App from "./App";

// biome-ignore lint/style/noNonNullAssertion: root is guaranteed to exist
render(() => <App />, document.getElementById("root")!);
