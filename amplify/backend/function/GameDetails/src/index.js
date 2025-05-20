// Import AWS SDK for JavaScript v3 packages for DynamoDB
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

// Initialize DynamoDB Document Client
const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "us-east-1" }));

exports.handler = async (event) => {
    const gameId = event.pathParameters.gameId;

    const params = {
        TableName: 'WordMafiaGames', // Ensure this matches your actual DynamoDB table name
        Key: { gameId }
    };

    try {
        const result = await ddbDocClient.send(new GetCommand(params));
        
        if (!result.Item) {
            return {
                statusCode: 404,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*", // Allow from any origin
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
                },
                body: JSON.stringify({ error: 'Game not found' }),
            };
        }
        
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*", // Allow from any origin
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify(result.Item),
        };
    } catch (error) {
        console.error('Error fetching game details:', error);
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*", // Allow from any origin
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify({ error: 'Internal server error', details: error.message }),
        };
    }
};
