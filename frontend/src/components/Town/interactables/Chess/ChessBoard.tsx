import { Button, chakra, Container, useToast } from '@chakra-ui/react';
import { getActiveElement } from '@testing-library/user-event/dist/types/utils';
import React, { useEffect, useState } from 'react';
import ChessAreaController from '../../../../classes/interactable/ChessAreaController';
import TownController from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { ChessMove, IChessPiece } from '../../../../types/CoveyTownSocket';

export type ChessGameProps = {
  gameAreaController: ChessAreaController;
};

/**
 * A component that will render a single cell on a Chess board, styled.
 * This component is made specifically to render the light squares.
 */
const StyledChessSquareLight = chakra(Button, {
  baseStyle: {
    background: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    flexBasis: '33%',
    width: '12%',
    height: '12%',
    fontSize: '50px',
    _disabled: {
      opacity: '100%',
    },
  },
});

/**
 * A component that will render a single cell on a Chess board, styled.
 * This component is made specifically to render the dark squares.
 */
const StyledChessSquareDark = chakra(Button, {
  baseStyle: {
    background: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    flexBasis: '33%',
    width: '12.5%',
    height: '12.5%',
    fontSize: '50px',
    _disabled: {
      opacity: '100%',
    },
  },
});

/**
 * A component that will render the TicTacToe board, styled
 */
const StyledChessBoard = chakra(Container, {
  baseStyle: {
    display: 'flex',
    width: '800px',
    height: '800px',
    padding: '5px',
    flexWrap: 'wrap',
  },
});


/**
 * TODO: Documentation
 *
 * @param gameAreaController the controller for the Chess game
 */
