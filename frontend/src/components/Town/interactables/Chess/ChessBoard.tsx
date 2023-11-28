import { chakra, SimpleGrid, Image, IconButton, useToast, HStack, VStack } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import {
  ChessBoardPosition,
  ChessBoardSquare,
  ChessColor,
  ChessMove,
  ChessPiece,
  ChessPiecePosition,
} from '../../../../../../shared/types/CoveyTownSocket';
import ChessAreaController from '../../../../classes/interactable/ChessAreaController';
import useTownController from '../../../../hooks/useTownController';

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
        return <Image
          src="https://drive.google.com/uc?export=download&id=11wAxmXy9nkPIhDXXN3z936dwhIp_EUYE"
          aria-label='wp'
          alt='pawn'
          color={'skyblue'}
        />;
      case 'R':
        return <Image
          src="https://drive.google.com/uc?export=download&id=1q-naBJasxOQlhYvMIm2LPAIoSRUw7tNv"
          aria-label='wr'
          alt='rook'
          color={'skyblue'}
        />;
      case 'B':
        return <Image
          src="https://drive.google.com/uc?export=download&id=1HjcXsR-7IWl40GTNW-WkwedHkEYQ57s8"
          aria-label='wb'
          alt='bishop'
          color={'skyblue'}
        />;
      case 'N':
        return <Image
          src="https://drive.google.com/uc?export=download&id=1gP8_lGCtIJBgP0NqYTg3eYSQuaQVi-cL"
          aria-label='wn'
          alt='knight'
          color={'skyblue'}
        />;
      case 'Q':
        return <Image
          src="https://drive.google.com/uc?export=download&id=1-xoxUMUfg1E8sHXvh8k-WXi5Rq1GNnYn"
          aria-label='wq'
          alt='queen'
          color={'skyblue'}
        />;
      case 'K':
        return <Image
          src="https://drive.google.com/uc?export=download&id=1c1wAv965tW-46v_QAkRJJX3w_teSoAHR"
          aria-label='wk'
          alt='king'
          color={'skyblue'}
        />;
      default:
        throw Error('error converting chessboardsquare to image');
    }
  } else {
    switch (piece.type) {
      case 'P':
        return <Image
          src="https://drive.google.com/uc?export=download&id=1IM-V6_xCpF6g1r1H-AlQXX1BpijGi0-E"
          aria-label='bp'
          alt='pawn'
          color={'navy'}
        />;
      case 'R':
        return <Image
          src="https://drive.google.com/uc?export=download&id=13OjSarthIm69Mx6nXtbLhiv9_3Sz2D-i"
          aria-label='br'
          alt='rook'
          color={'navy'}
        />;
      case 'B':
        return <Image
          src="https://drive.google.com/uc?export=download&id=1RC4HDuRfOIR7gGtVEZALrN5sxhbJWhl8"
          aria-label='bb'
          alt='bishop'
          color={'navy'}
        />;
      case 'N':
        return <Image
          src="https://drive.google.com/uc?export=download&id=1kUG7UzXrQm-lpPcd1mJw9LtlyeTfmeNp"
          aria-label='bn'
          alt='knight'
          color={'navy'}
        />;
      case 'Q':
        return <Image
          src="https://drive.google.com/uc?export=download&id=1BJvoF5b_LLLezTGuIFC-bpGo559DISEt"
          aria-label='bq'
          alt='queen'
          color={'navy'}
        />;
      case 'K':
        return <Image
          src="https://drive.google.com/uc?export=download&id=1mDzRr9Dv5oaUeKB89QQTkx9EVhVUgZ16"
          aria-label='bk'
          alt='king'
          color={'navy'}
        />;
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
  const [board, setBoard] = useState<ChessBoardSquare[][]>(gameAreaController.board);
  const [isOurTurn, setIsOurTurn] = useState(gameAreaController.isOurTurn);

  const [promoteRow, setPromoteRow] = useState(-1);
  const [promoteCol, setPromoteCol] = useState(-1);

  const [canPromote, setCanPromote] = useState(false);
  const [primed, setPrimed] = useState(false);
  const [primedPiece, setPrimedPiece] = useState<ChessPiecePosition | undefined>(undefined);

  const toast = useToast();

  useEffect(() => {
    gameAreaController.addListener('turnChanged', setIsOurTurn);
    gameAreaController.addListener('boardChanged', setBoard);
    return () => {
      gameAreaController.removeListener('boardChanged', setBoard);
      gameAreaController.removeListener('turnChanged', setIsOurTurn);
    };
  }, [gameAreaController, townController, board, isOurTurn]);

  // Function that takes in a ChessType, and then sends a promote command
  async function PromotePiece(toRow: ChessBoardPosition, toCol: ChessBoardPosition, type: 'B' | 'R' | 'N' | 'Q') {
    setCanPromote(false);
    await gameAreaController.makeMove({
      gamePiece: primedPiece as ChessPiecePosition,
      toRow: toRow,
      toCol: toCol,
      promotion: type as 'B' | 'R' | 'N' | 'Q',
    });
    setPrimed(false);
    setPrimedPiece(undefined);
  }


  // Function that renders the black player's POV
  function RenderBlackPlayerPOV(): JSX.Element {
    const renderBoard: JSX.Element[] = [];

    for (let i = 0; i <= 7; i++) {
      for (let j = 0; j <= 7; j++) {
        const isLightSquare = (i % 2 === 0 && j % 2 === 0) || (i % 2 !== 0 && j % 2 !== 0);
        const squareColor = isLightSquare ? 'WhiteSmoke' : 'DimGrey';
        const chessSquareImage = pieceToImage(board[i][j]);

        const makeMove = async (toRow: ChessBoardPosition, toCol: ChessBoardPosition) => {
          try {
            await gameAreaController.makeMove({
              gamePiece: primedPiece as ChessPiecePosition,
              toRow: toRow,
              toCol: toCol,
            } as ChessMove);
            setPrimed(false);
            setPrimedPiece(undefined);
          } catch (e) {
            toast({
              title: 'Error making move',
              description: (e as Error).toString(),
              status: 'error',
            });
          }
        };

        // This is NOT an empty square
        if (board[i] && board[i][j]) {
          renderBoard.push(
            <StyledChessSquare
              key={`${i}.${j}`}
              disabled={!isOurTurn && !canPromote}
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

                  // if we primed a pawn and it reached the back rank
                  // if we want to promote, we DON'T make a move right away. Instead, just set the
                  // canPromote state to true, and then force the user to select a promotion type
                  // we also need to check the "legality" of the move lol
                  if (primedPiece?.piece.type === 'P' &&
                    primedPiece.col === j &&
                    (primedPiece.row === 1 || primedPiece.row === 6) &&
                    (i === 7 || i === 0)) {
                    console.log('we can promote!');
                    setCanPromote(true);
                    setPromoteRow(i);
                    setPromoteCol(j);
                    return;
                  }
                  makeMove(i as ChessBoardPosition, j as ChessBoardPosition);
                }
              }}>
            </StyledChessSquare>,
          );

          // This is an empty square
        } else {
          renderBoard.push(
            <StyledChessSquare
              key={`${i}.${j}`}
              disabled={!isOurTurn && !canPromote}
              background={squareColor}
              height={70}
              borderRadius={0}
              onClick={async () => {
                if (primed && primedPiece) {
                  makeMove(i as ChessBoardPosition, j as ChessBoardPosition);
                }
              }}>
            </StyledChessSquare>,
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

  // Function that renders the white player's POV.
  function RenderWhitePlayerPOV(): JSX.Element {
    const renderBoard: JSX.Element[] = [];

    for (let i = 7; i >= 0; i--) {
      for (let j = 7; j >= 0; j--) {
        const isLightSquare = (i % 2 === 0 && j % 2 === 0) || (i % 2 !== 0 && j % 2 !== 0);
        const squareColor = isLightSquare ? 'WhiteSmoke' : 'DimGrey';
        const chessSquareImage = pieceToImage(board[i][j]);

        const makeMove = async (toRow: ChessBoardPosition, toCol: ChessBoardPosition) => {
          try {
            await gameAreaController.makeMove({
              gamePiece: primedPiece as ChessPiecePosition,
              toRow: toRow,
              toCol: toCol,
            } as ChessMove);
            setPrimed(false);
            setPrimedPiece(undefined);
          } catch (e) {
            toast({
              title: 'Error making move',
              description: (e as Error).toString(),
              status: 'error',
            });
          }
        };

        // This is NOT an empty square
        if (board[i] && board[i][j]) {
          renderBoard.push(
            <StyledChessSquare
              key={`${i}.${j}`}
              disabled={!isOurTurn && !canPromote}
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

                  // if we primed a pawn and it reached the back rank
                  // if we want to promote, we DON'T make a move right away. Instead, just set the
                  // canPromote state to true, and then force the user to select a promotion type
                  // we also need to check the "legality" of the move lol
                  if (primedPiece?.piece.type === 'P' &&
                    primedPiece.col === j &&
                    (primedPiece.row === 1 || primedPiece.row === 6) &&
                    (i === 7 || i === 0)) {
                    console.log('we can promote!');
                    setCanPromote(true);
                    setPromoteRow(i);
                    setPromoteCol(j);
                    return;
                  }
                  makeMove(i as ChessBoardPosition, j as ChessBoardPosition);
                }
              }}>
            </StyledChessSquare>,
          );
          // This is an empty square
        } else {
          renderBoard.push(
            <StyledChessSquare
              key={`${i}.${j}`}
              disabled={!isOurTurn && !canPromote}
              background={squareColor}
              height={70}
              borderRadius={0}
              onClick={async () => {
                if (primed && primedPiece) {
                  makeMove(i as ChessBoardPosition, j as ChessBoardPosition);
                }
              }}>
            </StyledChessSquare>,
          );
        }
      }
    }

    return (
      <VStack display={'flex'}>
        {canPromote ?
          <HStack>
            <IconButton
              aria-label='promote-queen'
              icon={<Image
                src={gameAreaController.white === townController.ourPlayer ?
                  "https://drive.google.com/uc?export=download&id=1-xoxUMUfg1E8sHXvh8k-WXi5Rq1GNnYn" :
                  "https://drive.google.com/uc?export=download&id=1BJvoF5b_LLLezTGuIFC-bpGo559DISEt"}
                aria-label='promote-q'
                height={'75%'}
                alt='promote to queen'></Image>}
              onClick={async () => {
                PromotePiece(promoteRow as ChessBoardPosition, promoteCol as ChessBoardPosition, 'Q');
              }}
            ></IconButton>
            <IconButton
              aria-label='promote-knight'
              icon={<Image
                src={gameAreaController.white === townController.ourPlayer ?
                  "https://drive.google.com/uc?export=download&id=1gP8_lGCtIJBgP0NqYTg3eYSQuaQVi-cL" :
                  "https://drive.google.com/uc?export=download&id=1kUG7UzXrQm-lpPcd1mJw9LtlyeTfmeNp"}
                aria-label='promote-n'
                height={'75%'}
                alt='promote to knight'></Image>}
              onClick={async () => {
                PromotePiece(promoteRow as ChessBoardPosition, promoteCol as ChessBoardPosition, 'N');
              }}></IconButton>
            <IconButton
              aria-label='promote-bishop'
              icon={<Image
                src={gameAreaController.white === townController.ourPlayer ?
                  "https://drive.google.com/uc?export=download&id=1HjcXsR-7IWl40GTNW-WkwedHkEYQ57s8" :
                  "https://drive.google.com/uc?export=download&id=1RC4HDuRfOIR7gGtVEZALrN5sxhbJWhl8"}
                aria-label='promote-b'
                height={'75%'}
                alt='promote to bishop'></Image>}
              onClick={async () => {
                PromotePiece(promoteRow as ChessBoardPosition, promoteCol as ChessBoardPosition, 'B');
              }}></IconButton>
            <IconButton
              aria-label='promote-rook'
              icon={<Image
                src={gameAreaController.white === townController.ourPlayer ?
                  "https://drive.google.com/uc?export=download&id=1q-naBJasxOQlhYvMIm2LPAIoSRUw7tNv" :
                  "https://drive.google.com/uc?export=download&id=13OjSarthIm69Mx6nXtbLhiv9_3Sz2D-i"}
                aria-label='promote-r'
                height={'75%'}
                alt='promote to rook'></Image>}
              onClick={async () => {
                PromotePiece(promoteRow as ChessBoardPosition, promoteCol as ChessBoardPosition, 'R');
              }}></IconButton>
          </HStack> : <></>}
        <StyledChessBoard columns={[8, null, 8]} spacing={0} spacingX='0px' spacingY='0px'>
          {renderBoard}
        </StyledChessBoard>
      </VStack>

    );
  }

  // black player currently has no promotion logic!
  if (gameAreaController.black === townController.ourPlayer) {
    return RenderBlackPlayerPOV();
  } else {
    return RenderWhitePlayerPOV();
  }
}
