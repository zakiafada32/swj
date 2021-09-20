import { Stack, StackProps } from 'aws-cdk-lib';
import { Cors, LambdaIntegration, ResourceOptions, RestApi } from 'aws-cdk-lib/lib/aws-apigateway';
import { Construct } from 'constructs';
import { join } from 'path';
import { GenericLambda } from './generic-lambda';
import { GenericTable } from './generic-table';

export class SriwijayaStack extends Stack {
  private api = new RestApi(this, 'Sriwijaya');

  // partner
  private partnerData = new GenericTable(this, {
    tableName: 'PartnerData',
    primaryKey: 'id',
  });
  private createPartner = new GenericLambda(this, {
    name: 'createPartner',
    path: join('src', 'lambda', 'partner', 'create.ts'),
    table: this.partnerData,
  });
  private createPartnerIntegration = new LambdaIntegration(this.createPartner.lambdaFunction);
  private readPartner = new GenericLambda(this, {
    name: 'readPartner',
    path: join('src', 'lambda', 'partner', 'read.ts'),
    table: this.partnerData,
  });
  private readPartnerIntegration = new LambdaIntegration(this.readPartner.lambdaFunction);

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const corsOption: ResourceOptions = {
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
      },
    };

    // parthner integration
    const partnerResource = this.api.root.addResource('partner', corsOption);
    partnerResource.addMethod('GET', this.readPartnerIntegration);
    partnerResource.addMethod('POST', this.createPartnerIntegration);
  }
}
