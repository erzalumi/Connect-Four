import m from 'mithril';

class DashboardControlsComponent {

  oninit({ attrs: { game } }) {
    this.game = game;
  }

  setPlayers(gameType) {
    if (this.game.players.length > 0) {
      this.game.resetGame();
    }
    this.game.setPlayers(gameType);
  }

  startGame(newStartingPlayer) {
    this.game.startGame({
      startingPlayer: newStartingPlayer
    });
  }

  endGame() {
      this.game.endGame();
  }


  view() {
    return m('div#dashboard-controls', [

      this.game.inProgress ? m('button.warn', {
        onclick: () => this.endGame() }, 'End Game'
      ) :[

        this.game.type !== null ? [
          this.game.players.map((player) => {
            return m('button', {
              onclick: () => this.startGame(player)
            }, player.name);
          }),
          m('a.go-back[href=/]', 'Back')
        ] :
        [
          m('button', {
            onclick: () => this.setPlayers({ gameType: 'Human.vs.AI' })
          }, 'Play')
        ]
      ] 
    ]);
  }

}

export default DashboardControlsComponent;
