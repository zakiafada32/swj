import { SQSEvent } from 'aws-lambda';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

interface prepaidOrderSucceedQueue {
  partnerId: string;
  transactionId: string;
}

export async function handler(event: SQSEvent) {
  try {
    // Read event data from sqs
    const messages = event.Records.map((record) => {
      const body = JSON.parse(record.body) as {
        Subject: string;
        Message: prepaidOrderSucceedQueue;
      };
      return { subject: body.Subject, meesage: body.Message };
    });

    // update transaction

    // Publish event to sns
    const sns = new SNSClient({ region: process.env.REGION });
    const publishCommand = new PublishCommand({
      Subject: 'subject for sns topic',
      Message: 'some message to receiver',
      TopicArn: process.env.SNS_TOPIC_ARN,
    });

    await sns.send(publishCommand);
  } catch (error) {
    // deliver to dead letter queue
  }
}
