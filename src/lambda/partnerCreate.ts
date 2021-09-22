import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { addCorsHeader, getEventBody, MissingFieldError, validatePartnerData } from '../utils/utils';

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

    const alreadyExist = await dbClient
      .scan({
        TableName: process.env.TABLE_NAME!,
        Limit: 1,
        ExpressionAttributeNames: {
          '#key': 'name',
        },
        ExpressionAttributeValues: {
          ':value': partner.name,
        },
        FilterExpression: '#key = :value',
      })
      .promise();

    if (alreadyExist.Items !== undefined && alreadyExist.Items.length > 0) {
      throw new Error('Partner name already exist');
    }

    await dbClient
      .put({
        TableName: process.env.TABLE_NAME!,
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
