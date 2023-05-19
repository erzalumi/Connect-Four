import m from "mithril";

class PlayerAreaComponent {
  view({ attrs: { game } }) {
    return m("div#player-area", [
      m(
        "div#player-area-players",
        game.players.map((player) => {
          return m(`div.player.${player.color}`, {}, [
            m("div.player-name", player.name),
            m("div.player-score", player.score),
          ]);
        })
      ),
    ]);
  }
}
export default PlayerAreaComponent;
