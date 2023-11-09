import InvalidParametersError, { INVALID_MOVE_MESSAGE } from '../../../../lib/InvalidParametersError';
import { ChessColor, ChessMove, ChessSquare, IChessPiece } from '../../../../types/CoveyTownSocket';

class King implements IChessPiece {
  color: ChessColor;
  row: ChessSquare;
  col: ChessSquare;

  type: 'K' | 'Q' | 'R' | 'B' | 'N' | 'P' | 'None';

  constructor(color: ChessColor, row: ChessSquare, col: ChessSquare) {
    this.color = color;
    this.row = row;
    this.col = col;
    this.type = 'K';
  }

  validate_move(
    newRow: ChessSquare,
    newCol: ChessSquare,
    board: IChessPiece[][],
    moves: ReadonlyArray<ChessMove>,
  ) {

    
  }
  
}
