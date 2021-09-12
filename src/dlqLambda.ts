import { APIGatewayProxyResultV2, SQSEvent } from 'aws-lambda';

async function handler(event: SQSEvent): Promise<APIGatewayProxyResultV2> {
  const messages = event.Records.map((record) => {
    const body = JSON.parse(record.body) as {
      Subject: string;
      Message: String;
    };
    return { subject: body.Subject, meesage: body.Message };
  });

  console.log('message => ', JSON.stringify(messages, null, 2));

  return {
    body: JSON.stringify({ messages }),
    statusCode: 200,
  };
}

export { handler };
