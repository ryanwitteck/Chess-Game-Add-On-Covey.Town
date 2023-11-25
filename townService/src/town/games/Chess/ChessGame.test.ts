import { createPlayerForTesting } from '../../../TestUtils';
import {
  GAME_FULL_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../../lib/InvalidParametersError';
import ChessGame from './ChessGame';
import Player from '../../../lib/Player';
import { ChessBoardSquare, ChessPiecePosition } from '../../../types/CoveyTownSocket';

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

  // these tests are broken! 
  describe('ChessGame applyMove', () => {
    let player1: Player;
    let player2: Player;

    beforeEach(() => {
      player1 = createPlayerForTesting();
      player2 = createPlayerForTesting();
      game.join(player1);
      game.join(player2);
    });

    describe('the starting board positions + piece count', () => {
      const newBoard: ChessBoardSquare[][] = ChessGame.createNewBoard();
      // for some reason, the game object is undefined
      // i have no idea what is happening lmao
      console.log(`${game}`);

      expect(game.state.white).toEqual(player1.id);
      expect(game.state.black).toEqual(player2.id);
      expect(game.board).toEqual(newBoard);
      expect(game.state.pieces).toHaveLength(32);

      it('has correct starting piece locations', () => {
        // checks for a rook
        expect(game.board[0][0]?.type).toEqual('R');
        expect(game.board[0][0]?.color).toEqual('W');
        expect(game.board[7][7]?.type).toEqual('R');
        expect(game.board[7][7]?.color).toEqual('B');

        // checks for a pawn
        expect(game.board[1][4]?.type).toEqual('P');
        expect(game.board[1][4]?.color).toEqual('W');
        expect(game.board[6][4]?.type).toEqual('P');
        expect(game.board[6][4]?.color).toEqual('B');

        // checks for the kings
        expect(game.board[0][4]?.type).toEqual('K');
        expect(game.board[0][4]?.color).toEqual('W');
        expect(game.board[7][4]?.type).toEqual('K');
        expect(game.board[7][4]?.color).toEqual('B');

        // checks for the queens
        expect(game.board[0][3]?.type).toEqual('Q');
        expect(game.board[0][3]?.color).toEqual('W');
        expect(game.board[7][3]?.type).toEqual('Q');
        expect(game.board[7][3]?.color).toEqual('B');
      });
    });

    // TODO: add tests for mismatched playerID & gameID

    describe('when a legal moves are made:', () => {
      test('player one makes 1 legal move', () => {
        const gamePieceToMove = {
          piece: { type: 'P', color: 'W' },
          row: 1,
          col: 2,
        } as ChessPiecePosition;

        const gamePieceToMoveIndex = game.state.pieces.findIndex(
          piece =>
            piece.piece.type === gamePieceToMove.piece.type &&
            piece.piece.color === gamePieceToMove.piece.color &&
            piece.row === gamePieceToMove.row &&
            piece.col === gamePieceToMove.col,
        );``
        game.applyMove({
          playerID: player1.id,
          gameID: game.id,
          move: {
            gamePiece: gamePieceToMove,
            toRow: 3,
            toCol: 2,
          }
        });
        expect(game.board[1][2]).toBeUndefined();
        expect(game.board[3][2]?.type).toEqual('P');
        expect(game.board[3][2]?.color).toEqual('W');
        expect(game.state.pieces[gamePieceToMoveIndex]).toEqual({
          piece: { type: 'P', color: 'W' },
          row: 3,
          col: 2,
        } as ChessPiecePosition);
      });
      describe('when a piece takes another piece:', () => {
        it('', () => {
  
        });
      });
    });
  });
});
