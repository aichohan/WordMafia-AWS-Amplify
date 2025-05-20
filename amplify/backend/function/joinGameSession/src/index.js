// Import AWS SDK for JavaScript v3 packages
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

// Initialize DynamoDB Document Client with removeUndefinedValues option
const ddbDocClient = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: "us-east-1" }),
    {
        marshallOptions: {
            removeUndefinedValues: true
        }
    }
);

exports.handler = async (event) => {
    const response = {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*", 
            "Access-Control-Allow-Credentials": true,
        },
        body: "{}",
    };

    try {
        if (!event.body) {
            throw new Error("Request body is undefined or empty");
        }

        const { gameId, playerName } = JSON.parse(event.body);

        if (!gameId || !playerName) {
            throw new Error("Missing required fields: gameId or playerName");
        }

        const params = {
            TableName: "WordMafiaGames",
            Key: { gameId },
            UpdateExpression: "SET players = list_append(if_not_exists(players, :empty_list), :player)",
            ExpressionAttributeValues: {
                ":player": [{ playerName, role: "undecided" }],
                ":empty_list": [],
            },
            ReturnValues: "UPDATED_NEW",
        };

        const result = await ddbDocClient.send(new UpdateCommand(params));
        response.body = JSON.stringify({ message: "Player joined successfully", details: result.Attributes });
    } catch (error) {
        console.error("Error:", error);
        response.statusCode = 500;
        response.body = JSON.stringify({ error: "Failed to process request", details: error.toString() });
    }

    return response;
};
