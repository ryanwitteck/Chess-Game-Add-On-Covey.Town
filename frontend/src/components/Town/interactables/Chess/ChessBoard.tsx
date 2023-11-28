import { chakra, SimpleGrid, Image, IconButton, useToast } from '@chakra-ui/react';
// import { chakra, SimpleGrid, Image, Button, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import {
  ChessBoardPosition,
  ChessBoardSquare,
  ChessColor,
  ChessMove,
  ChessPiecePosition,
} from '../../../../../../shared/types/CoveyTownSocket';
import ChessAreaController from '../../../../classes/interactable/ChessAreaController';
import useTownController from '../../../../hooks/useTownController';
import pieceImages from './pieceimages/index.js'
import wp from './pieceimages/wp.png'

export type ChessGameProps = {
  gameAreaController: ChessAreaController;
};

/**
 * Returns the corresponding piece image given a ChessBoardSquare.
 * If the ChessBoardSquare has no piece on it, then it returns null.
 */
function pieceToImage(piece: ChessBoardSquare): JSX.Element | null {
  if (!piece) {
    return null;
  }
  if (piece.color === 'W') {
    switch (piece.type) {
      case 'P':
        return <Image src= {wp} aria-label='wp' alt='pawn' color={'skyblue'}/>;
      case 'R':
        return <Image src={pieceImages.wr} aria-label='wr' alt='rook' color={'skyblue'} />;
      case 'B':
        return <Image src={pieceImages.wb} aria-label='wb' alt='bishop' color={'skyblue'} />;
      case 'N':
        return <Image src={pieceImages.wn} aria-label='wn' alt='knight' color={'skyblue'} />;
      case 'Q':
        return <Image src={pieceImages.wq} aria-label='wq' alt='queen' color={'skyblue'} />;
      case 'K':
        return <Image src={pieceImages.wk} aria-label='wk' alt='king' color={'skyblue'} />;
      default:
        throw Error('error converting chessboardsquare to image');
    }
  } else {
    switch (piece.type) {
      case 'P':
        return <Image src={pieceImages.bp} aria-label='bp' alt='pawn' color={'navy'} />;
      case 'R':
        return <Image src={pieceImages.br} aria-label='br' alt='rook' color={'navy'} />;
      case 'B':
        return <Image src={pieceImages.bb} aria-label='bb' alt='bishop' color={'navy'} />;
      case 'N':
        return <Image src={pieceImages.bn} aria-label='bn' alt='knight' color={'navy'} />;
      case 'Q':
        return <Image src={pieceImages.bq} aria-label='bq' alt='queen' color={'navy'}/>;
      case 'K':
        return <Image src={pieceImages.bk} aria-label='bk' alt='king' color={'navy'}/>;
      default:
        throw Error('error converting chessboardsquare to image');
    }
  }
}

/**
 * A component that will render a single cell on a Chess board, styled.
 */
const StyledChessSquare = chakra(IconButton, {
  justifyContent: 'center',
  padding: '0',
  flexBasis: '12.5%',
  alignItems: 'center',
  fontSize: '150px',
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
 * React Component to render the chessboard of the current Chess Game.
 *
 * @param gameAreaController the controller for the Chess game
 */
export default function ChessBoard({ gameAreaController }: ChessGameProps): JSX.Element {
  const townController = useTownController();

  const gameState = gameAreaController.status;
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

  function RenderBlackPlayerPOV(): JSX.Element {
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
    };

    for (let i = 0; i <= 7; i++) {
      for (let j = 0; j <= 7; j++) {
        const isLightSquare = (i % 2 === 0 && j % 2 === 0) || (i % 2 !== 0 && j % 2 !== 0);
        const squareColor = isLightSquare ? 'WhiteSmoke' : 'DimGrey';
        const chessSquareImage = pieceToImage(board[i][j]);

        // This is NOT an empty square
        if (board[i] && board[i][j]) {
          renderBoard.push(
            <StyledChessSquare
              key={`${i}.${j}`}
              disabled={!isOurTurn}
              background={squareColor}
              height={70}
              borderRadius={0}
              icon={chessSquareImage}
              onClick={async () => {
                if (board[i][j]?.color === gameAreaController.gameColor) {
                  // if we click on our own piece, we will always be trying to prime it
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
                    toast({
                      title: 'Error making move',
                      description: (e as Error).toString(),
                      status: 'error',
                    });
                  }
                }
              }}>
              {board[i][j] ? board[i][j]?.type : '' ?? ''}
            </StyledChessSquare>,
          );

          // This is an empty square
        } else {
          renderBoard.push(
            <StyledChessSquare
              key={`${i}.${j}`}
              disabled={!isOurTurn}
              background={squareColor}
              height={70}
              borderRadius={0}
              onClick={async () => {
                if (primed && primedPiece) {
                  try {
                    await makeMove(i as ChessBoardPosition, j as ChessBoardPosition);
                  } catch (e) {
                    toast({
                      title: 'Error making move',
                      description: (e as Error).toString(),
                      status: 'error',
                    });
                  }
                }
              }}></StyledChessSquare>,
          );
        }
      }
    }

    return (
      <StyledChessBoard columns={[8, null, 8]} spacing={0} spacingX='0px' spacingY='0px'>
        {renderBoard}
      </StyledChessBoard>
    );
  }

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
    };

    for (let i = 7; i >= 0; i--) {
      for (let j = 7; j >=0; j--) {
        const isLightSquare = (i % 2 === 0 && j % 2 === 0) || (i % 2 !== 0 && j % 2 !== 0);
        const squareColor = isLightSquare ? 'WhiteSmoke' : 'DimGrey';
        const chessSquareImage = pieceToImage(board[i][j]);

        // This is NOT an empty square
        if (board[i] && board[i][j]) {
          renderBoard.push(
            <StyledChessSquare
              key={`${i}.${j}`}
              disabled={!isOurTurn}
              background={squareColor}
              height={70}
              borderRadius={0}
              icon={chessSquareImage}
              onClick={async () => {
                if (board[i][j]?.color === gameAreaController.gameColor) {
                  // if we click on our own piece, we will always be trying to prime it
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
                    toast({
                      title: 'Error making move',
                      description: (e as Error).toString(),
                      status: 'error',
                    });
                  }
                }
              }}>
              {board[i][j] ? board[i][j]?.type : '' ?? ''}
            </StyledChessSquare>,
          );

          // This is an empty square
        } else {
          renderBoard.push(
            <StyledChessSquare
              key={`${i}.${j}`}
              disabled={!isOurTurn}
              background={squareColor}
              height={70}
              borderRadius={0}
              onClick={async () => {
                if (primed && primedPiece) {
                  try {
                    await makeMove(i as ChessBoardPosition, j as ChessBoardPosition);
                  } catch (e) {
                    toast({
                      title: 'Error making move',
                      description: (e as Error).toString(),
                      status: 'error',
                    });
                  }
                }
              }}></StyledChessSquare>,
          );
        }
      }
    }

    return (
      <StyledChessBoard columns={[8, null, 8]} spacing={0} spacingX='0px' spacingY='0px'>
        {renderBoard}
      </StyledChessBoard>
    );
  }
  if (gameAreaController.black === townController.ourPlayer) {
    return RenderBlackPlayerPOV();
  } else {
    return RenderWhitePlayerPOV();
  }
}
