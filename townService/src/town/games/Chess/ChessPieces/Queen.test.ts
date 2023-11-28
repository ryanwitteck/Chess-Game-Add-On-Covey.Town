import { ChessBoardPosition, ChessCell, ChessMove } from '../../../../types/CoveyTownSocket';
import Pawn from './Pawn';
import Queen from './Queen';
import King from './King';
import Knight from './Knight';
import { INVALID_MOVE_MESSAGE } from '../../../../lib/InvalidParametersError';

describe('ChessGame', () => {
  let queen1: Queen;
  let queen2: Queen;
  let queen3: Queen;
  let queen4: Queen;
  let board: ChessCell[][];
  let moves: ReadonlyArray<ChessMove>;
  describe('moves from starting board', () => {
    beforeEach(() => {
      queen1 = new Queen('W', 0, 3);
      queen2 = new Queen('B', 7, 3);
      moves = [];
      board = [
        [
          new Queen('W', 0, 0),
          new Knight('W', 0, 1),
          new Queen('W', 0, 2),
          queen1,
          new King('W', 0, 4),
          new Queen('W', 0, 5),
          new Knight('W', 0, 6),
          new Queen('W', 0, 7),
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
          new Queen('W', 7, 0),
          new Knight('B', 7, 1),
          new Queen('B', 7, 2),
          queen2,
          new King('B', 7, 4),
          new Queen('B', 7, 5),
          new Knight('B', 7, 6),
          new Queen('W', 7, 7),
        ],
      ];
    });
    it('white, no valid moves from starting board', () => {
      function testValidation(i: ChessBoardPosition, j: ChessBoardPosition) {
        expect(() => queen1.validate_move(i, j, board, moves)).toThrowError();
      }
      for (let i: ChessBoardPosition = 0; i <= 7; i++) {
        for (let j: ChessBoardPosition = 0; j <= 7; j++) {
          testValidation(i as ChessBoardPosition, j as ChessBoardPosition);
        }
      }
    });
    it('black, no valid moves from starting board', () => {
      function testValidation(i: ChessBoardPosition, j: ChessBoardPosition) {
        expect(() => queen2.validate_move(i, j, board, moves)).toThrowError();
      }
      for (let i: ChessBoardPosition = 0; i <= 7; i++) {
        for (let j: ChessBoardPosition = 0; j <= 7; j++) {
          testValidation(i as ChessBoardPosition, j as ChessBoardPosition);
        }
      }
    });
  });
  describe('moves from custom board (starting position no pawns)', () => {
    beforeEach(() => {
      queen1 = new Queen('W', 0, 2);
      queen2 = new Queen('W', 0, 5);
      queen3 = new Queen('B', 7, 2);
      queen4 = new Queen('B', 7, 5);
      moves = [];
      board = [
        [
          new Queen('W', 0, 0),
          new Knight('W', 0, 1),
          queen1,
          new Queen('W', 0, 3),
          new King('W', 0, 4),
          queen2,
          new Knight('W', 0, 6),
          new Queen('W', 0, 2),
        ],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [
          new Queen('B', 7, 0),
          new Knight('B', 7, 1),
          queen3,
          new Queen('B', 7, 3),
          new King('B', 7, 4),
          queen4,
          new Knight('B', 7, 6),
          new Queen('B', 7, 2),
        ],
      ];
    });
    it('white, can moves on diagonals', () => {
      expect(() => queen1.validate_move(1, 1, board, [])).not.toThrowError();
      expect(() => queen1.validate_move(2, 0, board, [])).not.toThrowError();
      expect(() => queen1.validate_move(2, 4, board, [])).not.toThrowError();
      expect(() => queen1.validate_move(3, 5, board, [])).not.toThrowError();
      expect(() => queen1.validate_move(4, 6, board, [])).not.toThrowError();
      expect(() => queen1.validate_move(5, 7, board, [])).not.toThrowError();
      expect(() => queen2.validate_move(1, 6, board, [])).not.toThrowError();
      expect(() => queen2.validate_move(2, 7, board, [])).not.toThrowError();
      expect(() => queen2.validate_move(1, 4, board, [])).not.toThrowError();
      expect(() => queen2.validate_move(2, 3, board, [])).not.toThrowError();
      expect(() => queen2.validate_move(3, 2, board, [])).not.toThrowError();
      expect(() => queen2.validate_move(4, 1, board, [])).not.toThrowError();
      expect(() => queen2.validate_move(5, 0, board, [])).not.toThrowError();
    });
    it('black, can moves on diagonals', () => {
      expect(() => queen3.validate_move(6, 1, board, [])).not.toThrowError();
      expect(() => queen3.validate_move(5, 0, board, [])).not.toThrowError();
      expect(() => queen3.validate_move(6, 3, board, [])).not.toThrowError();
      expect(() => queen3.validate_move(5, 4, board, [])).not.toThrowError();
      expect(() => queen3.validate_move(4, 5, board, [])).not.toThrowError();
      expect(() => queen3.validate_move(3, 6, board, [])).not.toThrowError();
      expect(() => queen3.validate_move(2, 7, board, [])).not.toThrowError();
      expect(() => queen4.validate_move(6, 6, board, [])).not.toThrowError();
      expect(() => queen4.validate_move(5, 7, board, [])).not.toThrowError();
      expect(() => queen4.validate_move(6, 4, board, [])).not.toThrowError();
      expect(() => queen4.validate_move(5, 3, board, [])).not.toThrowError();
      expect(() => queen4.validate_move(4, 2, board, [])).not.toThrowError();
      expect(() => queen4.validate_move(3, 1, board, [])).not.toThrowError();
      expect(() => queen4.validate_move(2, 0, board, [])).not.toThrowError();
    });
  });
  describe('moves from custom board v1', () => {
    beforeEach(() => {
      queen1 = new Queen('W', 3, 3);
      queen2 = new Queen('W', 3, 4);
      queen3 = new Queen('B', 4, 3);
      queen4 = new Queen('B', 4, 4);
      moves = [];
      board = [
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [
          undefined,
          undefined,
          new Queen('B', 2, 2),
          undefined,
          undefined,
          new King('W', 2, 5),
          undefined,
          undefined,
        ],
        [undefined, undefined, undefined, queen1, queen2, undefined, undefined, undefined],
        [undefined, undefined, undefined, queen3, queen3, undefined, undefined, undefined],
        [
          undefined,
          undefined,
          new Queen('W', 5, 2),
          undefined,
          undefined,
          new Pawn('B', 5, 5),
          undefined,
          undefined,
        ],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
      ];
    });
    it('white, cannot move through peices of opposite color', () => {
      expect(() => queen2.validate_move(1, 6, board, [])).toThrowError(INVALID_MOVE_MESSAGE);
      expect(() => queen2.validate_move(0, 7, board, [])).toThrowError(INVALID_MOVE_MESSAGE);
    });
    it('white, cannot move through peices of opposite color', () => {
      expect(() => queen1.validate_move(1, 1, board, [])).toThrowError(INVALID_MOVE_MESSAGE);
      expect(() => queen1.validate_move(0, 0, board, [])).toThrowError(INVALID_MOVE_MESSAGE);
    });
    it('white, cannot capture peice of same color', () => {
      expect(() => queen2.validate_move(2, 5, board, [])).toThrowError(INVALID_MOVE_MESSAGE);
    });
    it('white, can capture peice of opposite color', () => {
      expect(() => queen1.validate_move(2, 2, board, [])).not.toThrowError();
    });
    it('black, cannot move through peices of opposite color', () => {
      expect(() => queen3.validate_move(6, 1, board, [])).toThrowError(INVALID_MOVE_MESSAGE);
      expect(() => queen3.validate_move(7, 0, board, [])).toThrowError(INVALID_MOVE_MESSAGE);
    });
    it('black, cannot move through peices of same color', () => {
      expect(() => queen4.validate_move(6, 6, board, [])).toThrowError(INVALID_MOVE_MESSAGE);
      expect(() => queen4.validate_move(7, 7, board, [])).toThrowError(INVALID_MOVE_MESSAGE);
    });
    it('black, cannot capture peice of same color', () => {
      expect(() => queen4.validate_move(5, 5, board, [])).toThrowError(INVALID_MOVE_MESSAGE);
    });
    it('white, can capture peice of opposite color', () => {
      expect(() => queen3.validate_move(5, 2, board, [])).not.toThrowError();
    });
  });

  describe('Custom board v2, testing queen moves', () => {
    beforeEach(() => {
      queen1 = new Queen('W', 3, 3);
      queen2 = new Queen('W', 3, 4);
      queen3 = new Queen('B', 4, 3);
      queen4 = new Queen('B', 4, 4);
      board = [
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
      ];
    });
    it('white, can only move in valid horizontal directions', () => {
      function testValidation(i: ChessBoardPosition, j: ChessBoardPosition) {
        expect(() => queen1.validate_move(i, j, board, moves)).not.toThrowError();
      }
      for (let i: ChessBoardPosition = 0; i <= 7; i++) {
        for (let j: ChessBoardPosition = 0; j <= 7; j++) {
          if ((i === 3 && j !== 3) || (j === 3 && i !== 3)) {
            testValidation(i as ChessBoardPosition, j as ChessBoardPosition);
          }
        }
      }
    });
    it('black, can only move in valid horizontal directions', () => {
      function testValidation(i: ChessBoardPosition, j: ChessBoardPosition) {
        expect(() => queen4.validate_move(i, j, board, moves)).not.toThrowError();
      }

      for (let i: ChessBoardPosition = 0; i <= 7; i++) {
        for (let j: ChessBoardPosition = 0; j <= 7; j++) {
          if ((i === 4 && j !== 4) || (j === 4 && i !== 4)) {
            testValidation(i as ChessBoardPosition, j as ChessBoardPosition);
          }
        }
      }
    });
  });
});
