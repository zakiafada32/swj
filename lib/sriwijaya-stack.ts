import { Stack, StackProps } from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { SqsEventSource } from 'aws-cdk-lib/lib/aws-lambda-event-sources';
import { Cors, LambdaIntegration, ResourceOptions, RestApi } from 'aws-cdk-lib/lib/aws-apigateway';
import { Construct } from 'constructs';
import { join } from 'path';
import { GenericLambda } from './generic-lambda';
import { GenericTable } from './generic-table';

export class SriwijayaStack extends Stack {
  // everything about endpoint
  // create root url
  private api = new RestApi(this, 'Sriwijaya');
  private corsOption: ResourceOptions = {
    defaultCorsPreflightOptions: {
      allowOrigins: Cors.ALL_ORIGINS,
      allowMethods: Cors.ALL_METHODS,
    },
  };
  // endpoint http://root/partner/
  private partnerResource = this.api.root.addResource('partner', this.corsOption);

  // everything about dynamodb
  private partnerData = new GenericTable(this, {
    tableName: 'PartnerData',
    primaryKey: 'id',
  });

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // everything about integration between services
    // create partner lambda
    const partnerCreate = new GenericLambda(this, {
      name: 'partnerCreate',
      path: join('src', 'lambda', 'partnerCreate.ts'),
      tableList: [this.partnerData],
      environment: {
        TABLE_NAME: this.partnerData.props.tableName,
        PRIMARY_KEY: this.partnerData.props.primaryKey,
      },
    });
    const partnerCreateIntegration = new LambdaIntegration(partnerCreate.lambdaFunction);
    this.partnerResource.addMethod('POST', partnerCreateIntegration);

    // find all partner lambda
    const partnerFindAll = new GenericLambda(this, {
      name: 'findAllPartner',
      path: join('src', 'lambda', 'partnerFindAll.ts'),
      tableList: [this.partnerData],
      environment: {
        TABLE_NAME: this.partnerData.props.tableName,
        PRIMARY_KEY: this.partnerData.props.primaryKey,
      },
    });
    const partnerReadIntegration = new LambdaIntegration(partnerFindAll.lambdaFunction);
    this.partnerResource.addMethod('GET', partnerReadIntegration);

    // partner balance refunded lambda
    const partnerBalanceRefundedDLQ = new sqs.Queue(this, 'partnerBalanceRefundedDLQ');
    const partnerBalanceRefundedQueue = new sqs.Queue(this, 'partnerBalanceRefundedQueue', {
      deadLetterQueue: {
        maxReceiveCount: 1,
        queue: partnerBalanceRefundedDLQ,
      },
    });
    const partnerBalanceRefunded = new GenericLambda(this, {
      name: 'partnerBalanceRefunded',
      path: join('src', 'lambda', 'partnerBalanceRefunded.ts'),
      tableList: [this.partnerData],
      environment: {
        TABLE_NAME: this.partnerData.props.tableName,
        PRIMARY_KEY: this.partnerData.props.primaryKey,
      },
    });
    partnerBalanceRefunded.lambdaFunction.addEventSource(new SqsEventSource(partnerBalanceRefundedQueue));

    // Prepaid order succeed
    const prepaidOrderSucceedDLQ = new sqs.Queue(this, 'prepaidOrderSucceedDLQ');
    const prepaidOrderSucceedQueue = new sqs.Queue(this, 'prepaidOrderSucceedQueue', {
      deadLetterQueue: {
        maxReceiveCount: 1,
        queue: prepaidOrderSucceedDLQ,
      },
    });
    const prepaidOrderSucceed = new GenericLambda(this, {
      name: 'prepaidOrderSucceed',
      path: join('src', 'lambda', 'prepaidOrderSucceed.ts'),
    });
    prepaidOrderSucceed.lambdaFunction.addEventSource(new SqsEventSource(prepaidOrderSucceedQueue));
  }
}
