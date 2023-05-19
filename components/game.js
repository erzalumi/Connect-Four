import m from 'mithril';
import classNames from '../classnames.js';
import Game from '../models/game.js';
import GridComponent from './grid.js';
import DashboardComponent from './dashboard.js';
import PlayerAreaComponent from './player-area.js';

class GameComponent {

  oninit() {
    this.game = new Game();
  }

  view() {
    return m('div#game', {
      class: classNames({ 'in-progress': this.game.inProgress })
    }, [
      m('div.game-column', [
        m('h1', 'Connect Four'),
        m(DashboardComponent, {
          game: this.game
        })
      ]),
      m('div.game-column', [
        m(GridComponent, { game: this.game}),
        m(PlayerAreaComponent, { game: this.game})
      ])
    ]);
  }

}

export default GameComponent;
