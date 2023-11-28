import { createPlayerForTesting } from '../../../TestUtils';
import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  MOVE_NOT_YOUR_TURN_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../../lib/InvalidParametersError';
import Player from '../../../lib/Player';
import { ChessMove, ChessPiece, ChessBoardPosition } from '../../../types/CoveyTownSocket';
import ChessGame from './ChessGame';
import Pawn from './ChessPieces/Pawn';
import King from './ChessPieces/King';
import Queen from './ChessPieces/Queen';
import Rook from './ChessPieces/Rook';
import Bishop from './ChessPieces/Bishop';
import Knight from './ChessPieces/Knight';

describe('ChessGame', () => {
  let game: ChessGame;

  beforeEach(() => {
    game = new ChessGame();
  });

  describe('ChessGame _join', () => {
    it('should throw an error if the player is already in the game', () => {
      const player = createPlayerForTesting();
      game.join(player);
      expect(() => game.join(player)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
      const player2 = createPlayerForTesting();
      game.join(player2);
      expect(() => game.join(player2)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    });
    it('should throw an error if the game is full', () => {
      const player1 = createPlayerForTesting();
      const player2 = createPlayerForTesting();
      const player3 = createPlayerForTesting();
      game.join(player1);
      game.join(player2);
      expect(() => game.join(player3)).toThrowError(GAME_FULL_MESSAGE);
    });
    describe('When the player can be added', () => {
      it('makes the first player white and initializes the state with status WAITING_TO_START', () => {
        const player = createPlayerForTesting();
        game.join(player);
        expect(game.state.white).toEqual(player.id);
        expect(game.state.black).toBeUndefined();
        expect(game.state.moves).toHaveLength(0);
        expect(game.state.status).toEqual('WAITING_TO_START');
        expect(game.state.winner).toBeUndefined();
      });
      describe('When the second player joins', () => {
        const player1 = createPlayerForTesting();
        const player2 = createPlayerForTesting();
        beforeEach(() => {
          game.join(player1);
          game.join(player2);
        });
        it('makes the second player black', () => {
          expect(game.state.white).toEqual(player1.id);
          expect(game.state.black).toEqual(player2.id);
        });
        it('sets the game status to IN_PROGRESS', () => {
          expect(game.state.status).toEqual('IN_PROGRESS');
          expect(game.state.winner).toBeUndefined();
          expect(game.state.moves).toHaveLength(0);
        });
      });
    });
  });
  describe('ChessGame _leave', () => {
    it('should throw an error if the player is not in the game', () => {
      expect(() => game.leave(createPlayerForTesting())).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
      const player = createPlayerForTesting();
      game.join(player);
      expect(() => game.leave(createPlayerForTesting())).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
    });
    describe('when the player is in the game', () => {
      describe('when the game is in progress, it should set the game status to OVER and declare the other player the winner', () => {
        test('when white player leaves', () => {
          const player1 = createPlayerForTesting();
          const player2 = createPlayerForTesting();
          game.join(player1);
          game.join(player2);
          expect(game.state.white).toEqual(player1.id);
          expect(game.state.black).toEqual(player2.id);

          game.leave(player1);

          expect(game.state.status).toEqual('OVER');
          expect(game.state.winner).toEqual(player2.id);
          expect(game.state.moves).toHaveLength(0);

          expect(game.state.white).toEqual(player1.id);
          expect(game.state.black).toEqual(player2.id);
        });
        test('when black player leaves', () => {
          const player1 = createPlayerForTesting();
          const player2 = createPlayerForTesting();
          game.join(player1);
          game.join(player2);
          expect(game.state.white).toEqual(player1.id);
          expect(game.state.black).toEqual(player2.id);

          game.leave(player2);

          expect(game.state.status).toEqual('OVER');
          expect(game.state.winner).toEqual(player1.id);
          expect(game.state.moves).toHaveLength(0);

          expect(game.state.white).toEqual(player1.id);
          expect(game.state.black).toEqual(player2.id);
        });
      });
      it('when the game is not in progress, it should set the game status to WAITING_TO_START and remove the player', () => {
        const player1 = createPlayerForTesting();
        game.join(player1);
        expect(game.state.white).toEqual(player1.id);
        expect(game.state.black).toBeUndefined();
        expect(game.state.status).toEqual('WAITING_TO_START');
        expect(game.state.winner).toBeUndefined();
        game.leave(player1);
        expect(game.state.white).toBeUndefined();
        expect(game.state.black).toBeUndefined();
        expect(game.state.status).toEqual('WAITING_TO_START');
        expect(game.state.winner).toBeUndefined();
      });
    });
  });
  describe('applyMove', () => {
    describe('when given an invalid move', () => {
      it('should throw an error if the game is not in progress', () => {
        const player1 = createPlayerForTesting();
        game.join(player1);
        const testPiece = new King('W', 0, 0);
        const move: ChessMove = {
          gamePiece: {
            piece: testPiece,
            row: 0,
            col: 0,
          },
          toRow: 0,
          toCol: 1,
        };
        expect(() =>
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          }),
        ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
      });
      describe('when the game is in progress', () => {
        let player1: Player;
        let player2: Player;
        beforeEach(() => {
          player1 = createPlayerForTesting();
          player2 = createPlayerForTesting();
          game.join(player1);
          game.join(player2);
          expect(game.state.status).toEqual('IN_PROGRESS');
        });
        it('should rely on the player ID to determine whose turn it is', () => {
          const testPiece = new Pawn('W', 1, 1);
          const move: ChessMove = {
            gamePiece: {
              piece: testPiece,
              row: 1,
              col: 1,
            },
            toRow: 2,
            toCol: 1,
          };
          expect(() =>
            game.applyMove({
              gameID: game.id,
              playerID: player2.id,
              move,
            }),
          ).toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
          expect(() =>
            game.applyMove({
              gameID: game.id,
              playerID: player1.id,
              move,
            }),
          ).not.toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
        });
        it('should throw an error if the move is out of turn for the player ID', () => {
          const testPiece = new Pawn('W', 1, 1);
          const move: ChessMove = {
            gamePiece: {
              piece: testPiece,
              row: 1,
              col: 1,
            },
            toRow: 2,
            toCol: 1,
          };
          expect(() =>
            game.applyMove({
              gameID: game.id,
              playerID: player2.id,
              move,
            }),
          ).toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          const testPiece2 = new Pawn('W', 1, 2);
          const move2: ChessMove = {
            gamePiece: {
              piece: testPiece2,
              row: 1,
              col: 2,
            },
            toRow: 2,
            toCol: 2,
          };
          expect(() =>
            game.applyMove({
              gameID: game.id,
              playerID: player1.id,
              move: move2,
            }),
          ).toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
          const testPiece1 = new Pawn('B', 6, 3);
          const move1: ChessMove = {
            gamePiece: {
              piece: testPiece1,
              row: 6,
              col: 3,
            },
            toRow: 5,
            toCol: 3,
          };
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move: move1,
          });
          const testPiece3 = new Rook('W', 0, 0);
          const move3: ChessMove = {
            gamePiece: {
              piece: testPiece3,
              row: 0,
              col: 0,
            },
            toRow: 0,
            toCol: 7,
          };
          expect(() =>
            game.applyMove({
              gameID: game.id,
              playerID: player2.id,
              move: move3,
            }),
          ).toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
        });
        it('should throw an error if the move is on an occupied space of same color', () => {
          const testPiece = new King('W', 0, 4);
          const move: ChessMove = {
            gamePiece: {
              piece: testPiece,
              row: 0,
              col: 4,
            },
            toRow: 0,
            toCol: 5,
          };
          expect(() =>
            game.applyMove({
              gameID: game.id,
              playerID: player1.id,
              move,
            }),
          ).toThrowError(InvalidParametersError);
        });
        it('should throw an error if moving to same square', () => {
          const testPiece = new King('W', 0, 4);
          const move: ChessMove = {
            gamePiece: {
              piece: testPiece,
              row: 0,
              col: 4,
            },
            toRow: 0,
            toCol: 4,
          };
          expect(() =>
            game.applyMove({
              gameID: game.id,
              playerID: player1.id,
              move,
            }),
          ).toThrowError(InvalidParametersError);
        });
        it('should throw an error if move is invalid', () => {
          const testPiece = new King('W', 0, 4);
          const move: ChessMove = {
            gamePiece: {
              piece: testPiece,
              row: 0,
              col: 4,
            },
            toRow: 0,
            toCol: 1,
          };
          expect(() =>
            game.applyMove({
              gameID: game.id,
              playerID: player1.id,
              move,
            }),
          ).toThrowError(InvalidParametersError);
        });
        it('should not change whose turn it is when an invalid move is made', () => {
          const testPiece = new King('W', 0, 4);
          const move: ChessMove = {
            gamePiece: {
              piece: testPiece,
              row: 0,
              col: 4,
            },
            toRow: 0,
            toCol: 5,
          };
          expect(() => {
            game.applyMove({
              gameID: game.id,
              playerID: player1.id,
              move,
            });
          }).toThrowError(InvalidParametersError);
          expect(game.state.moves).toHaveLength(0);
          const testPiece1 = new Pawn('W', 1, 1);
          const move1: ChessMove = {
            gamePiece: {
              piece: testPiece1,
              row: 1,
              col: 1,
            },
            toRow: 2,
            toCol: 1,
          };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: move1,
          });
          expect(game.state.moves).toHaveLength(1);
        });
      });
    });
    describe('when given a valid move', () => {
      let player1: Player;
      let player2: Player;
      beforeEach(() => {
        player1 = createPlayerForTesting();
        player2 = createPlayerForTesting();
        game.join(player1);
        game.join(player2);
        expect(game.state.status).toEqual('IN_PROGRESS');
      });
      function containsPiece(piece: ChessPiece, row: ChessBoardPosition, col: ChessBoardPosition) {
        for (let i = 0; i < game.state.pieces.length; i++) {
          const p = game.state.pieces[i];
          if (
            p.col === col &&
            p.row === row &&
            p.piece.color === piece.color &&
            p.piece.type === piece.type
          ) {
            return true;
          }
        }
        return false;
      }
      it('Valid move should update state', () => {
        const testPiece = new Pawn('W', 1, 0);
        const move: ChessMove = {
          gamePiece: {
            piece: testPiece,
            row: 1,
            col: 0,
          },
          toRow: 3,
          toCol: 0,
        };
        expect(game.state.pieces.length).toEqual(32);
        expect(game.state.moves.length).toEqual(0);
        expect(containsPiece({ color: 'W', type: 'P' }, 1, 0)).toEqual(true);
        game.applyMove({ gameID: game.id, playerID: player1.id, move });
        expect(game.state.pieces.length).toEqual(32);
        expect(game.state.moves.length).toEqual(1);
        expect(game.state.moves[0]).toEqual(move);
        expect(containsPiece({ color: 'W', type: 'P' }, 1, 0)).toEqual(false);
        expect(containsPiece({ color: 'W', type: 'P' }, 3, 0)).toEqual(true);
      });
      it('capture piece should remove a piece', () => {
        expect(game.state.pieces.length).toEqual(32);
        let move: ChessMove = {
          gamePiece: {
            piece: new Pawn('W', 1, 0),
            row: 1,
            col: 0,
          },
          toRow: 3,
          toCol: 0,
        };
        game.applyMove({ gameID: game.id, playerID: player1.id, move });
        move = {
          gamePiece: {
            piece: new Pawn('B', 6, 1),
            row: 6,
            col: 1,
          },
          toRow: 4,
          toCol: 1,
        };
        game.applyMove({ gameID: game.id, playerID: player2.id, move });
        expect(containsPiece({ color: 'B', type: 'P' }, 4, 1)).toEqual(true);
        move = {
          gamePiece: {
            piece: new Pawn('B', 3, 0),
            row: 3,
            col: 0,
          },
          toRow: 4,
          toCol: 1,
        };
        game.applyMove({ gameID: game.id, playerID: player1.id, move });
        expect(containsPiece({ color: 'B', type: 'P' }, 4, 1)).toEqual(false);
        expect(containsPiece({ color: 'W', type: 'P' }, 4, 1)).toEqual(true);
        expect(game.state.pieces.length).toEqual(31);
      });
      it('Casteling short should correctly update board', () => {
        expect(game.state.pieces.length).toEqual(32);
        let move: ChessMove = {
          gamePiece: {
            piece: new Knight('W', 0, 1),
            row: 0,
            col: 1,
          },
          toRow: 2,
          toCol: 2,
        };
        game.applyMove({ gameID: game.id, playerID: player1.id, move });
        move = {
          gamePiece: {
            piece: new Knight('B', 7, 1),
            row: 7,
            col: 1,
          },
          toRow: 5,
          toCol: 2,
        };
        game.applyMove({ gameID: game.id, playerID: player2.id, move });
        move = {
          gamePiece: {
            piece: new Pawn('W', 1, 3),
            row: 1,
            col: 3,
          },
          toRow: 2,
          toCol: 3,
        };
        game.applyMove({ gameID: game.id, playerID: player1.id, move });
        move = {
          gamePiece: {
            piece: new Pawn('B', 6, 3),
            row: 6,
            col: 3,
          },
          toRow: 5,
          toCol: 3,
        };
        game.applyMove({ gameID: game.id, playerID: player2.id, move });
        move = {
          gamePiece: {
            piece: new Bishop('W', 0, 2),
            row: 0,
            col: 2,
          },
          toRow: 1,
          toCol: 3,
        };
        game.applyMove({ gameID: game.id, playerID: player1.id, move });
        move = {
          gamePiece: {
            piece: new Bishop('B', 7, 2),
            row: 7,
            col: 2,
          },
          toRow: 6,
          toCol: 3,
        };
        game.applyMove({ gameID: game.id, playerID: player2.id, move });
        move = {
          gamePiece: {
            piece: new King('W', 0, 3),
            row: 0,
            col: 3,
          },
          toRow: 0,
          toCol: 1,
        };
        game.applyMove({ gameID: game.id, playerID: player1.id, move });
        move = {
          gamePiece: {
            piece: new King('B', 7, 3),
            row: 7,
            col: 3,
          },
          toRow: 7,
          toCol: 1,
        };
        game.applyMove({ gameID: game.id, playerID: player2.id, move });
        expect(containsPiece({ color: 'W', type: 'K' }, 0, 1)).toEqual(true);
        expect(containsPiece({ color: 'W', type: 'R' }, 0, 2)).toEqual(true);
        expect(containsPiece({ color: 'W', type: 'R' }, 0, 0)).toEqual(false);
        expect(containsPiece({ color: 'B', type: 'K' }, 7, 1)).toEqual(true);
        expect(containsPiece({ color: 'B', type: 'R' }, 7, 2)).toEqual(true);
        expect(containsPiece({ color: 'B', type: 'R' }, 7, 0)).toEqual(false);
      });
      it('Casteling long should correctly update board', () => {
        expect(game.state.pieces.length).toEqual(32);
        let move: ChessMove = {
          gamePiece: {
            piece: new Knight('W', 0, 6),
            row: 0,
            col: 6,
          },
          toRow: 2,
          toCol: 7,
        };
        game.applyMove({ gameID: game.id, playerID: player1.id, move });
        move = {
          gamePiece: {
            piece: new Knight('B', 7, 6),
            row: 7,
            col: 6,
          },
          toRow: 5,
          toCol: 7,
        };
        game.applyMove({ gameID: game.id, playerID: player2.id, move });
        move = {
          gamePiece: {
            piece: new Pawn('W', 1, 4),
            row: 1,
            col: 4,
          },
          toRow: 3,
          toCol: 4,
        };
        game.applyMove({ gameID: game.id, playerID: player1.id, move });
        move = {
          gamePiece: {
            piece: new Pawn('B', 6, 4),
            row: 6,
            col: 4,
          },
          toRow: 4,
          toCol: 4,
        };
        game.applyMove({ gameID: game.id, playerID: player2.id, move });
        move = {
          gamePiece: {
            piece: new Queen('W', 0, 4),
            row: 0,
            col: 4,
          },
          toRow: 2,
          toCol: 4,
        };
        game.applyMove({ gameID: game.id, playerID: player1.id, move });
        move = {
          gamePiece: {
            piece: new Queen('W', 7, 4),
            row: 7,
            col: 4,
          },
          toRow: 5,
          toCol: 4,
        };
        game.applyMove({ gameID: game.id, playerID: player2.id, move });
        move = {
          gamePiece: {
            piece: new Bishop('W', 0, 5),
            row: 0,
            col: 5,
          },
          toRow: 1,
          toCol: 4,
        };
        game.applyMove({ gameID: game.id, playerID: player1.id, move });
        move = {
          gamePiece: {
            piece: new Bishop('B', 7, 5),
            row: 7,
            col: 5,
          },
          toRow: 6,
          toCol: 4,
        };
        game.applyMove({ gameID: game.id, playerID: player2.id, move });
        move = {
          gamePiece: {
            piece: new King('W', 0, 3),
            row: 0,
            col: 3,
          },
          toRow: 0,
          toCol: 5,
        };
        game.applyMove({ gameID: game.id, playerID: player1.id, move });
        move = {
          gamePiece: {
            piece: new King('B', 7, 3),
            row: 7,
            col: 3,
          },
          toRow: 7,
          toCol: 5,
        };
        game.applyMove({ gameID: game.id, playerID: player2.id, move });
        expect(containsPiece({ color: 'W', type: 'K' }, 0, 5)).toEqual(true);
        expect(containsPiece({ color: 'W', type: 'R' }, 0, 4)).toEqual(true);
        expect(containsPiece({ color: 'W', type: 'R' }, 0, 7)).toEqual(false);
        expect(containsPiece({ color: 'B', type: 'K' }, 7, 5)).toEqual(true);
        expect(containsPiece({ color: 'B', type: 'R' }, 7, 4)).toEqual(true);
        expect(containsPiece({ color: 'B', type: 'R' }, 7, 7)).toEqual(false);
      });
      it('promoting a pawn changes the peice', () => {
        expect(game.state.pieces.length).toEqual(32);
        let move: ChessMove = {
          gamePiece: {
            piece: new Pawn('W', 1, 0),
            row: 1,
            col: 0,
          },
          toRow: 3,
          toCol: 0,
        };
        game.applyMove({ gameID: game.id, playerID: player1.id, move });
        move = {
          gamePiece: {
            piece: new Pawn('B', 6, 1),
            row: 6,
            col: 1,
          },
          toRow: 4,
          toCol: 1,
        };
        game.applyMove({ gameID: game.id, playerID: player2.id, move });
        move = {
          gamePiece: {
            piece: new Pawn('W', 3, 0),
            row: 3,
            col: 0,
          },
          toRow: 4,
          toCol: 1,
        };
        game.applyMove({ gameID: game.id, playerID: player1.id, move });
        move = {
          gamePiece: {
            piece: new Pawn('B', 6, 0),
            row: 6,
            col: 0,
          },
          toRow: 4,
          toCol: 0,
        };
        game.applyMove({ gameID: game.id, playerID: player2.id, move });
        expect(game.state.pieces.length).toEqual(31);
        // en passant
        move = {
          gamePiece: {
            piece: new Pawn('W', 4, 1),
            row: 4,
            col: 1,
          },
          toRow: 5,
          toCol: 0,
        };
        game.applyMove({ gameID: game.id, playerID: player1.id, move });
        expect(game.state.pieces.length).toEqual(30);
        move = {
          gamePiece: {
            piece: new Bishop('W', 7, 2),
            row: 7,
            col: 2,
          },
          toRow: 6,
          toCol: 1,
        };
        game.applyMove({ gameID: game.id, playerID: player2.id, move });
        move = {
          gamePiece: {
            piece: new Pawn('W', 5, 0),
            row: 5,
            col: 0,
          },
          toRow: 6,
          toCol: 1,
        };
        game.applyMove({ gameID: game.id, playerID: player1.id, move });
        move = {
          gamePiece: {
            piece: new Knight('B', 7, 1),
            row: 7,
            col: 1,
          },
          toRow: 5,
          toCol: 2,
        };
        game.applyMove({ gameID: game.id, playerID: player2.id, move });
        // Promotion
        move = {
          gamePiece: {
            piece: new Pawn('W', 6, 1),
            row: 6,
            col: 1,
          },
          promotion: 'B',
          toRow: 7,
          toCol: 0,
        };
        game.promotePiece({ gameID: game.id, playerID: player1.id, move });
        expect(containsPiece({ color: 'W', type: 'K' }, 7, 0)).toEqual(false);
        expect(containsPiece({ color: 'W', type: 'B' }, 7, 0)).toEqual(true);
      });
      it('should not end the game if the move does not end the game', () => {
        const testPiece = new Pawn('W', 1, 4);
        const move: ChessMove = {
          gamePiece: {
            piece: testPiece,
            row: 1,
            col: 4,
          },
          toRow: 2,
          toCol: 4,
        };
        expect(game.state.moves.length).toEqual(0);
        game.applyMove({ gameID: game.id, playerID: player1.id, move });
        expect(game.state.moves.length).toEqual(1);
        expect(game.state.moves[0]).toEqual(move);
        const testPiece1 = new Pawn('B', 6, 4);
        const move1: ChessMove = {
          gamePiece: {
            piece: testPiece1,
            row: 6,
            col: 4,
          },
          toRow: 5,
          toCol: 4,
        };
        game.applyMove({ gameID: game.id, playerID: player2.id, move: move1 });
        expect(game.state.moves.length).toEqual(2);
        expect(game.state.moves[0]).toEqual(move);
        expect(game.state.moves[1]).toEqual(move1);
      });
      it('should end the game and declare a white win if the black king is not on the board', () => {
        const testPiece = new Pawn('W', 1, 3);
        const move: ChessMove = {
          gamePiece: {
            piece: testPiece,
            row: 1,
            col: 3,
          },
          toRow: 2,
          toCol: 3,
        };
        game.applyMove({ gameID: game.id, playerID: player1.id, move });

        const testPiece1 = new Pawn('B', 6, 4);
        const move1: ChessMove = {
          gamePiece: {
            piece: testPiece1,
            row: 6,
            col: 4,
          },
          toRow: 5,
          toCol: 4,
        };
        game.applyMove({ gameID: game.id, playerID: player2.id, move: move1 });
        const testPiece2 = new Bishop('W', 0, 2);
        const move2: ChessMove = {
          gamePiece: {
            piece: testPiece2,
            row: 0,
            col: 2,
          },
          toRow: 4,
          toCol: 6,
        };
        game.applyMove({ gameID: game.id, playerID: player1.id, move: move2 });

        const testPiece3 = new Pawn('B', 6, 7);
        const move3: ChessMove = {
          gamePiece: {
            piece: testPiece3,
            row: 6,
            col: 7,
          },
          toRow: 5,
          toCol: 7,
        };
        game.applyMove({ gameID: game.id, playerID: player2.id, move: move3 });

        const testPiece4 = new Bishop('W', 4, 6);
        const move4: ChessMove = {
          gamePiece: {
            piece: testPiece4,
            row: 4,
            col: 6,
          },
          toRow: 7,
          toCol: 3,
        };
        game.applyMove({ gameID: game.id, playerID: player1.id, move: move4 });
        expect(game.state.status).toEqual('OVER');
        expect(game.state.winner).toEqual(player1.id);
      });
      it('should end the game and declare a black win if the white king is not on the board', () => {
        const testPiece = new Pawn('W', 1, 4);
        const move: ChessMove = {
          gamePiece: {
            piece: testPiece,
            row: 1,
            col: 4,
          },
          toRow: 2,
          toCol: 4,
        };
        game.applyMove({ gameID: game.id, playerID: player1.id, move });
        const testPiece1 = new Pawn('B', 6, 3);
        const move1: ChessMove = {
          gamePiece: {
            piece: testPiece1,
            row: 6,
            col: 3,
          },
          toRow: 5,
          toCol: 3,
        };
        game.applyMove({ gameID: game.id, playerID: player2.id, move: move1 });
        const testPiece2 = new Pawn('W', 1, 0);
        const move2: ChessMove = {
          gamePiece: {
            piece: testPiece2,
            row: 1,
            col: 0,
          },
          toRow: 2,
          toCol: 0,
        };
        game.applyMove({ gameID: game.id, playerID: player1.id, move: move2 });

        const testPiece3 = new Bishop('B', 7, 2);
        const move3: ChessMove = {
          gamePiece: {
            piece: testPiece3,
            row: 7,
            col: 2,
          },
          toRow: 3,
          toCol: 6,
        };
        game.applyMove({ gameID: game.id, playerID: player2.id, move: move3 });

        const testPiece4 = new Pawn('W', 2, 0);
        const move4: ChessMove = {
          gamePiece: {
            piece: testPiece4,
            row: 2,
            col: 0,
          },
          toRow: 3,
          toCol: 0,
        };
        game.applyMove({ gameID: game.id, playerID: player1.id, move: move4 });

        const testPiece5 = new Bishop('W', 3, 6);
        const move5: ChessMove = {
          gamePiece: {
            piece: testPiece5,
            row: 3,
            col: 6,
          },
          toRow: 0,
          toCol: 3,
        };
        game.applyMove({ gameID: game.id, playerID: player2.id, move: move5 });
        expect(game.state.status).toEqual('OVER');
        expect(game.state.winner).toEqual(player2.id);
      });
    });
  });
});