export default function ChessBoard({ gameAreaController }: ChessGameProps): JSX.Element {
  const townController = useTownController();

  const [board, setBoard] = useState<IChessPiece[][]>(gameAreaController.board);
  const [isOurTurn, setIsOurTurn] = useState(gameAreaController.isOurTurn);

  const toast = useToast();

  useEffect(() => {
    gameAreaController.addListener('turnChanged', setIsOurTurn);
    gameAreaController.addListener('boardChanged', setBoard);
    return () => {
      gameAreaController.removeListener('boardChanged', setBoard);
      gameAreaController.removeListener('turnChanged', setIsOurTurn);
    };
  }, [gameAreaController]);

  // TODO: these functions are massive! we need to clean it up.
  // renders the board from the Black player's POV.
  function renderBlackPlayerPOV(gameAreaController: ChessAreaController): JSX.Element {
    const renderBoard: JSX.Element[][] = [];
    for (let i = 7; i >= 0; i--) {
      for (let j = 7; j >= 0; j--) {
        if ((i % 2 === 0 && j % 2 === 0) || (i % 2 != 0 && j % 2 != 0)) {
          renderBoard[i][j] = (
            <StyledChessSquareDark
              key={`${i}.${j}`}
              onClick={async () => {
                try { // TODO: makeMove logic
                      // we need to store a "picked up" variable, or something
                      // to keep track of when the user is about to move a piece.
                      //
                      // a boolean flag should be good enough; if it's our turn, and the
                      // user has clicked a piece, then we assume that's the piece they
                      // want to move. the next click on a square then is made as a move.
                      // if the move is not legal, reject it, and wait until the player makes
                      // a legal move.
                  await gameAreaController.makeMove({
                    gamePiece: undefined,
                    newRow: 0,
                    newCol: 0,
                  });
                } catch (e) {
                  toast({
                    title: 'Error making move',
                    description: (e as Error).toString(),
                    status: 'error',
                  });
                }
              }}
              disabled={!isOurTurn}
              aria-label={`Cell ${i},${j}`}>
              { /* Here, we draw the piece depending on if there's a gamepiece inside*/ }
            </StyledChessSquareDark>
          );
        } else {
          renderBoard[i][j] = (
            <StyledChessSquareLight
              key={`${i}.${j}`}
              onClick={async () => {
                try { // TODO: makeMove logic
                      // we need to store a "picked up" variable, or something
                      // to keep track of when the user is about to move a piece.
                      //
                      // a boolean flag should be good enough; if it's our turn, and the
                      // user has clicked a piece, then we assume that's the piece they
                      // want to move. the next click on a square then is made as a move.
                      // if the move is not legal, reject it, and wait until the player makes
                      // a legal move.
                  await gameAreaController.makeMove({
                    gamePiece: undefined,
                    newRow: 0,
                    newCol: 0,
                  });
                } catch (e) {
                  toast({
                    title: 'Error making move',
                    description: (e as Error).toString(),
                    status: 'error',
                  });
                }
              }}
              disabled={!isOurTurn}
              aria-label={`Cell ${i},${j}`}>
              { /* Here, we draw the piece depending on if there's a gamepiece inside*/ }
            </StyledChessSquareLight>
          );
        }
      }
    }
  
    return (
      <StyledChessBoard aria-label='Chessboard'>
        { renderBoard }
      </StyledChessBoard>
    );
  }

  // TODO: these functions are massive! we need to clean it up.
  // Displays the board from the White player's POV.
  function renderWhitePlayerPOV(gameAreaController: ChessAreaController): JSX.Element {  
    const renderBoard: JSX.Element[][] = [];
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[0].length; j++) {
        if ((i % 2 === 0 && j % 2 === 0) || (i % 2 != 0 && j % 2 != 0)) {
          renderBoard[i][j] = (
            <StyledChessSquareDark
              key={`${i}.${j}`}
              onClick={async () => {
                try { // TODO: makeMove logic
                      // we need to store a "picked up" variable, or something
                      // to keep track of when the user is about to move a piece.
                      //
                      // a boolean flag should be good enough; if it's our turn, and the
                      // user has clicked a piece, then we assume that's the piece they
                      // want to move. the next click on a square then is made as a move.
                      // if the move is not legal, reject it, and wait until the player makes
                      // a legal move.
                  await gameAreaController.makeMove({
                    gamePiece: undefined,
                    newRow: 0,
                    newCol: 0,
                  });
                } catch (e) {
                  toast({
                    title: 'Error making move',
                    description: (e as Error).toString(),
                    status: 'error',
                  });
                }
              }}
              disabled={!isOurTurn}
              aria-label={`Cell ${i},${j}`}>
              { /* Here, we draw the piece depending on if there's a gamepiece inside*/ }
            </StyledChessSquareDark>
          );
        } else {
          renderBoard[i][j] = (
            <StyledChessSquareLight
              key={`${i}.${j}`}
              onClick={async () => {
                try { // TODO: makeMove logic
                      // we need to store a "picked up" variable, or something
                      // to keep track of when the user is about to move a piece.
                      //
                      // a boolean flag should be good enough; if it's our turn, and the
                      // user has clicked a piece, then we assume that's the piece they
                      // want to move. the next click on a square then is made as a move.
                      // if the move is not legal, reject it, and wait until the player makes
                      // a legal move.
                  await gameAreaController.makeMove({
                    gamePiece: undefined,
                    newRow: 0,
                    newCol: 0,
                  });
                } catch (e) {
                  toast({
                    title: 'Error making move',
                    description: (e as Error).toString(),
                    status: 'error',
                  });
                }
              }}
              disabled={!isOurTurn}
              aria-label={`Cell ${i},${j}`}>
              { /* Here, we draw the piece depending on if there's a gamepiece inside*/ }
            </StyledChessSquareLight>
          );
        }
      }
    }
  
    return (
      <StyledChessBoard aria-label='Chessboard'>
        { renderBoard }
      </StyledChessBoard>
    );
  }

  return (
    <>{renderWhitePlayerPOV(gameAreaController)}</>
  );
}
