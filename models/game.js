import Emitter from 'tiny-emitter';
import Grid from './grid.js';
import HumanPlayer from './human-player.js';
import AIPlayer from './ai-player.js';
import Chip from './chip.js';

class Game extends Emitter {

  constructor({
    players = [],
    debug = false
  } = {}) {
    super();
    let columnCount = NaN;
    while (isNaN(columnCount) || columnCount < 5 || columnCount > 10 ) {
      // eslint-disable-next-line radix
      columnCount = parseInt(prompt("Enter the number of columns (must between 5 and 10):"));
    }
    let rowCount = NaN;
    while (isNaN(rowCount) || rowCount < 4 || rowCount > 10) {
      // eslint-disable-next-line radix
      rowCount = parseInt(prompt("Enter the number of rows (must be between 4 and 10):"));
    }
    this.grid = new Grid({ columnCount, rowCount });
    this.players = players;
    this.type = null;
    this.lastType = null;
    this.currentPlayer = null;
    this.inProgress = false;
    this.pendingChip = null;
    this.winner = null;
    this.requestingPlayer = null;
    if (debug) {
      this.debug = true;
      this.columnHistory = [];
    } else {
      this.debug = false;
    }
  }

  startGame({ startingPlayer } = {}) {
    if (startingPlayer) {
      this.currentPlayer = startingPlayer;
    } else {
      this.currentPlayer = this.players[0];
    }
    this.inProgress = true;
    this.emit('game:start');
    this.startTurn();
  }

  endGame() {
    this.inProgress = false;
    this.currentPlayer = null;
    this.pendingChip = null;
    this.emit('game:end');
    this.type = null;
    if (this.debug) {
      this.columnHistory.length = 0;
    }
  }

  resetGame() {
    this.winner = null;
    this.grid.resetGrid();
  }

  setPlayers({ gameType}) {
    if (this.players.length === 0) {
      if (gameType === 'Human.vs.AI') {
        this.players.push(new HumanPlayer({ name: 'Human', color: 'red' }));
        this.players.push(new AIPlayer({ name: 'Mr. A.I.', color: 'black' }));
      }
    } 
    this.type = gameType;
  }

  getOtherPlayer(basePlayer = this.currentPlayer) {
    return this.players.find((player) => player.color !== basePlayer.color);
  }

  startTurn() {
    this.pendingChip = new Chip({ player: this.currentPlayer });
    if (this.currentPlayer.getNextMove) {
      this.currentPlayer.getNextMove({ game: this }).then((nextMove) => {
        this.emit('async-player:get-next-move', {
          player: this.currentPlayer,
          nextMove
        });
      });
    }
  }

  endTurn() {
    if (this.inProgress) {
      this.currentPlayer = this.getOtherPlayer(this.currentPlayer);
      this.startTurn();
    }
  }

  placePendingChip({ column }) {
    this.grid.placeChip({
      chip: this.pendingChip,
      column
    });
    this.emit('player:place-chip', this.grid.lastPlacedChip);
    if (this.debug) {
      this.columnHistory.push(column);
      console.log(this.columnHistory.join(', '));
    }
    this.pendingChip = null;
    this.checkForWin();
    this.checkForTie();
    this.endTurn();
  }

  checkForTie() {
    if (this.grid.checkIfFull()) {
      this.emit('game:declare-tie');
      this.endGame();
    }
  }

  checkForWin() {
    if (!this.grid.lastPlacedChip) {
      return;
    }
    const connections = this.grid.getConnections({
      baseChip: this.grid.lastPlacedChip,
      minConnectionSize: Game.winningConnectionSize
    });
    if (connections.length > 0) {
   
      connections[0].length = Game.winningConnectionSize;
      connections[0].forEach((chip) => {
        chip.winning = true;
      });
      this.winner = this.grid.lastPlacedChip.player;
      this.winner.score += 1;
      this.emit('game:declare-winner', this.winner);
      this.endGame();
    }
  }

}
Game.winningConnectionSize = 4;

export default Game;
