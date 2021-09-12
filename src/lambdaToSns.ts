import { APIGatewayProxyEvent } from 'aws-lambda';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

async function handler(event: APIGatewayProxyEvent) {
  const sns = new SNSClient({ region: process.env.REGION });

  const publishCommand = new PublishCommand({
    Message: 'Command send from Lambda to sns',
    Subject: 'Publish ok',
    TopicArn: process.env.SNS_TOPIC_ARN,
  });

  await sns.send(publishCommand);
}

export { handler };
