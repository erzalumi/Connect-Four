import Grid from './grid.js';
import AsyncPlayer from './async-player.js';
import Chip from './chip.js';

class AIPlayer extends AsyncPlayer {
  getNextMove({ game }) {
    return new Promise((resolve) => {
      const nextMove = this.maximizeMove({
        grid: game.grid,
        minPlayer: game.getOtherPlayer(this),
        depth: 0,
        alpha: Grid.minScore,
        beta: Grid.maxScore,
      });
      resolve(nextMove);
    });
  }

  maximizeMove({ grid, minPlayer, depth, alpha, beta }) {
    const gridScore = grid.getScore({
      currentPlayer: this,
      currentPlayerIsMaxPlayer: true,
    });
    if (
      depth === this.maxComputeDepth ||
      Math.abs(gridScore) === Grid.maxScore
    ) {
      return { column: null, score: gridScore };
    }
    const maxMove = { column: null, score: Grid.minScore };
    for (let c = 0; c < grid.columnCount; c += 1) {
      if (grid.columns[c].length === grid.rowCount) {
        continue;
      }
      const nextGrid = new Grid(grid);
      nextGrid.placeChip({
        column: c,
        chip: new Chip({ player: this }),
      });
      const minMove = this.minimizeMove({
        grid: nextGrid,
        minPlayer,
        depth: depth + 1,
        alpha,
        beta,
      });
      if (minMove.score > maxMove.score) {
        maxMove.column = c;
        maxMove.score = minMove.score;
        alpha = minMove.score;
      } else if (maxMove.score === Grid.minScore) {
        maxMove.column = minMove.column;
        maxMove.score = minMove.score;
        alpha = minMove.score;
      }
      if (alpha >= beta) {
        break;
      }
    }
    return maxMove;
  }
}

AIPlayer.prototype.type = 'ai';
AIPlayer.prototype.waitDelay = 200;
AIPlayer.prototype.maxComputeDepth = 3;

export default AIPlayer;
