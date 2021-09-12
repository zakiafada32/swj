import { Stack, StackProps, CfnOutput, Duration } from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Runtime } from 'aws-cdk-lib/lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/lib/aws-lambda-event-sources';
import { NodejsFunction } from 'aws-cdk-lib/lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';

export class SriwijayaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const dlqLambda = new NodejsFunction(this, 'dlq-lambda', {
      runtime: Runtime.NODEJS_14_X,
      timeout: Duration.seconds(3),
      memorySize: 128,
      entry: join(__dirname, '..', 'src', 'dlqLambda.ts'),
      handler: 'handler',
    });

    const deadLetterQueue = new sqs.Queue(this, 'dead-letter-queue', {
      retentionPeriod: Duration.days(4),
    });

    dlqLambda.addEventSource(new SqsEventSource(deadLetterQueue));

    const queue = new sqs.Queue(this, 'SriwijayaQueue', {
      visibilityTimeout: Duration.seconds(30),
      deadLetterQueue: {
        maxReceiveCount: 1,
        queue: deadLetterQueue,
      },
    });

    const topic = new sns.Topic(this, 'SriwijayaTopic');

    topic.addSubscription(new subs.SqsSubscription(queue));

    const refundPartnerBalance = new NodejsFunction(
      this,
      'refundPartnerBalance',
      {
        runtime: Runtime.NODEJS_14_X,
        timeout: Duration.seconds(3),
        memorySize: 128,
        entry: join(__dirname, '..', 'src', 'refundPartnerBalance.ts'),
        handler: 'handler',
      }
    );

    refundPartnerBalance.addEventSource(
      new SqsEventSource(queue, {
        batchSize: 10,
      })
    );

    const lambdaToSns = new NodejsFunction(this, 'lambdaToSnsFn', {
      runtime: Runtime.NODEJS_14_X,
      timeout: Duration.seconds(3),
      memorySize: 128,
      entry: join(__dirname, '..', 'src', 'lambdaToSns.ts'),
      handler: 'handler',
      environment: {
        SNS_TOPIC_ARN: topic.topicArn,
        REGION: 'ap-southeast-1',
      },
    });

    topic.grantPublish(lambdaToSns);

    new CfnOutput(this, 'snsTopicArn', {
      value: topic.topicArn,
      description: 'The arn of the SNS topic',
    });
  }
}
