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

  return (
    <StyledChessBoard aria-label='Chessboard'>
      {board.map((row, rowIndex) => {
        return row.map((cell, colIndex) => {

          if (townController.ourPlayer === gameAreaController.white) {
            // render the board from the white players POV

          } else {
            // render the board from the black players POV

          }

          return (
            <StyledChessSquareDark
              key={`${rowIndex}.${colIndex}`}
              onClick={async () => {
                try {
                  await gameAreaController.makeMove(
                    {
                      gamePiece: undefined,
                      newRow: 0,
                      newCol: 0,
                    } as ChessMove
                  );
                } catch (e) {
                  toast({
                    title: 'Invalid Move!',
                    description: (e as Error).toString(),
                    status: 'error',
                  });
                }
              }}
              disabled={!isOurTurn}
              aria-label={`Cell ${rowIndex},${colIndex}`}>
              {cell}
            </StyledChessSquareDark>
          );
        });
      })}
    </StyledChessBoard>
  );
}
