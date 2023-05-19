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

  placePendingChip({ column }) {
    const row = this.grid.getNextAvailableSlot({ column });
    if (row === null) {
      return;
    }
    if (this.pendingChipColumn !== column) {
      this.alignPendingChipWithColumn({
        column,
        emit: !this.game.currentPlayer.wait,
        transitionEnd: () => {
          if (this.game.currentPlayer.wait) {
            this.game.currentPlayer.wait(() => {
              this.placePendingChip({ column });
            });
          }
        }
      });
    } else if (this.transitionPendingChipX) {
      this.waitForPendingChipTransitionEnd(() => {
        this.transitionPendingChipX = false;
        this.placePendingChip({ column });
      });
    } else {
      this.transitionPendingChipX = false;
      this.transitionPendingChipY = true;
      this.pendingChipColumn = column;
      this.pendingChipRow = row;
      this.finishPlacingPendingChip({ column });
    }
    m.redraw();
  }

  placePendingChipViaPointer(clickEvent) {
    if (this.game.pendingChip && this.game.currentPlayer.type === 'human' && !this.transitionPendingChipX && !this.transitionPendingChipY) {
      this.placePendingChip({
        column: this.getLastVisitedColumn(clickEvent)
      });
    } else {
      clickEvent.redraw = false;
    }
  }

  finishPlacingPendingChip({ column }) {
    this.waitForPendingChipTransitionEnd(() => {
      if (this.transitionPendingChipX && !this.transitionPendingChipY) {
        this.transitionPendingChipX = false;
        this.transitionPendingChipY = false;
      } else {
        this.game.placePendingChip({ column });
        this.transitionPendingChipX = false;
        this.transitionPendingChipY = false;
        this.pendingChipRow = this.grid.rowCount;
        this.resetCachedChipWidth();
        m.redraw();
      }
    });
  }

  initializePendingChip({ dom }) {
    this.off('pending-chip:transition-end');
    dom.addEventListener('transitionend', (event) => {
      if (event.target === dom) {
        this.emit('pending-chip:transition-end');
      }
    });
  }

  view() {
    return m('div#grid', {
      onmousemove: (mousemoveEvent) => this.alignPendingChipViaPointer(mousemoveEvent),
      onclick: (clickEvent) => this.placePendingChipViaPointer(clickEvent)
    }, [
      this.game.pendingChip ?
        m(`div.chip.pending.${this.game.pendingChip.player.color}`, {
          class: classNames({
            'transition-x': this.transitionPendingChipX,
            'transition-y': this.transitionPendingChipY
          }),
          style: {
            transform: this.getTranslate({
              column: this.pendingChipColumn,
              row: this.pendingChipRow
            })
          },
          oncreate: ({ dom }) => this.initializePendingChip({ dom })
        }, [
          m('div.chip-inner.chip-inner-real'),
          m('div.chip-inner.chip-inner-clone')
        ]) : null,
      m('div#grid-columns', _.times(this.grid.columnCount, (c) => {
        return m('div.grid-column', _.times(this.grid.rowCount, (r) => {
          if (this.grid.columns[c][r]) {
            const chip = this.grid.columns[c][r];
            return m(`div.chip.${chip.player.color}`, {
              class: classNames({
                'winning': chip.winning
              })
            }, m('div.chip-inner'));
          } else {
            return m('div.empty-chip-slot', m('div.empty-chip-slot-inner'));
          }
        }));
      }))
    ]);
  }

}


GridComponent.pendingChipAlignmentDelay = 250;
GridComponent.prototype.emitAlignEvent = _.throttle(
  GridComponent.prototype.emitAlignEvent,
  GridComponent.pendingChipAlignmentDelay
);

export default GridComponent;
