import { Button, chakra, SimpleGrid, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { ChessBoardPosition, ChessBoardSquare, ChessColor, ChessMove, ChessPiecePosition } from '../../../../../../shared/types/CoveyTownSocket';
import ChessAreaController from '../../../../classes/interactable/ChessAreaController';
import useTownController from '../../../../hooks/useTownController';

export type ChessGameProps = {
  gameAreaController: ChessAreaController;
};

/**
 * A component that will render a single cell on a Chess board, styled.
 */
const StyledChessSquare = chakra(Button, {
  justifyContent: 'center',
  padding: '0px',
  flexBasis: '12.5%',
  alignItems: 'center',
  fontSize: '150px',
  borderRadius: '0px',
  _disabled: {
    opacity: '100%',
  },
});

/**
 * A component that will render the TicTacToe board, styled
 */
const StyledChessBoard = chakra(SimpleGrid, {
  display: 'flex',
  flexWrap: 'wrap',
  textAlign: 'center',
  maxWidth: '800px',
  maxHeight: '800px',
});


/**
 * TODO: Documentation
 *
 * @param gameAreaController the controller for the Chess game
 */
export default function ChessBoard({ gameAreaController }: ChessGameProps): JSX.Element {
  const townController = useTownController();

  const gameState = gameAreaController.status
  const [primed, setPrimed] = useState(false);
  const [primedPiece, setPrimedPiece] = useState<ChessPiecePosition | undefined>(undefined);
  const [board, setBoard] = useState<ChessBoardSquare[][]>(gameAreaController.board);
  const [isOurTurn, setIsOurTurn] = useState(gameAreaController.isOurTurn);

  const toast = useToast();

  useEffect(() => {
    console.log(board);
    gameAreaController.addListener('turnChanged', setIsOurTurn);
    gameAreaController.addListener('boardChanged', setBoard);
    return () => {
      gameAreaController.removeListener('boardChanged', setBoard);
      gameAreaController.removeListener('turnChanged', setIsOurTurn);
    };
  }, [gameAreaController, townController, board, isOurTurn, primed, primedPiece]);

  function RenderWhitePlayerPOV(): JSX.Element {
    const renderBoard: JSX.Element[] = [];
    
    // function to make a move with the primed piece
    const makeMove = async (toRow: ChessBoardPosition, toCol: ChessBoardPosition) => {
      await gameAreaController.makeMove({
        gamePiece: primedPiece as ChessPiecePosition,
        toRow: toRow,
        toCol: toCol,
      } as ChessMove);
      setPrimed(false);
      setPrimedPiece(undefined);
    }

    for (let i = 7; i >= 0; i--) {
      for (let j = 0; j <=7; j++) {
        const isDarkSquare = (i % 2 === 0 && j % 2 === 0) || (i % 2 !== 0 && j % 2 !== 0);
        const squareColor = isDarkSquare ? 'DimGrey' : 'WhiteSmoke';

        if (board[i] && board[i][j]) {
          renderBoard.push(
            <StyledChessSquare
              key={`${i}.${j}`}
              disabled={!isOurTurn}
              padding={0}
              borderRadius={0}
              height={70}
              width={70}
              background={squareColor}
              color={board[i][j]?.color === 'W' ? 'white' : 'black' ?? 'white'}

              onClick={async () => {
                console.log(`Button ${i},${j} was clicked!`);
                console.log('clicked on an occupied square');
                
                if (board[i][j]?.color === gameAreaController.gameColor) {
                  // if we click on our own piece, we will always be trying to prime it
                  console.log('clicked on our own piece!')
                  setPrimedPiece({
                    piece: {
                      type: board[i][j]?.type ?? 'P',
                      color: board[i][j]?.color as ChessColor,
                    },
                    col: j as ChessBoardPosition,
                    row: i as ChessBoardPosition,
                  });
                  setPrimed(true); 
                  return;                 
                }

                if (primed && primedPiece) {
                  // now, we know we are primed and we didn't click on our own piece.
                  try {
                    await makeMove(i as ChessBoardPosition, j as ChessBoardPosition);
                  } catch (e) {
                    console.log(e);
                    toast({
                      title: 'Error making move',
                      description: (e as Error).toString(),
                      status: 'error',
                    });
                  }
                }
                console.log(`Primed Piece: ${primedPiece?.piece.type}`)
                console.log('Primed Status: ', primed);
              }}
            >
              {board[i][j] ? board[i][j]?.type : '' ?? ''}
            </StyledChessSquare>
          );
        
        // Clicked on an empty square
        } else {
          renderBoard.push(
            <StyledChessSquare
              key={`${i}.${j}`}
              disabled={!isOurTurn}
              padding={0}
              borderRadius={0}
              height={70}
              width={70}
              background={squareColor}

              onClick={async () => {
                console.log(`Button ${i},${j} was clicked!`);
                console.log('clicked on an empty square');
                
                if (primed && primedPiece) {
                  try {
                    await makeMove(i as ChessBoardPosition, j as ChessBoardPosition);
                  } catch (e) {
                    console.log(e);
                    toast({
                      title: 'Error making move',
                      description: (e as Error).toString(),
                      status: 'error',
                    });
                  }
                }
                console.log(`Primed Piece: ${primedPiece?.piece.type}`)
                console.log('Primed Status: ', primed);
              }}
            ></StyledChessSquare>);
        }
      }
    }

    return <StyledChessBoard
      columns={[8, null, 8]}
      spacing={0}
      spacingX='0px'
      spacingY='0px'
    >
      {renderBoard}
    </StyledChessBoard>;
  }
  return (RenderWhitePlayerPOV());
}
