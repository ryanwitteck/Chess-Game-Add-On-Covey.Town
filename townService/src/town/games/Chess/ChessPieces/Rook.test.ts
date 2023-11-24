import { ChessBoardPosition, ChessCell, ChessMove } from '../../../../types/CoveyTownSocket';
import Pawn from './Pawn';
import Queen from './Queen';
import King from './King';
import Rook from './Rook';
import Knight from './Knight';
import Bishop from './Bishop';
// import { INVALID_MOVE_MESSAGE } from '../../../../lib/InvalidParametersError';

describe('ChessGame', () => {
  let rook1: Rook;
  let rook2: Rook;
  let rook3: Rook;
  let rook4: Rook;
  let board: ChessCell[][];
  let moves: ReadonlyArray<ChessMove>;
  describe('moves from starting board', () => {
    beforeEach(() => {
      rook1 = new Rook('W', 0, 0);
      rook2 = new Rook('W', 0, 7);
      rook3 = new Rook('B', 7, 0);
      rook4 = new Rook('B', 7, 7);
      moves = [];
      board = [
        [
          rook1,
          new Knight('W', 0, 1),
          new Bishop('W', 0, 2),
          new Queen('W', 0, 3),
          new King('W', 0, 4),
          new Bishop('W', 0, 5),
          new Knight('W', 0, 6),
          rook2,
        ],
        [
          new Pawn('W', 1, 0),
          new Pawn('W', 1, 1),
          new Pawn('W', 1, 2),
          new Pawn('W', 1, 3),
          new Pawn('W', 1, 4),
          new Pawn('W', 1, 5),
          new Pawn('W', 1, 6),
          new Pawn('W', 1, 7),
        ],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [
          new Pawn('B', 6, 0),
          new Pawn('B', 6, 1),
          new Pawn('B', 6, 2),
          new Pawn('B', 6, 3),
          new Pawn('B', 6, 4),
          new Pawn('B', 6, 5),
          new Pawn('B', 6, 6),
          new Pawn('B', 6, 7),
        ],
        [
          rook3,
          new Knight('B', 7, 1),
          new Bishop('B', 7, 2),
          new Queen('B', 7, 3),
          new King('B', 7, 4),
          new Bishop('B', 7, 5),
          new Knight('B', 7, 6),
          rook4,
        ],
      ];
    });
    it('white, no valid moves from starting board', () => {
      function testValidation(i: ChessBoardPosition, j: ChessBoardPosition) {
        expect(() => rook1.validate_move(i, j, board, moves)).toThrowError();
        expect(() => rook2.validate_move(i, j, board, moves)).toThrowError();
      }
      for (let i: ChessBoardPosition = 0; i <= 7; i++) {
        for (let j: ChessBoardPosition = 0; j <= 7; j++) {
          testValidation(i as ChessBoardPosition, j as ChessBoardPosition);
        }
      }
    });
    it('black, no valid moves from starting board', () => {
      function testValidation(i: ChessBoardPosition, j: ChessBoardPosition) {
        expect(() => rook3.validate_move(i, j, board, moves)).toThrowError();
        expect(() => rook4.validate_move(i, j, board, moves)).toThrowError();
      }
      for (let i: ChessBoardPosition = 0; i <= 7; i++) {
        for (let j: ChessBoardPosition = 0; j <= 7; j++) {
          testValidation(i as ChessBoardPosition, j as ChessBoardPosition);
        }
      }
    });
  });
});
