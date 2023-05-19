class GridConnection {

    constructor({ chips = [], emptySlotCount = 0 } = {}) {
      this.chips = [...chips];
      this.emptySlotCount = emptySlotCount;
    }

    get length() {
      return this.chips.length;
    }

    set length(newLength) {
      this.chips.length = newLength;
      return this.chips.length;
    }

    addChip(chip) {
      this.chips.push(chip);
    }

    addConnection(connection) {
      this.chips.push(...connection.chips);
      this.emptySlotCount += connection.emptySlotCount || 0;
    }

    forEach(callback) {
      return this.chips.forEach(callback);
    }

}

GridConnection.directions = [
  { x: 0, y: -1 }, // Bottom-middle
  { x: -1, y: -1 }, // Bottom-left
  { x: -1, y: 0 }, // Left-middle
  { x: -1, y: 1 } // Top-left
];


export default GridConnection;
