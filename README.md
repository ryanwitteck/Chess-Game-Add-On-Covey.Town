# Group 411

Group Members:

Olver Marker

Ryan Witteck

Aretha Chen

Hagen Zhang

(This is my forked version from our main project. To view our main page, visit: https://github.com/neu-cs4530/fall23-team-project-group-411 ) 

You may play our chess implementation here: https://chess-final-project-group-411.onrender.com/ 

IMPORTANT: 
1. You must open two windows to play against yourself: first create a town in one window, then in the second window, join the town you just created at the bottom of the login page.
2. Depending on when you are viewing this, our free trial with render.com may have expired, so if the website is down, you will have to run it locally in order to play it. Instructions for running this project locally are listed below.

This chess game is an add-on to Covey.Town, an open source project (more information on Covey.Town can be found below). Our chess project was designed and implemented from scratch, with no API. We have implemented a fully functional board, with each piece having its own move rules like it does in a normal game of chess. 

We have implemented special moves in chess as well, including long and short castling, pawn promotion, and en passant moves. We have implemented each piece off of a general ChessPiece interface, and as such, each piece has its own move rules and limitations. Lots of testing was done for each individual piece, as well as any special moves a piece can do (rook, pawn, etc.)

We have also implemented an arcade style all-time and local leaderboard. Our all-time leaderboard uses Firebase to keep track of all wins/losses across our project. Our local leaderboard is only for a specific Town instance. Both are visible at anytime while playing or waiting to play a game of chess. 

Time constraints are also available in this project, with Normal, Fast, or Lightning games. Normal mode gives each player 10 minutes to play, Fast gives 5, and Lightning gives 1. The first player to join a game sets the time contraint for that game. 

The only design decision that deviates from normal chess is the ability to win on checkmate. In a normal game of chess, you can checkmate your opponent and win the game. However, in our implementation, when you checkmate your opponent, the game does not end. Instead, the win condition is to take the enemy King. Therefore, the game will go on for one extra turn, however it will not impact the game at all, as the player in checkmate will always lose, no matter what move they do. 

# Covey.Town

Covey.Town provides a virtual meeting space where different groups of people can have simultaneous video calls, allowing participants to drift between different conversations, just like in real life.
Covey.Town was built for Northeastern's [Spring 2021 software engineering course](https://neu-se.github.io/CS4530-CS5500-Spring-2021/), and is designed to be reused across semesters.
You can view our reference deployment of the app at [app.covey.town](https://app.covey.town/), and our project showcase ([Fall 2022](https://neu-se.github.io/CS4530-Fall-2022/assignments/project-showcase), [Spring 2022](https://neu-se.github.io/CS4530-Spring-2022/assignments/project-showcase), [Spring 2021](https://neu-se.github.io/CS4530-CS5500-Spring-2021/project-showcase)) highlight select student projects.

![Covey.Town Architecture](docs/covey-town-architecture.png)

The figure above depicts the high-level architecture of Covey.Town.
The frontend client (in the `frontend` directory of this repository) uses the [PhaserJS Game Library](https://phaser.io) to create a 2D game interface, using tilemaps and sprites.
The frontend implements video chat using the [Twilio Programmable Video](https://www.twilio.com/docs/video) API, and that aspect of the interface relies heavily on [Twilio's React Starter App](https://github.com/twilio/twilio-video-app-react). Twilio's React Starter App is packaged and reused under the Apache License, 2.0.

A backend service (in the `townService` directory) implements the application logic: tracking which "towns" are available to be joined, and the state of each of those towns.

## Running this app locally

Running the application locally entails running both the backend service and a frontend.

### Setting up the backend

To run the backend, you will need a Twilio account. Twilio provides new accounts with $15 of credit, which is more than enough to get started.
To create an account and configure your local environment:

1. Go to [Twilio](https://www.twilio.com/) and create an account. You do not need to provide a credit card to create a trial account.
2. Create an API key and secret (select "API Keys" on the left under "Settings")
3. Create a `.env` file in the `townService` directory, setting the values as follows:

| Config Value            | Description                               |
| ----------------------- | ----------------------------------------- |
| `TWILIO_ACCOUNT_SID`    | Visible on your twilio account dashboard. |
| `TWILIO_API_KEY_SID`    | The SID of the new API key you created.   |
| `TWILIO_API_KEY_SECRET` | The secret for the API key you created.   |
| `TWILIO_API_AUTH_TOKEN` | Visible on your twilio account dashboard. |

### Starting the backend

Once your backend is configured, you can start it by running `npm start` in the `townService` directory (the first time you run it, you will also need to run `npm install`).
The backend will automatically restart if you change any of the files in the `townService/src` directory.

### Configuring the frontend

Create a `.env` file in the `frontend` directory, with the line: `NEXT_PUBLIC_TOWNS_SERVICE_URL=http://localhost:8081` (if you deploy the towns service to another location, put that location here instead)

For ease of debugging, you might also set the environmental variable `NEXT_PUBLIC_TOWN_DEV_MODE=true`. When set to `true`, the frontend will
automatically connect to the town with the friendly name "DEBUG_TOWN" (creating one if needed), and will *not* try to connect to the Twilio API. This is useful if you want to quickly test changes to the frontend (reloading the page and re-acquiring video devices can be much slower than re-loading without Twilio).

### Running the frontend

In the `frontend` directory, run `npm run dev` (again, you'll need to run `npm install` the very first time). After several moments (or minutes, depending on the speed of your machine), a browser will open with the frontend running locally.
The frontend will automatically re-compile and reload in your browser if you change any files in the `frontend/src` directory.
