import assert from 'assert';
import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import {
  GameArea,
  GameResult,
  GameStatus,
  ChessGameState,
  ChessMove,
  ChessPiece,
  ChessPiecePosition,
  ChessBoardPosition,
  ChessBoardSquare,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import TownController from '../TownController';
import GameAreaController from './GameAreaController';
import ChessAreaController, { NO_GAME_IN_PROGRESS_ERROR } from './ChessAreaController';

describe('[T1] ChessAreaController', () => {
  const ourPlayer = new PlayerController(nanoid(), nanoid(), {
    x: 0,
    y: 0,
    moving: false,
    rotation: 'front',
  });
  const otherPlayers = [
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
  ];

  const mockTownController = mock<TownController>();
  Object.defineProperty(mockTownController, 'ourPlayer', {
    get: () => ourPlayer,
  });
  Object.defineProperty(mockTownController, 'players', {
    get: () => [ourPlayer, ...otherPlayers],
  });
  mockTownController.getPlayer.mockImplementation(playerID => {
    const p = mockTownController.players.find(player => player.id === playerID);
    assert(p);
    return p;
  });
  function _createNewBoard(): ChessBoardSquare[][] {
    // fill the board with undefined cells
    const newBoard = Array.from({ length: 8 }).map(() => Array.from({ length: 8 }).fill(undefined));
  
    // instantiate the pawns
    for (let col = 0; col < 8; col++) {
      newBoard[1][col] = { type: 'P', color: 'W' } as ChessPiece;
      newBoard[6][col] = { type: 'P', color: 'B' } as ChessPiece;
    }
  
    // Add in the Rooks:
    newBoard[0][0] = { type: 'R', color: 'W' } as ChessPiece;
    newBoard[0][7] = { type: 'R', color: 'W' } as ChessPiece;
    newBoard[7][0] = { type: 'R', color: 'B' } as ChessPiece;
    newBoard[7][7] = { type: 'R', color: 'B' } as ChessPiece;
  
    // Add in the Knights:
    newBoard[0][1] = { type: 'N', color: 'W' } as ChessPiece;
    newBoard[0][6] = { type: 'N', color: 'W' } as ChessPiece;
    newBoard[7][1] = { type: 'N', color: 'B' } as ChessPiece;
    newBoard[7][6] = { type: 'N', color: 'B' } as ChessPiece;
  
    // Add in the Bishops:
    newBoard[0][2] = { type: 'B', color: 'W' } as ChessPiece;
    newBoard[0][5] = { type: 'B', color: 'W' } as ChessPiece;
    newBoard[7][2] = { type: 'B', color: 'B' } as ChessPiece;
    newBoard[7][5] = { type: 'B', color: 'B' } as ChessPiece;
  
    // Add in Queens:
    newBoard[0][4] = { type: 'Q', color: 'W' } as ChessPiece;
    newBoard[7][4] = { type: 'Q', color: 'B' } as ChessPiece;
  
    // Add in Kings:
    newBoard[0][3] = { type: 'K', color: 'W' } as ChessPiece;
    newBoard[7][3] = { type: 'K', color: 'B' } as ChessPiece;
  
    return newBoard as ChessBoardSquare[][];
  }
  function chessAreaControllerWithProp({
    _id,
    history,
    white,
    black,
    undefinedGame,
    status,
    moves,
    pieces,
    winner,
  }: {
    _id?: string;
    history?: GameResult[];
    white?: string;
    black?: string;
    undefinedGame?: boolean;
    status?: GameStatus;
    moves?: ChessMove[];
    pieces?: ChessPiecePosition[];
    winner?: string;
  }) {
    const id = _id || nanoid();
    const players = [];
    if (white) players.push(white);
    if (black) players.push(black);
    const ret = new ChessAreaController(
      id,
      {
        id,
        occupants: players,
        history: history || [],
        type: 'ChessArea',
        game: undefinedGame
          ? undefined
          : {
            id,
            players: players,
            state: {
              status: status || 'IN_PROGRESS',
              white: white,
              black: black,
              moves: moves || [],
              pieces: pieces || [],
              winner: winner,
            },
          },
      },
      mockTownController,
    );
    if (players) {
      ret.occupants = players
        .map(eachID => mockTownController.players.find(eachPlayer => eachPlayer.id === eachID))
        .filter(eachPlayer => eachPlayer) as PlayerController[];
    }
    return ret;
  }
  describe('[T1.1]', () => {
    describe('isActive', () => {
      it('should return true if the game is in progress', () => {
        const controller = chessAreaControllerWithProp({
          status: 'IN_PROGRESS',
        });
        expect(controller.isActive()).toBe(true);
      });
      it('should return false if the game is not in progress', () => {
        const controller = chessAreaControllerWithProp({
          status: 'OVER',
        });
        expect(controller.isActive()).toBe(false);
      });
    });
    describe('isPlayer', () => {
      it('should return true if the current player is a player in this game', () => {
        const controller = chessAreaControllerWithProp({
          status: 'IN_PROGRESS',
          white: ourPlayer.id,
        });
        expect(controller.isPlayer).toBe(true);
      });
      it('should return false if the current player is not a player in this game', () => {
        const controller = chessAreaControllerWithProp({
          status: 'IN_PROGRESS',
          white: otherPlayers[0].id,
          black: otherPlayers[1].id,
        });
        expect(controller.isPlayer).toBe(false);
      });
    });
    describe('whoseTurn', () => {
      it('should return the player whose turn it is initially', () => {
        const controller = chessAreaControllerWithProp({
          status: 'IN_PROGRESS',
          white: ourPlayer.id,
          black: otherPlayers[0].id,
        });
        expect(controller.whoseTurn).toBe(ourPlayer);
      });
      it('should return the player whose turn it is after a move', () => {
        const controller = chessAreaControllerWithProp({
          status: 'IN_PROGRESS',
          white: ourPlayer.id,
          black: otherPlayers[0].id,
          moves: [
            {
              gamePiece: {
                piece: { type: 'P', color: 'W' } as ChessPiece,
                row: 1,
                col: 0,
              },
              toRow: 2,
              toCol: 0,
            },
          ],
        });
        expect(controller.whoseTurn).toBe(otherPlayers[0]);
      });
      it('should return undefined if the game is not in progress', () => {
        const controller = chessAreaControllerWithProp({
          status: 'OVER',
          white: ourPlayer.id,
          black: otherPlayers[0].id,
        });
        expect(controller.whoseTurn).toBe(undefined);
      });
    });
    describe('isOurTurn', () => {
      it('should return true if it is our turn', () => {
        const controller = chessAreaControllerWithProp({
          status: 'IN_PROGRESS',
          white: ourPlayer.id,
          black: otherPlayers[0].id,
        });
        expect(controller.isOurTurn).toBe(true);
      });
      it('should return false if it is not our turn', () => {
        const controller = chessAreaControllerWithProp({
          status: 'IN_PROGRESS',
          white: otherPlayers[0].id,
          black: ourPlayer.id,
        });
        expect(controller.isOurTurn).toBe(false);
      });
    });
    describe('moveCount', () => {
      it('should return the number of moves that have been made', () => {
        const controller = chessAreaControllerWithProp({
          status: 'IN_PROGRESS',
          white: ourPlayer.id,
          black: otherPlayers[0].id,
          moves: [
            {
              gamePiece: {
                piece: { type: 'P', color: 'W' } as ChessPiece,
                row: 1,
                col: 0,
              },
              toRow: 2,
              toCol: 0,
            },
          ],
        });
        expect(controller.moveCount).toBe(1);
      });
    });
    describe('board', () => {
      it('should return an empty board by default', () => {
        const controller = chessAreaControllerWithProp({
          status: 'IN_PROGRESS',
          white: ourPlayer.id,
          black: otherPlayers[0].id,
        });
        expect(controller.board).toEqual(_createNewBoard());
      });
    });
    describe('white', () => {
      it('should return the white player if there is one', () => {
        const controller = chessAreaControllerWithProp({
          status: 'IN_PROGRESS',
          white: ourPlayer.id,
          black: otherPlayers[0].id,
        });
        expect(controller.white).toBe(ourPlayer);
      });
      it('should return undefined if there is no white player and the game is waiting to start', () => {
        const controller = chessAreaControllerWithProp({
          status: 'WAITING_TO_START',
        });
        expect(controller.white).toBe(undefined);
      });
      it('should return undefined if there is no white player', () => {
        const controller = chessAreaControllerWithProp({
          status: 'IN_PROGRESS',
          black: otherPlayers[0].id,
        });
        expect(controller.white).toBe(undefined);
      });
    });
    describe('black', () => {
      it('should return the black player if there is one', () => {
        const controller = chessAreaControllerWithProp({
          status: 'IN_PROGRESS',
          white: otherPlayers[0].id,
          black: ourPlayer.id,
        });
        expect(controller.black).toBe(ourPlayer);
      });
      it('should return undefined if there is no black player and the game is waiting to start', () => {
        const controller = chessAreaControllerWithProp({
          status: 'WAITING_TO_START',
        });
        expect(controller.black).toBe(undefined);
      });
      it('should return undefined if there is no black player', () => {
        const controller = chessAreaControllerWithProp({
          status: 'IN_PROGRESS',
          white: otherPlayers[0].id,
        });
        expect(controller.black).toBe(undefined);
      });
    });
    describe('winner', () => {
      it('should return the winner if there is one', () => {
        const controller = chessAreaControllerWithProp({
          status: 'OVER',
          white: otherPlayers[0].id,
          black: ourPlayer.id,
          winner: ourPlayer.id,
        });
        expect(controller.winner).toBe(ourPlayer);
      });
      it('should return undefined if there is no winner', () => {
        const controller = chessAreaControllerWithProp({
          status: 'OVER',
          white: otherPlayers[0].id,
          black: ourPlayer.id,
        });
        expect(controller.winner).toBe(undefined);
      });
    });
    describe('makeMove', () => {
      it('should throw an error if the game is not in progress', async () => {
        const controller = chessAreaControllerWithProp({});
        await expect(async () => controller.makeMove({
          gamePiece: {
            piece: { type: 'P', color: 'W' } as ChessPiece,
            row: 1,
            col: 0,
          },
          toRow: 2,
          toCol: 0,
        })).rejects.toEqual(
          new Error(NO_GAME_IN_PROGRESS_ERROR),
        );
      });
      it('Should call townController.sendInteractableCommand', async () => {
        const controller = chessAreaControllerWithProp({
          status: 'IN_PROGRESS',
          white: ourPlayer.id,
          black: otherPlayers[0].id,
        });
        // Simulate joining the game for real
        const instanceID = nanoid();
        mockTownController.sendInteractableCommand.mockImplementationOnce(async () => {
          return { gameID: instanceID };
        });
        await controller.joinGame();
        mockTownController.sendInteractableCommand.mockReset();
        await controller.makeMove({
          gamePiece: {
            piece: { type: 'P', color: 'W' } as ChessPiece,
            row: 1,
            col: 0,
          },
          toRow: 2,
          toCol: 0,
        });
        expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(controller.id, {
          type: 'ChessMove',
          gameID: instanceID,
          move: {
            gamePiece: {
              piece: { type: 'P', color: 'W' } as ChessPiece,
              row: 1,
              col: 0,
            },
            toRow: 2,
            toCol: 0,
          },
        });
      });
    });
  });
  describe('[T1.2] _updateFrom', () => {
    describe('if the game is in progress', () => {
      let controller: ChessAreaController;
      beforeEach(() => {
        controller = chessAreaControllerWithProp({
          status: 'IN_PROGRESS',
          white: ourPlayer.id,
          black: otherPlayers[0].id,
        });
        for (let i: ChessBoardPosition = 0; i <= 7; i++) {
          for (let j: ChessBoardPosition = 0; j <= 7; j++) {
            if (controller.board[i][j] !== undefined) {
              
            }
          }
        }
      });
      it('should emit a boardChanged event with the new board', () => {
        const model = controller.toInteractableAreaModel();
        const newMoves: ReadonlyArray<ChessMove> = [
          {
            gamePiece: {
              piece: { type: 'P', color: 'W' } as ChessPiece,
              row: 1,
              col: 0,
            },
            toRow: 2,
            toCol: 0,
          },
          {
            gamePiece: {
              piece: { type: 'P', color: 'B' } as ChessPiece,
              row: 6,
              col: 0,
            },
            toRow: 5,
            toCol: 0,
          },
        ];
        
        assert(model.game);
        const newModel: GameArea<ChessGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
              moves: newMoves,
            },
          },
        };
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));
        const boardChangedCall = emitSpy.mock.calls.find(call => call[0] === 'boardChanged');
        expect(boardChangedCall).toBeDefined();
        if (boardChangedCall)
        expect(controller.board).toEqual([
          [undefined, undefined, undefined,undefined,undefined,undefined,undefined,undefined],
          [undefined, undefined, undefined,undefined,undefined,undefined,undefined,undefined],
          [undefined, undefined, undefined,undefined,undefined,undefined,undefined,undefined],
          [undefined, undefined, undefined,undefined,undefined,undefined,undefined,undefined],
          [undefined, undefined, undefined,undefined,undefined,undefined,undefined,undefined],
          [undefined, undefined, undefined,undefined,undefined,undefined,undefined,undefined],
          [undefined, undefined, undefined,undefined,undefined,undefined,undefined,undefined],
          [undefined, undefined, undefined,undefined,undefined,undefined,undefined,undefined],
        ]);
      });
      it('should emit a turnChanged event with true if it is our turn', () => {
        const model = controller.toInteractableAreaModel();
        const newMoves: ReadonlyArray<ChessMove> = [
          {
            gamePiece: {
              piece: { type: 'P', color: 'W' } as ChessPiece,
              row: 1,
              col: 0,
            },
            toRow: 2,
            toCol: 0,
          },
          {
            gamePiece: {
              piece: { type: 'P', color: 'B' } as ChessPiece,
              row: 6,
              col: 0,
            },
            toRow: 5,
            toCol: 0,
          },
        ];
        assert(model.game);
        const newModel: GameArea<ChessGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
              moves: [newMoves[0]],
            },
          },
        };
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));
        const testModel: GameArea<ChessGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
              moves: newMoves,
            },
          },
        };
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(testModel, otherPlayers.concat(ourPlayer));
        const turnChangedCall = emitSpy.mock.calls.find(call => call[0] === 'turnChanged');
        expect(turnChangedCall).toBeDefined();
        if (turnChangedCall) expect(turnChangedCall[1]).toEqual(true);
      });
      it('should emit a turnChanged event with false if it is not our turn', () => {
        const model = controller.toInteractableAreaModel();
        const newMoves: ReadonlyArray<ChessMove> = [
          {
            gamePiece: {
              piece: { type: 'P', color: 'W' } as ChessPiece,
              row: 1,
              col: 0,
            },
            toRow: 2,
            toCol: 0,
          },
        ];
        expect(controller.isOurTurn).toBe(true);
        assert(model.game);
        const newModel: GameArea<ChessGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
              moves: newMoves,
            },
          },
        };
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));
        const turnChangedCall = emitSpy.mock.calls.find(call => call[0] === 'turnChanged');
        expect(turnChangedCall).toBeDefined();
        if (turnChangedCall) expect(turnChangedCall[1]).toEqual(false);
      });
      it('should not emit a turnChanged event if the turn has not changed', () => {
        const model = controller.toInteractableAreaModel();
        assert(model.game);
        expect(controller.isOurTurn).toBe(true);
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(model, otherPlayers.concat(ourPlayer));
        const turnChangedCall = emitSpy.mock.calls.find(call => call[0] === 'turnChanged');
        expect(turnChangedCall).not.toBeDefined();
      });
      it('should not emit a boardChanged event if the board has not changed', () => {
        const model = controller.toInteractableAreaModel();
        assert(model.game);

        const newMoves: ReadonlyArray<ChessMove> = [
          {
            gamePiece: {
              piece: { type: 'P', color: 'W' } as ChessPiece,
              row: 1,
              col: 0,
            },
            toRow: 2,
            toCol: 0,
          },
          {
            gamePiece: {
              piece: { type: 'P', color: 'B' } as ChessPiece,
              row: 6,
              col: 0,
            },
            toRow: 5,
            toCol: 0,
          },
        ];
        const newModel: GameArea<ChessGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
              moves: newMoves,
            },
          },
        };
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));

        const newMovesWithShuffle: ReadonlyArray<ChessMove> = [
          {
            gamePiece: {
              piece: { type: 'P', color: 'W' } as ChessPiece,
              row: 1,
              col: 0,
            },
            toRow: 2,
            toCol: 0,
          },
          {
            gamePiece: {
              piece: { type: 'P', color: 'B' } as ChessPiece,
              row: 6,
              col: 0,
            },
            toRow: 5,
            toCol: 0,
          },
        ];

        const newModelWithSuffle: GameArea<ChessGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
              moves: newMovesWithShuffle,
            },
          },
        };
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(newModelWithSuffle, otherPlayers.concat(ourPlayer));
        const turnChangedCall = emitSpy.mock.calls.find(call => call[0] === 'boardChanged');
        expect(turnChangedCall).not.toBeDefined();
      });
      it('should update the board returned by the board property', () => {
        const model = controller.toInteractableAreaModel();
        const newMoves: ReadonlyArray<ChessMove> = [
          {
            gamePiece: {
              piece: { type: 'P', color: 'W' } as ChessPiece,
              row: 1,
              col: 0,
            },
            toRow: 2,
            toCol: 0,
          },
          {
            gamePiece: {
              piece: { type: 'P', color: 'B' } as ChessPiece,
              row: 6,
              col: 0,
            },
            toRow: 5,
            toCol: 0,
          },
        ];
        assert(model.game);
        const newModel: GameArea<ChessGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
              moves: newMoves,
            },
          },
        };
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));
        expect(controller.board).toEqual([
          [undefined, undefined, undefined,undefined,undefined,undefined,undefined,undefined],
          [undefined, undefined, undefined,undefined,undefined,undefined,undefined,undefined],
          [undefined, undefined, undefined,undefined,undefined,undefined,undefined,undefined],
          [undefined, undefined, undefined,undefined,undefined,undefined,undefined,undefined],
          [undefined, undefined, undefined,undefined,undefined,undefined,undefined,undefined],
          [undefined, undefined, undefined,undefined,undefined,undefined,undefined,undefined],
          [undefined, undefined, undefined,undefined,undefined,undefined,undefined,undefined],
          [undefined, undefined, undefined,undefined,undefined,undefined,undefined,undefined],
        ]);
      });
    });
    it('should call super._updateFrom', () => {
      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore - we are testing spying on a private method
      const spy = jest.spyOn(GameAreaController.prototype, '_updateFrom');
      const controller = chessAreaControllerWithProp({});
      const model = controller.toInteractableAreaModel();
      controller.updateFrom(model, otherPlayers.concat(ourPlayer));
      expect(spy).toHaveBeenCalled();
    });
  });
});



