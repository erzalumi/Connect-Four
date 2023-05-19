import m from "mithril";
import GameComponent from "./game.js";

class AppComponent {
  view() {
    return m("div#app", [m(GameComponent)]);
  }
}

export default AppComponent;
