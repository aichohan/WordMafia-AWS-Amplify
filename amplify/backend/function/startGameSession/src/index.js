// Import AWS SDK for JavaScript v3 packages
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

// Initialize DynamoDB Document Client
const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "us-east-1" }));

// Static list of words to choose from
const words = ["apple", "banana", "cherry", "date", "elderberry"];

// Function to randomly assign roles to players, ensuring only one Mafia
const assignRoles = (players) => {
    let shuffled = [...players].sort(() => 0.5 - Math.random()); // Shuffle players array
    return shuffled.map((player, index) => ({
        ...player,
        role: index === 0 ? "Mafia" : "Civilian", // First player in the shuffled array is the Mafia
    }));
};

exports.handler = async (event) => {
    const { gameId } = JSON.parse(event.body);

    try {
        // Retrieve the game session to check the number of players and current status
        const getSessionParams = {
            TableName: "WordMafiaGames",
            Key: { gameId },
        };
        const { Item } = await ddbDocClient.send(new GetCommand(getSessionParams));

        if (!Item || Item.players.length < 4) {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*", // CORS header
                    "Access-Control-Allow-Credentials": true, // If needed for cookies, authorization headers with HTTPS
                },
                body: JSON.stringify({ message: "Not enough players to start the game (minimum 4)." }),
            };
        }

        // Select a random word from the list for the game
        const randomWord = words[Math.floor(Math.random() * words.length)];

        // Assign roles to players with exactly one Mafia
        const updatedPlayers = assignRoles(Item.players);

        // Update the game session to start the game, assign roles, and set the word
        const updateSessionParams = {
            TableName: "WordMafiaGames",
            Key: { gameId },
            UpdateExpression: "SET #status = :status, players = :players, #word = :word",
            ExpressionAttributeNames: {
                "#status": "status",
                "#word": "word",
            },
            ExpressionAttributeValues: {
                ":status": "started",
                ":players": updatedPlayers,
                ":word": randomWord,
            },
        };
        await ddbDocClient.send(new UpdateCommand(updateSessionParams));

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*", // CORS header
                "Access-Control-Allow-Credentials": true, // If needed
            },
            body: JSON.stringify({ message: "Game started successfully", gameId, players: updatedPlayers, word: randomWord }),
        };
    } catch (error) {
        console.error("Error starting game session:", error);
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*", // CORS header
                "Access-Control-Allow-Credentials": true, // If needed
            },
            body: JSON.stringify({ error: "Failed to start game session", details: error.message }),
        };
    }
};
