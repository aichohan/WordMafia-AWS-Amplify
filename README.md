
# Word Mafia Game

Word Mafia is a dynamic, multiplayer game designed to provide a thrilling experience by combining elements of strategy, social deduction, and word-guessing.  Developed using React and Material UI for a polished frontend experience, and Python for robust server-side game logic, this project highlights a scalable, serverless architecture leveraging various AWS services for seamless real-time multiplayer interactions.

This document outlines the technical architecture, including data structures, APIs, AWS roles, high-level game logic, and design considerations.

## Why I Made It

Inspired by countless game nights in NYC, where my role as the moderator meant sacrificing my own enjoyment for the sake of others, I created Word Mafia on AWS. This endeavor aimed to shift my position from merely overseeing the game to actively participating in those precious game nights. Eager to immerse myself in the action and craft lasting memories, I wanted to build an app that would automate the once tedious tasks of moderating. Word Mafia is a tribute to those gatherings, enabling everyone to play, strategize, and embrace the excitement of the game together.

## Architecture Overview

```plaintext
Frontend (React App + Material UI) 
   |
   |---[HTTPS]---> (Amazon CloudFront)
                     |
                     |---[HTTPS]---> (Amazon API Gateway)
                                         |
                                         |---[invokes]---> (AWS Lambda - Game Logic in Python)
                                                              |      |
                                     [reads/writes] <--------|      |----> [reads/writes]
                                                              |      |
                                                          (Amazon Cognito)   (Amazon DynamoDB - Game Data Storage)
                                                              |
                                                              |--------> [stores]
                                                                 |
                                                            (Amazon S3 - Deployment Files)
```

The game leverages a comprehensive set of AWS services for gameplay management, session handling, and data storage:

- **AWS Amplify**: Streamlines frontend and backend integration, simplifying the development and deployment process.
- **Amazon CloudFront**: Distributes the game's static and dynamic content worldwide, ensuring fast load times and enhanced security through a global network of edge locations. CloudFront interfaces between users and the application, caching content to reduce latency and protect against network attacks.
- **Amazon API Gateway**: Serves as the secure entry point for frontend requests, routing them to the correct AWS Lambda functions based on API paths. This is then used by 
- **AWS Lambda**: Executes the core game logic written in Python, managing lobbies, player sessions, and game state transitions.
- **Amazon DynamoDB**: Acts as the primary database, storing session data and player profiles with high availability and scalability.
- **Amazon Cognito**: Manages user authentication and authorization, integrating seamlessly with the frontend for secure access control.
- **Amazon S3**: Hosts the game's deployment files and assets, with CloudFront delivering this content efficiently across the globe.

