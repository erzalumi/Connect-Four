import m from 'mithril';
import _ from 'underscore';
import Emitter from 'tiny-emitter';
import classNames from '../classnames.js';

class GridComponent extends Emitter {

  oninit({ attrs: { game } }) {
    this.game = game;
    this.grid = this.game.grid;
    this.game.on('async-player:get-next-move', ({ player, nextMove }) => {
      player.wait(() => {
        this.placePendingChip({
          column: nextMove.column
        });
      });
    });

    this.game.on('grid:align-pending-chip-initially', ({ column }) => {
      this.pendingChipColumn = column;
      m.redraw();
    });
    this.game.on('game:end', () => this.reset());
    this.reset();
  }

  reset() {
    this.resetCachedChipWidth();
    this.pendingChipColumn = 0;
    this.pendingChipRow = this.grid.rowCount;
    this.transitionPendingChipX = false;
    this.transitionPendingChipY = false;
  }

  resetCachedChipWidth() {
    this.chipWidth = null;
  }

  getTranslate({ column, row }) {
    return 'translate(' + (column * 100) + '%,' + ((this.grid.rowCount - row) * 100) + '%)';
  }

  getChipWidth() {
    if (!this.chipWidth) {
      const gridElem = document.getElementById('grid');
      this.chipWidth = gridElem.offsetWidth / this.grid.columnCount;
    }
    return this.chipWidth;
  }

  getLastVisitedColumn(mouseEvent) {
    const chipWidth = this.getChipWidth();
    let column = Math.floor((mouseEvent.pageX - mouseEvent.currentTarget.offsetLeft) / chipWidth);
    column = Math.max(0, column);
    column = Math.min(column, this.grid.columnCount - 1);
    return column;
  }

  waitForPendingChipTransitionEnd(callback) {
    this.off('pending-chip:transition-end');
    this.once('pending-chip:transition-end', callback);
  }

  alignPendingChipWithColumn({ column, transitionEnd, emit = false }) {
    if (column !== this.pendingChipColumn) {
      if (emit) {
        this.emitAlignEvent({ column });
      }
      this.pendingChipColumn = column;
      this.pendingChipRow = this.grid.rowCount;
      this.transitionPendingChipX = true;
      this.transitionPendingChipY = false;
      this.waitForPendingChipTransitionEnd(() => {
        this.transitionPendingChipX = false;
        this.resetCachedChipWidth();
        if (transitionEnd) {
          transitionEnd();
        }
      });
    }
  }

  alignPendingChipViaPointer(mousemoveEvent) {
    if (this.game.pendingChip && this.game.currentPlayer.type === 'human' && !this.transitionPendingChipY) {
      this.alignPendingChipWithColumn({
        column: this.getLastVisitedColumn(mousemoveEvent),
        emit: true
      });
    } else {
      mousemoveEvent.redraw = false;
    }
  }

}


export default GridComponent;


