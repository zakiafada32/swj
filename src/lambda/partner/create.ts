import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { addCorsHeader, getEventBody, MissingFieldError, validatePartnerData } from './utils';

const TABLE_NAME = 'PartnerData';
const dbClient = new DynamoDB.DocumentClient();

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  const result: APIGatewayProxyResult = {
    body: 'create partner data',
    statusCode: 201,
  };
  addCorsHeader(result);

  try {
    const body = getEventBody(event);
    const partner = validatePartnerData(body);

    await dbClient
      .put({
        TableName: TABLE_NAME!,
        Item: partner,
      })
      .promise();
    result.body = JSON.stringify({
      id: partner.id,
    });

    return result;
  } catch (error) {
    if (error instanceof MissingFieldError) {
      result.statusCode = 400;
      result.body = JSON.stringify(error.message);
    } else if (error instanceof Error) {
      result.statusCode = 500;
      result.body = JSON.stringify({
        message: error.message,
      });
    }
    return result;
  }
}