![Image](https://github.com/user-attachments/assets/e2c9332a-386e-4302-8148-f6ff87248895)
![Image](https://github.com/user-attachments/assets/41319c32-9c31-44f1-a753-655053e7f101)

### **Design Considerations**

-   **Scalability**: Serverless architecture with AWS Lambda and DynamoDB scales automatically to accommodate varying numbers of concurrent game sessions.
-   **Security**: Use of Amazon Cognito for user authentication helps secure access. IAM roles and policies are defined to enforce least privilege access to AWS resources.
-   **Cost-Efficiency**: Serverless services incur costs based on usage, ensuring cost-efficiency for varying load patterns.
-   **User Experience**: Real-time updates via WebSockets ensure a dynamic and engaging user experience.
-   **Maintainability**: Modular architecture and clear separation of concerns between frontend and backend logic facilitate easier maintenance and updates.

### **Roles and Setup:**

-   **Roles**: Players are randomly assigned one of two roles - Civilian or Mafia.
-   **Mafia Count**: The number of Mafia players is predetermined based on the party size. Typically, there is 1 Mafia for smaller groups, but for parties of 10 or more, 2 Mafias are recommended.

### **Gameplay:**

1.  **Word Reveal:** At the game's start, a word is displayed to all players. Civilians see a specific word (e.g., "ball"), while Mafia players see "MAFIA" on their screens, indicating their role.
2.  **Objective**:

-   **Civilians** aim to covertly signal their knowledge of the word to other Civilians while being vague enough to prevent the Mafia from catching on.
-   **Mafia** must blend in with Civilians, pretending to know the word and giving plausible synonyms or related terms without actual knowledge of the word. This is a total educated guess based on context clues.

1.  **Turns**: A player is randomly chosen to start, with the direction of play (left or right) also determined randomly. Players then take turns providing their word or clue.
2.  **Discussion and Voting**: After everyone has spoken, a discussion phase allows players to debate who they suspect is the Mafia. A vote follows, aiming to eliminate the suspected Mafia player.
3.  **Elimination and Victory Conditions:**

-   If the Mafia is correctly identified and voted out, Civilians win. However, the ousted Mafia player has a final chance to win by correctly guessing the original word.
-   If the Mafia is not correctly voted out, the game proceeds to the next round without the incorrectly accused player. The same Mafia player(s) continue, but a new word is chosen.
-   The Mafia wins by remaining undetected for three consecutive rounds or by correctly guessing the word at any point.

### **Joining and Starting a Game:**

-   **Joining a Party**: To join an existing party, players enter a unique code provided by the host. This seamlessly integrates them into an existing game lobby.
-   **Creating a Party**: Hosts input their name and select the desired number of Mafia players. A unique party code is generated for others to join..
-   **Starting the Game**: As participants join, the screen displays each player's name along with the total number of players in the game, ensuring everyone is accounted for before starting. The host initiates the game once all players have joined, setting the stage for an engaging round of Word Mafia.

  <p align="center">
  <img src="https://github.com/user-attachments/assets/8d239fc8-543b-46d9-99b8-cdee60b638e7" alt="Image">
</p>

## Setup Instructions

### Prerequisites

- Node.js (v14.x or newer)
- npm (v6.x or newer)
- Configured AWS account and AWS CLI
- Python (for AWS Lambda logic)


### Setting up Amazon DynamoDB

Amazon DynamoDB is used to store and manage game sessions and player data efficiently. Here’s how to set up DynamoDB for your project:

1. **Define Your Data Model**: Before creating your DynamoDB table, identify the structure of the data your game will manage. For Word Mafia, you might have tables for `GameSessions` and `Players`.

2. **Create a DynamoDB Table**:
   
   a. Navigate to the DynamoDB section in the AWS Management Console.
   
   b. Click “Create table”. Name your table `WordMafiaGames` for storing game session data. Set the primary key as `gameId` (String type) which uniquely identifies each game session.
   
   c. Optionally, you can define secondary indexes if you plan to query data in ways other than using the primary key.


4. **Accessing Data in Your Application**: Utilize AWS Amplify’s API to perform CRUD operations. For example, the game logic does something like this to add a new game session.  :

   ```javascript
   import { API } from 'aws-amplify';
   
   async function createGameSession(playerName) {
     const apiName = 'WordMafiaApi'; // Replace with your actual API name
     const path = '/games'; // Specify the API path
     const newItem = {
       body: {
         gameId: 'unique-game-id', // unique ID for each game session
         host: playerName,
         players: [playerName],
         status: 'waiting',
       },
     };

     try {
       const response = await API.post(apiName, path, newItem);
       console.log('Game session created:', response);
     } catch (error) {
       console.error('Error creating game session:', error);
     }
   }
   ```

Review section on data models for more details. 

5. **Monitoring and Managing Your Table**: Keep an eye on your DynamoDB table’s performance and capacity in the AWS Management Console. Adjust provisioned capacity settings or enable auto-scaling to manage read/write throughput.

### Security Considerations

- Ensure your AWS IAM roles are correctly configured to provide your application with access to the DynamoDB tables. This includes read, write, and delete permissions as necessary.
- Consider enabling encryption at rest for your DynamoDB tables to enhance data security.

---


### Frontend Setup

1. Clone the repository and navigate into it:

   ```bash
   git clone https://github.com/yourGitHub/WordMafia-Amplify-React.git
   cd WordMafia-Amplify-React
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm start
   ```

### Backend Setup with AWS Amplify

1. Install AWS Amplify CLI globally:

   ```bash
   npm install -g @aws-amplify/cli
   ```

2. Initialize Amplify in the project directory and follow the setup prompts:

   ```bash
   amplify init
   ```

3. Add backend resources (Authentication, API, and Database):

   ```bash
   amplify add auth
   amplify add api
   amplify add storage
   ```

   During API setup, choose "REST" and configure paths as per your game logic.

4. Deploy the backend resources:

   ```bash
   amplify push
   ```


### Deployment

Deploy your game using the AWS Amplify Console, which provides a CI/CD pipeline:

1. Connect your GitHub repository to AWS Amplify Console.
2. Set up the build and deployment process as outlined by Amplify docs.
3. AWS Amplify automatically builds and deploys your application to a CDN upon code changes.


### Data Models

#### GameSessions Model

This model represents each game session created. It includes details about the session state, players, and the game's word if it has started.

- **TableName**: `WordMafiaGames`
- **Attributes**:
  - `gameId` (String): Primary Key. A unique identifier for the game session.
  - `host` (String): The player who created the game session.
  - `players` (List): An array of player objects participating in the game.
    - Each `player` object within the list may include:
      - `playerName` (String): The name of the player.
      - `role` (String): Assigned role to the player (`Mafia`, `Civilian`, etc.).
  - `status` (String): Current status of the game (`waiting`, `started`, `ended`).
  - `word` (String, optional): The word selected for the game session, revealed when the game starts.

#### Players Model

While the players are nested within the `GameSessions` model as a list, here's a closer look at the structure of each player object within that list.

- **Included in**: `players` attribute of the `GameSessions` model.
- **Attributes**:
  - `playerName` (String): The name of the player.
  - `role` (String): The role assigned to the player. This attribute is populated once the game starts.

### DynamoDB Setup for GameSessions

To create the `GameSessions` table in DynamoDB, follow these steps, assuming use of the AWS Management Console:

1. Go to the DynamoDB service within the AWS Management Console.
2. Click "Create table".
3. Enter `WordMafiaGames` for the table name.
4. Set the Primary key to `gameId` with type String.
5. Leave the default settings for table settings, or adjust according to your access patterns and capacity planning.
6. Click "Create".

### Interacting with Data Models via API and Lambda

The game leverages AWS Lambda functions, triggered by API Gateway, to interact with these data models.  For instance:

- **Create Game**: Invokes a Lambda function that generates a new `GameSessions` entry with initial `status` set to `waiting`. It assigns the `host` and initializes the `players` list with the host as the first player.

- **Join Game**: Targets a Lambda function to update the `GameSessions` entry identified by `gameId`, appending a new player to the `players` list.

- **Start Game**: Activates a Lambda function to update the `GameSessions` entry's `status` to `started`, randomly assigns `roles` to each player in the `players` list, and selects a `word` for the session.

Here are examples of request and response payloads for the "Create Game", "Join Game", and "Start Game" actions as they might be handled by AWS Lambda functions through API Gateway. These examples illustrate how data is passed to and from the frontend, through the API, to the backend Lambda functions, and their expected responses.

#### Create Game

**Request Payload:**

```json
{
  "action": "createGame",
  "playerName": "HostPlayer"
}
```

**Response Payload:**

```json
{
  "status": "success",
  "data": {
    "gameId": "123-456",
    "status": "waiting",
    "players": ["HostPlayer"],
    "message": "Game session created successfully."
  }
}
```

### Join Game

**Request Payload:**

```json
{
  "action": "joinGame",
  "gameId": "123-456",
  "playerName": "JoiningPlayer"
}
```

**Response Payload:**

```json
{
  "status": "success",
  "data": {
    "gameId": "123-456",
    "status": "waiting",
    "players": ["HostPlayer", "JoiningPlayer"],
    "message": "Player joined the game successfully."
  }
}
```

### Start Game

**Request Payload:**

```json
{
  "action": "startGame",
  "gameId": "123-456"
}
```

**Response Payload:**

```json
{
  "status": "success",
  "data": {
    "gameId": "123-456",
    "status": "started",
    "players": [
      {
        "playerName": "HostPlayer",
        "role": "Civilian"
      },
      {
        "playerName": "JoiningPlayer",
        "role": "Mafia"
      }
    ],
    "word": "apple",
    "message": "Game started successfully."
  }
}
```
