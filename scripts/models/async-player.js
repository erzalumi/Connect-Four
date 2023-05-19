import Player from './player.js';


class AsyncPlayer extends Player {

  wait(callback) {
    setTimeout(callback, this.waitDelay);
  }

  getNextMove() {
    throw new Error('This method must be implemented by a subclass of AsyncPlayer; it must return a promise which resolves when the async player\'s next move has finished computing');
  }

}
AsyncPlayer.prototype.type = 'async';

export default AsyncPlayer;
