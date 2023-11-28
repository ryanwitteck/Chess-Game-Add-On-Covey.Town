/* eslint-disable @typescript-eslint/naming-convention */
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Container,
  Heading,
  List,
  ListItem,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import ChessAreaController from '../../../../classes/interactable/ChessAreaController';
import PlayerController from '../../../../classes/PlayerController';
import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { GameResult, GameStatus, InteractableID } from '../../../../types/CoveyTownSocket';
import GameAreaInteractable from '../GameArea';
import TicTacToeLeaderboard from '../Leaderboard';
import ChessBoard from './ChessBoard';

function formatTime(time: number): string {
  const minutes = Math.floor(time / (60 * 1000));
  const seconds = Math.floor((time % (60 * 1000)) / 1000);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

let wflag = false; // Flags for inital setting the value
let bflag = false;
/**
 * Chess Area Component.
 */
function ChessArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const gameAreaController = useInteractableAreaController<ChessAreaController>(interactableID);
  const townController = useTownController();

  const [history, setHistory] = useState<GameResult[]>(gameAreaController.history);
  const [gameStatus, setGameStatus] = useState<GameStatus>(gameAreaController.status);
  const [moveCount, setMoveCount] = useState<number>(gameAreaController.moveCount);
  const [observers, setObservers] = useState<PlayerController[]>(gameAreaController.observers);
  const [joiningGame, setJoiningGame] = useState(false);
  const [white, setWhite] = useState<PlayerController | undefined>(gameAreaController.white);
  const [black, setBlack] = useState<PlayerController | undefined>(gameAreaController.black);
  const [drawProposed, setDrawProposed] = useState(false);
  const [drawString, setDrawString] = useState('Draw?');
  const [blackTimer, setBlackTimer] = useState(0);
  const [whiteTimer, setWhiteTimer] = useState(0);
  const blackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const whiteTimerRef = useRef<NodeJS.Timeout | null>(null);

  const toast = useToast();

  useEffect(() => {
    const updateGameState = () => {
      setHistory(gameAreaController.history);
      setGameStatus(gameAreaController.status || 'WAITING_TO_START');
      setMoveCount(gameAreaController.moveCount || 0);
      setObservers(gameAreaController.observers);
      setWhite(gameAreaController.white);
      setBlack(gameAreaController.black);
      setDrawProposed(gameAreaController.drawState);

      if (drawProposed) {
        setDrawString('Draw Proposed');
      } else if (!drawProposed && gameAreaController.drawState) {
        setDrawString('Accept Draw?');
      }
      if (gameStatus === 'IN_PROGRESS' && gameAreaController.whoseTurn === black) {
        if (!bflag) {
          setBlackTimer(10 * 60 * gameAreaController.timer);
          bflag = true;
        }
        blackTimerRef.current = setInterval(() => {
          setBlackTimer(prevTime => {
            const newTime = Math.max(0, prevTime - 1000); // Decrease by 1 second
            if (newTime === 0) {
              if (townController.ourPlayer === black) {
                bflag = false;
                wflag = false;
                gameAreaController.leaveGame();
              }
            }
            return newTime;
          });
        }, 1000);
      } else {
        clearInterval(blackTimerRef.current as NodeJS.Timeout);
      }

      // Start white player's timer
      if (gameStatus === 'IN_PROGRESS' && gameAreaController.whoseTurn === white) {
        if (!wflag) {
          setWhiteTimer(10 * 60 * gameAreaController.timer);
          wflag = true;
        }
        whiteTimerRef.current = setInterval(() => {
          setWhiteTimer(prevTime => {
            const newTime = Math.max(0, prevTime - 1000); // Decrease by 1 second
            if (newTime === 0) {
              if (townController.ourPlayer === white) {
                bflag = false;
                wflag = false;
                gameAreaController.leaveGame();
              }
            }
            return newTime;
          });
        }, 1000);
      } else {
        clearInterval(whiteTimerRef.current as NodeJS.Timeout);
      }
    };
    gameAreaController.addListener('gameUpdated', updateGameState);
    const onGameEnd = () => {
      const winner = gameAreaController.winner;
      if (!winner) {
        toast({
          title: 'Game over',
          description: 'Game ended in a tie',
          status: 'info',
        });
      } else if (winner === townController.ourPlayer) {
        toast({
          title: 'Game over',
          description: 'You won!',
          status: 'success',
        });
      } else {
        toast({
          title: 'Game over',
          description: `You lost :(`,
          status: 'error',
        });
      }
      bflag = false;
      wflag = false;
      setWhiteTimer(gameAreaController.timer);
      setBlackTimer(gameAreaController.timer);
    };

    gameAreaController.addListener('gameEnd', onGameEnd);
    return () => {
      gameAreaController.removeListener('gameEnd', onGameEnd);
      gameAreaController.removeListener('gameUpdated', updateGameState);
      if (blackTimerRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        clearInterval(blackTimerRef.current);
      }
      if (whiteTimerRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        clearInterval(whiteTimerRef.current);
      }
    };
  }, [townController, gameAreaController, toast, drawProposed, gameStatus, black, white]);

  let gameStatusText = <></>;
  if (gameStatus === 'IN_PROGRESS') {
    gameStatusText = (
      <>
        Game in progress, {moveCount} moves in, currently{' '}
        {gameAreaController.whoseTurn === townController.ourPlayer
          ? 'your'
          : gameAreaController.whoseTurn?.userName + "'s"}{' '}
        turn
      </>
    );
  } else {
    let joinGameButton = <></>;
    let joinFastGameButton = <></>;
    let joinLightningGameButton = <></>;
    if (
      (gameAreaController.status === 'WAITING_TO_START' && !gameAreaController.isPlayer) ||
      gameAreaController.status === 'OVER'
    ) {
      joinGameButton = (
        <Button
          onClick={async () => {
            gameAreaController.timer = 1000;
            setJoiningGame(true);
            try {
              await gameAreaController.joinGame();
            } catch (err) {
              toast({
                title: 'Error joining game',
                description: (err as Error).toString(),
                status: 'error',
              });
            }
            setJoiningGame(false);
          }}
          isLoading={joiningGame}
          disabled={joiningGame}>
          Join New Game
        </Button>
      );
      joinFastGameButton = (
        <Button
          onClick={async () => {
            gameAreaController.timer = 500;
            setJoiningGame(true);
            try {
              await gameAreaController.joinGame();
            } catch (err) {
              toast({
                title: 'Error joining game',
                description: (err as Error).toString(),
                status: 'error',
              });
            }
            setJoiningGame(false);
          }}
          isLoading={joiningGame}
          disabled={joiningGame}>
          Join Fast Game
        </Button>
      );
      joinLightningGameButton = (
        <Button
          onClick={async () => {
            gameAreaController.timer = 100;
            setJoiningGame(true);
            try {
              await gameAreaController.joinGame();
            } catch (err) {
              toast({
                title: 'Error joining game',
                description: (err as Error).toString(),
                status: 'error',
              });
            }
            setJoiningGame(false);
          }}
          isLoading={joiningGame}
          disabled={joiningGame}>
          Join Lightning Game
        </Button>
      );
    }
    if (gameAreaController.players.length === 1) {
      if (gameAreaController.timer === 1000) {
        gameStatusText = (
          <b>
            Game {gameStatus === 'WAITING_TO_START' ? 'not yet started' : 'over'}. {joinGameButton}
          </b>
        );
      } else if (gameAreaController.timer === 500) {
        gameStatusText = (
          <b>
            Game {gameStatus === 'WAITING_TO_START' ? 'not yet started' : 'over'}.{' '}
            {joinFastGameButton}
          </b>
        );
      } else if (gameAreaController.timer === 100) {
        gameStatusText = (
          <b>
            Game {gameStatus === 'WAITING_TO_START' ? 'not yet started' : 'over'}.{' '}
            {joinLightningGameButton}
          </b>
        );
      } else {
        // ALWAYS GETS TO THIS CASE
        gameStatusText = (
          <b>
            Game {gameStatus === 'WAITING_TO_START' ? 'not yet started' : 'over'}. {joinGameButton}
            {'ioioi '}
            {joinFastGameButton} {joinLightningGameButton}
          </b>
        );
      }
    } else {
      gameStatusText = (
        <b>
          Game {gameStatus === 'WAITING_TO_START' ? 'not yet started' : 'over'}. {joinGameButton}
          {joinFastGameButton} {joinLightningGameButton}
        </b>
      );
    }
  }

  return (
    <Container maxW={'592px'} alignContent='center'>
      <Accordion allowToggle>
        <AccordionItem>
          <Heading as='h3'>
            <AccordionButton>
              <Box as='span' flex='1' textAlign='left'>
                Leaderboard
                <AccordionIcon />
              </Box>
            </AccordionButton>
          </Heading>
          <AccordionPanel>
            <TicTacToeLeaderboard results={history} />
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <Heading as='h3'>
            <AccordionButton>
              <Box as='span' flex='1' textAlign='left'>
                Current Observers
                <AccordionIcon />
              </Box>
            </AccordionButton>
          </Heading>
          <AccordionPanel>
            <List aria-label='list of observers in the game'>
              {observers.map(player => {
                return <ListItem key={player.id}>{player.userName}</ListItem>;
              })}
            </List>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      {gameStatusText}
      <List aria-label='list of players in the game'>
        <ListItem>
          White: {white?.userName || '(No player yet!)'} - White Timer: {formatTime(whiteTimer)}
        </ListItem>
        <ListItem>
          Black: {black?.userName || '(No player yet!)'} - Black Timer: {formatTime(blackTimer)}
        </ListItem>
      </List>
      <ChessBoard gameAreaController={gameAreaController} />
    </Container>
  );
}

/**
 * A wrapper component for the ChessArea component.
 * Determines if the player is currently in a chess area on the map, and if so,
 * renders the ChessArea component in a modal.
 *
 */
export default function ChessAreaWrapper(): JSX.Element {
  const gameArea = useInteractable<GameAreaInteractable>('gameArea');
  const townController = useTownController();
  const closeModal = useCallback(() => {
    if (gameArea) {
      townController.interactEnd(gameArea);
      const controller = townController.getGameAreaController(gameArea);
      controller.leaveGame();
    }
  }, [townController, gameArea]);

  if (gameArea && gameArea.getData('type') === 'Chess') {
    console.log('IN CHESS AREA');
    return (
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false} size={'4xl'}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{gameArea.name}</ModalHeader>
          <ModalCloseButton />
          <ChessArea interactableID={gameArea.name} />
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
