// Import AWS SDK for JavaScript v3 packages
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

// Helper function to generate a unique 6-digit PIN
const generateGameId = () => {
    const firstPart = Math.floor(100 + Math.random() * 900); // Generates a number between 100 and 999
    const secondPart = Math.floor(100 + Math.random() * 900); // Same as above
    return `${firstPart}-${secondPart}`;
};

// Main Lambda handler
exports.handler = async (event) => {
    console.log("Received event:", JSON.stringify(event, null, 2)); // Log the incoming event for debugging

    // Initialize DynamoDB Document Client
    const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "us-east-1" }));

    // Parse the request body from event
    let playerName;
    try {
        const requestBody = event.body ? JSON.parse(event.body) : {};
        playerName = requestBody.playerName;
        if (!playerName) {
            // If playerName is not provided, return a 400 Bad Request response
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({ error: "Bad Request: playerName is required" }),
            };
        }
    } catch (error) {
        console.error("Error parsing event body:", error);
        return {
            statusCode: 400,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ error: "Bad Request: Invalid request body" }),
        };
    }

    // Generate a unique game ID
    const gameId = generateGameId();

    // Define the new game session item
    const item = {
        gameId,
        status: "pending", // Initial status of the game
        players: [{ playerName, isHost: true }], // Mark the player as the host
        createdAt: new Date().toISOString(),
    };

    // Set up parameters for DynamoDB put operation
    const params = {
        TableName: "WordMafiaGames", // Replace with your actual table name
        Item: item,
    };

    try {
        // Attempt to create the new game session in DynamoDB
        await ddbDocClient.send(new PutCommand(params));
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST",
            },
            body: JSON.stringify({ message: "Game session created successfully", gameId }),
        };
    } catch (error) {
        console.error("Error creating game session:", error);
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST",
            },
            body: JSON.stringify({ error: "Failed to create game session", details: error.message }),
        };
    }
};
