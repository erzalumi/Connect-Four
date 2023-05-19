import m from 'mithril';
import DashboardControlsComponent from './dashboard-controls.js';

class DashboardComponent {

  view({ attrs: { game } }) {
    return m('div#game-dashboard', {
    }, [
      m('p#game-message',
        game.players.length === 0 ?
          'Welcome! Click play if you want to start playing Connect-Four?' :
        game.currentPlayer ?
          `${game.currentPlayer.name}, your turn!` :
        game.winner ?
          `${game.winner.name} wins! Play again?` :
        game.grid.checkIfFull() ?
          'We\'ll call it a draw! Play again?' :
        game.type !== null ?
          'Which player should start first?' :
        'Game ended. Play again?'
      ),

      m(DashboardControlsComponent, { game })

    ]);
  }

}

export default DashboardComponent;
