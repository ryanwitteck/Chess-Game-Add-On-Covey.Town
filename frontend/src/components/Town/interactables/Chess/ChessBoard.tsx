import { Button, chakra, Container, Grid, SimpleGrid, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { ChessBoardSquare, ChessPiece } from '../../../../../../shared/types/CoveyTownSocket';
import ChessAreaController from '../../../../classes/interactable/ChessAreaController';
import useTownController from '../../../../hooks/useTownController';

export type ChessGameProps = {
  gameAreaController: ChessAreaController;
};

const CHESS_SQUARE_SIZE = 100;

/**
 * A component that will render a single cell on a Chess board, styled.
 */
const StyledChessSquare = chakra(Button, {
  justifyContent: 'center',
  padding: '0px',
  flexBasis: '12.5%',
  alignItems: 'center',
  fontSize: '80px',
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
  }, [gameAreaController]);

  function RenderWhitePlayerPOV(): JSX.Element {
    const renderBoard: JSX.Element[] = [];

    for (let i = 7; i >= 0; i--) {
      for (let j = 7; j >= 0; j--) {
        const isDarkSquare = (i % 2 === 0 && j % 2 === 0) || (i % 2 !== 0 && j % 2 !== 0);
        const squareColor = isDarkSquare ? 'DimGrey' : 'WhiteSmoke';

        renderBoard.push(
          <StyledChessSquare
            key={`${i}.${j}`}
            padding={0}
            borderRadius={0}
            height={70}
            width={70}
            background={squareColor}
          // Add other props or onClick handlers as needed
          >
            {'T'}
          </StyledChessSquare>
        );
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

/* Saved code!
            <StyledChessSquareDark
              key={`${i}.${j}`}
              // on-click: move logic
              disabled={!isOurTurn}
              aria-label={`Cell ${i},${j}`}
              color={board[i][j]?.color === 'W' ? 'white' : 'black' ?? undefined}
            >
              {(board[i][j]) ? board[i][j]?.type : ''}
            </StyledChessSquareDark>





function RenderWhitePlayerPOV(): JSX.Element {
  const renderBoard: JSX.Element[][] = [];

  for (let i = 7; i >= 0; i--) {
    for (let j = 7; j >= 0; j--) {
      if ((i % 2 === 0 && j % 2 === 0) || (i % 2 != 0 && j % 2 != 0)) {
        renderBoard[i][j] = (
          <StyledChessSquareDark
            key={`${i}.${j}`}
            // on-click: move logic
            disabled={!isOurTurn}
            aria-label={`Cell ${i},${j}`}>
            { (! board[i][j]) ? '' : board[i][j]?.type }
          </StyledChessSquareDark>
        );
      } else {
        renderBoard[i][j] = (
          <StyledChessSquareLight
          key={`${i}.${j}`}
          // on-click: move logic
          disabled={!isOurTurn}
          aria-label={`Cell ${i},${j}`}>
          { (! board[i][j]) ? '' : board[i][j]?.type }
          </StyledChessSquareLight>
        );
      }
    }
  }
  return <StyledChessBoard aria-label='Chessboard'>{renderBoard}</StyledChessBoard>;
}

// we need to add a check to determine how to render the board, depending on the player color.
return (
  <RenderWhitePlayerPOV></RenderWhitePlayerPOV>
);
*/

// Old Code
// renders the board from the Black player's POV.
// function renderBlackPlayerPOV(): JSX.Element {
//   const renderBoard: JSX.Element[][] = [];

//   for (let i = 7; i >= 0; i--) {
//     for (let j = 7; j >= 0; j--) {
//       if ((i % 2 === 0 && j % 2 === 0) || (i % 2 != 0 && j % 2 != 0)) {
//         renderBoard[i][j] = (
//           <StyledChessSquareDark
//             key={`${i}.${j}`}
//             onClick={async () => {
//               try {
//                 // TODO: makeMove logic
//                 // we need to store a "picked up" variable, or something
//                 // to keep track of when the user is about to move a piece.
//                 //
//                 // a boolean flag should be good enough; if it's our turn, and the
//                 // user has clicked a piece, then we assume that's the piece they
//                 // want to move. the next click on a square then is made as a move.
//                 // if the move is not legal, reject it, and wait until the player makes
//                 // a legal move.
//                 await gameAreaController.makeMove({
//                   gamePiece: undefined,
//                   newRow: 0,
//                   newCol: 0,
//                 });
//               } catch (e) {
//                 toast({
//                   title: 'Error making move',
//                   description: (e as Error).toString(),
//                   status: 'error',
//                 });
//               }
//             }}
//             disabled={!isOurTurn}
//             aria-label={`Cell ${i},${j}`}>
//             {/* Here, we draw the piece depending on if there's a gamepiece inside*/}
//           </StyledChessSquareDark>
//         );
//       } else {
//         renderBoard[i][j] = (
//           <StyledChessSquareLight
//             key={`${i}.${j}`}
//             onClick={async () => {
//               try {
//                 // TODO: makeMove logic
//                 // we need to store a "picked up" variable, or something
//                 // to keep track of when the user is about to move a piece.
//                 //
//                 // a boolean flag should be good enough; if it's our turn, and the
//                 // user has clicked a piece, then we assume that's the piece they
//                 // want to move. the next click on a square then is made as a move.
//                 // if the move is not legal, reject it, and wait until the player makes
//                 // a legal move.
//                 await gameAreaController.makeMove({
//                   gamePiece: undefined,
//                   newRow: 0,
//                   newCol: 0,
//                 });
//               } catch (e) {
//                 toast({
//                   title: 'Error making move',
//                   description: (e as Error).toString(),
//                   status: 'error',
//                 });
//               }
//             }}
//             disabled={!isOurTurn}
//             aria-label={`Cell ${i},${j}`}>
//             {/* Here, we draw the piece depending on if there's a gamepiece inside*/}
//           </StyledChessSquareLight>
//         );
//       }
//     }
//   }

//   return <StyledChessBoard aria-label='Chessboard'>{renderBoard}</StyledChessBoard>;
// }

  // // TODO: these functions are massive! we need to clean it up.
  // // Displays the board from the White player's POV.
  // function renderWhitePlayerPOV(): JSX.Element {
  //   const renderBoard: JSX.Element[][] = [];
  //   for (let i = 0; i < board.length; i++) {
  //     for (let j = 0; j < board[0].length; j++) {
  //       if ((i % 2 === 0 && j % 2 === 0) || (i % 2 != 0 && j % 2 != 0)) {
  //         renderBoard[i][j] = (
  //           <StyledChessSquareDark
  //             key={`${i}.${j}`}
  //             onClick={async () => {
  //               try {
  //                 // TODO: makeMove logic
  //                 // we need to store a "picked up" variable, or something
  //                 // to keep track of when the user is about to move a piece.

  //                 // a boolean flag should be good enough; if it's our turn, and the
  //                 // user has clicked a piece, then we assume that's the piece they
  //                 // want to move. the next click on a square then is made as a move.
  //                 // if the move is not legal, reject it, and wait until the player makes
  //                 // a legal move.
  //                 await gameAreaController.makeMove({
  //                   gamePiece: undefined,
  //                   newRow: 0,
  //                   newCol: 0,
  //                 });
  //               } catch (e) {
  //                 toast({
  //                   title: 'Error making move',
  //                   description: (e as Error).toString(),
  //                   status: 'error',
  //                 });
  //               }
  //             }}
  //             disabled={!isOurTurn}
  //             aria-label={`Cell ${i},${j}`}>
  //             {/* Here, we draw the piece depending on if there's a gamepiece inside*/}
  //           </StyledChessSquareDark>
  //         );
  //       } else {
  //         renderBoard[i][j] = (
  //           <StyledChessSquareLight
  //             key={`${i}.${j}`}
  //             onClick={async () => {
  //               try {
  //                 // TODO: makeMove logic
  //                 // we need to store a "picked up" variable, or something
  //                 // to keep track of when the user is about to move a piece.

  //                 // a boolean flag should be good enough; if it's our turn, and the
  //                 // user has clicked a piece, then we assume that's the piece they
  //                 // want to move. the next click on a square then is made as a move.
  //                 // if the move is not legal, reject it, and wait until the player makes
  //                 // a legal move.
  //                 await gameAreaController.makeMove({
  //                   gamePiece: undefined,
  //                   newRow: 0,
  //                   newCol: 0,
  //                 });
  //               } catch (e) {
  //                 toast({
  //                   title: 'Error making move',
  //                   description: (e as Error).toString(),
  //                   status: 'error',
  //                 });
  //               }
  //             }}
  //             disabled={!isOurTurn}
  //             aria-label={`Cell ${i},${j}`}>
  //             {/* Here, we draw the piece depending on if there's a gamepiece inside*/}
  //           </StyledChessSquareLight>
  //         );
  //       }
  //     }
  //   }

  //   return <StyledChessBoard aria-label='Chessboard'>{renderBoard}</StyledChessBoard>;
  // }
