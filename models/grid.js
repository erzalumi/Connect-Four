import _ from 'underscore';
import GridConnection from './grid-connection.js';

class Grid {

  constructor({ columnCount, rowCount, columns, lastPlacedChip = null }) {
    this.columnCount = columnCount;
    this.rowCount = rowCount;
    if (columns) {
      this.columns = columns.map((column) => column.slice(0));
    } else {
      this.columns = _.times(this.columnCount, () => []);
    }
    this.lastPlacedChip = lastPlacedChip;
  }

  checkIfFull() {
    return this.columns.every((column) => column.length === this.rowCount);
  }

  getChipCount() {
    return this.columns.reduce((sum, column) => sum + column.length, 0);
  }

  resetGrid() {
    this.columns.forEach((column) => {
      column.length = 0;
    });
    this.lastPlacedChip = null;
  }

  getNextAvailableSlot({ column }) {
    const nextRowIndex = this.columns[column].length;
    if (nextRowIndex < this.rowCount) {
      return nextRowIndex;
    } else {
      return null;
    }
  }

  placeChip({ chip, column }) {
    this.columns[column].push(chip);
    this.lastPlacedChip = chip;
    chip.column = column;
    chip.row = this.columns[column].length - 1;
  }

  getSubConnection(baseChip, direction) {
    let neighbor = baseChip;
    const subConnection = new GridConnection();
    while (true) {
      const nextColumn = neighbor.column + direction.x;
      if (this.columns[nextColumn] === undefined) {
        break;
      }
      const nextRow = neighbor.row + direction.y;
      const nextNeighbor = this.columns[nextColumn][nextRow];
      if (nextNeighbor === undefined) {
        if (nextRow >= 0 && nextRow < this.rowCount) {
          subConnection.emptySlotCount += 1;
        }
        break;
      }
      if (nextNeighbor.player !== baseChip.player) {
        break;
      }
      neighbor = nextNeighbor;
      subConnection.addChip(nextNeighbor);
    }
    return subConnection;
  }

  addSubConnection(connection, baseChip, direction) {
    const subConnection = this.getSubConnection(baseChip, direction);
    connection.addConnection(subConnection);
  }

  getConnections({ baseChip, minConnectionSize }) {
    const connections = [];
    GridConnection.directions.forEach((direction) => {
      const connection = new GridConnection({ chips: [baseChip] });
      this.addSubConnection(connection, baseChip, direction);
      this.addSubConnection(connection, baseChip, {
        x: -direction.x,
        y: -direction.y
      });
      if (connection.length >= minConnectionSize) {
        connections.push(connection);
      }
    });
    return connections;
  }

  getChipScore({ chip, currentPlayerIsMaxPlayer }) {
    let gridScore = 0;
    const connections = this.getConnections({
      baseChip: chip,
      minConnectionSize: 1
    });
    for (let i = 0; i < connections.length; i += 1) {
      const connection = connections[i];
      if (connection.length >= 4) {
        gridScore = Grid.maxScore;
        break;
      } else if (connection.emptySlotCount >= 1) {
        gridScore += Math.pow(connection.length, 2) + Math.pow(connection.emptySlotCount, 3);
      }
    }
    if (!currentPlayerIsMaxPlayer) {
      gridScore *= -1;
    }
    return gridScore;
  }

}

export default Grid;
