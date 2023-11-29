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
import ChessLocalLeaderboard from '../Leaderboard';
import AllTimeLeaderboard from '../AllTimeLeaderboard';
import ChessBoard from './ChessBoard';
import { updateTies, updateWins, updateLosses } from '../../../Login/FirebaseService';

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
  const [timerType, setTimerType] = useState(gameAreaController.timeType);
  const [gameStatus, setGameStatus] = useState<GameStatus>(gameAreaController.status);
  const [moveCount, setMoveCount] = useState<number>(gameAreaController.moveCount);
  const [observers, setObservers] = useState<PlayerController[]>(gameAreaController.observers);
  const [joiningGame, setJoiningGame] = useState(false);
  const [white, setWhite] = useState<PlayerController | undefined>(gameAreaController.white);
  const [black, setBlack] = useState<PlayerController | undefined>(gameAreaController.black);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [drawProposed, setDrawProposed] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [drawString, setDrawString] = useState('Draw?');
  const [blackTimer, setBlackTimer] = useState(10 * 60 * gameAreaController.timer);
  const [whiteTimer, setWhiteTimer] = useState(10 * 60 * gameAreaController.timer);
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
      setTimerType(gameAreaController.timeType);

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
    const onGameEnd = async () => {
      const winner = gameAreaController.winner;
      const whiteUsername = white?.userName;
      const blackUsername = black?.userName;

      if (!winner) {
        toast({
          title: 'Game over',
          description: 'Game ended in a tie',
          status: 'info',
        });

        // update tie results in database
        await updateTies(blackUsername);
        await updateTies(whiteUsername);
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

      // update win/loss results in database
      if (winner?.userName === blackUsername) {
        await updateWins(blackUsername);
        await updateLosses(whiteUsername);
      } else {
        await updateWins(whiteUsername);
        await updateLosses(blackUsername);
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
      // gameAreaController.timer = 1000;
      bflag = false;
      wflag = false;
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
            setTimerType('Rapid');
            gameAreaController.setTimerType('Rapid');
          }}
          isLoading={joiningGame}
          disabled={timerType !== 'Rapid' && timerType !== undefined ? true : false}>
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
            setTimerType('Blitz');
            gameAreaController.setTimerType('Blitz');
          }}
          isLoading={joiningGame}
          disabled={timerType !== 'Blitz' && timerType !== undefined ? true : false}>
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
            setTimerType('Bullet');
            gameAreaController.setTimerType('Bullet');
          }}
          isLoading={joiningGame}
          disabled={timerType !== 'Bullet' && timerType !== undefined ? true : false}>
          Join Lightning Game
        </Button>
      );
    }

    gameStatusText = (
      <b>
        Game {gameStatus === 'WAITING_TO_START' ? 'not yet started' : 'over'}. {joinGameButton}
        {joinFastGameButton} {joinLightningGameButton}
      </b>
    );
  }

  return (
    <Container maxW={'592px'} alignContent='center'>
      <Accordion allowToggle>
        <AccordionItem>
          <Heading as='h3'>
            <AccordionButton>
              <Box as='span' flex='1' textAlign='left'>
                All-Time Leaderboard
                <AccordionIcon />
              </Box>
            </AccordionButton>
          </Heading>
          <AccordionPanel>
            <AllTimeLeaderboard topN={5} />
          </AccordionPanel>
        </AccordionItem>
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
            <ChessLocalLeaderboard results={history} />
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
