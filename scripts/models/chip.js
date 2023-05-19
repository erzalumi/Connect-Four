function Chip({ player, column = null, row = null, winning = false }) {
  this.player = player;
  this.column = column;
  this.row = row;
  this.winning = winning;
}

export default Chip;
