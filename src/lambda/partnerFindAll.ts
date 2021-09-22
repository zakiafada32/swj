import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { addCorsHeader } from '../utils/utils';

const dbClient = new DynamoDB.DocumentClient();

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: 'read partner data',
  };
  addCorsHeader(result);
  try {
    const queryResponse = await dbClient
      .scan({
        TableName: process.env.TABLE_NAME!,
      })
      .promise();
    result.body = JSON.stringify(queryResponse.Items);

    return result;
  } catch (error) {
    if (error instanceof Error) {
      result.statusCode = 500;
      result.body = error.message;
    }

    return result;
  }
}
