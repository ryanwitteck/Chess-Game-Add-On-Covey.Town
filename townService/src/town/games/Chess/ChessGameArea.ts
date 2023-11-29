import InvalidParametersError, {
  GAME_ID_MISSMATCH_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  INVALID_COMMAND_MESSAGE,
} from '../../../lib/InvalidParametersError';
import Player from '../../../lib/Player';
import {
  GameInstance,
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableType,
  ChessGameState,
} from '../../../types/CoveyTownSocket';
import GameArea from '../GameArea';
import ChessGame from './ChessGame';

/**
 * A ChessGameArea is a GameArea that hosts a ChessGame.
 * @see ChessGame
 * @see GameArea
 */
export default class ChessGameArea extends GameArea<ChessGame> {
  protected getType(): InteractableType {
    return 'ChessArea';
  }

  private _stateUpdated(updatedState: GameInstance<ChessGameState>) {
    if (updatedState.state.status === 'OVER') {
      // If we haven't yet recorded the outcome, do so now.
      const gameID = this._game?.id;
      if (gameID && !this._history.find(eachResult => eachResult.gameID === gameID)) {
        const { white, black } = updatedState.state;
        if (white && black) {
          const whiteName =
            this._occupants.find(eachPlayer => eachPlayer.id === white)?.userName || white;
          const blackName =
            this._occupants.find(eachPlayer => eachPlayer.id === black)?.userName || black;
          this._history.push({
            gameID,
            scores: {
              [whiteName]: updatedState.state.winner === white ? 1 : 0,
              [blackName]: updatedState.state.winner === black ? 1 : 0,
            },
          });
        }
      }
    }
    this._emitAreaChanged();
  }

  /**
   * Handle a command from a player in this game area.
   * Supported commands:
   * - JoinGame (joins the game `this._game`, or creates a new one if none is in progress)
   * - ChessMove (applies a move to the game)
   * - LeaveGame (leaves the game)
   * - ChessDraw (sets the game to draw)
   * - UpdateTimerType (sets game's time controls)
   *
   * If the command ended the game, records the outcome in this._history
   * If the command is successful (does not throw an error), calls this._emitAreaChanged (necessary
   *  to notify any listeners of a state update, including any change to history)
   * If the command is unsuccessful (throws an error), the error is propagated to the caller
   *
   * @see InteractableCommand
   *
   * @param command command to handle
   * @param player player making the request
   * @returns response to the command, @see InteractableCommandResponse
   * @throws InvalidParametersError if the command is not supported or is invalid. Invalid commands:
   *  - LeaveGame and GameMove: No game in progress (GAME_NOT_IN_PROGRESS_MESSAGE),
   *        or gameID does not match the game in progress (GAME_ID_MISSMATCH_MESSAGE)
   *  - Any command besides LeaveGame, GameMove and JoinGame: INVALID_COMMAND_MESSAGE
   */
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'ChessMove') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }

      // if true, then we are trying to promote!
      if (command.promotion) {
        // eslint-disable-next-line no-console
        console.log('Chess Game Area: we want to promote!');
        game.promotePiece({
          gameID: command.gameID,
          playerID: player.id,
          move: command.move, // this also holds promotion information
        });
      } else {
        // eslint-disable-next-line no-console
        console.log('Chess Game Area: normal move');
        game.applyMove({
          gameID: command.gameID,
          playerID: player.id,
          move: command.move,
        });
      }
      this._stateUpdated(game.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'UpdateTimerType') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      game.setTimerType(command.timerType);
      this._stateUpdated(game.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }

    // handle the draw logic here.
    if (command.type === 'ChessDraw') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }
      this._stateUpdated(game.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'JoinGame') {
      let game = this._game;
      if (!game || game.state.status === 'OVER') {
        // No chess game in progress, make a new one
        game = new ChessGame();
        this._game = game;
      }
      game.join(player);
      this._stateUpdated(game.toModel());
      return { gameID: game.id } as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'LeaveGame') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }
      game.leave(player);
      game.setTimerType(undefined);
      this._stateUpdated(game.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
  }
}
