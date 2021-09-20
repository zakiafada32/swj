import { Stack } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/lib/aws-lambda-nodejs';
import { join } from 'path';
import { GenericTable } from './generic-table';

export interface LambdaProps {
  name: string;
  path: string;
  table?: GenericTable;
}

export class GenericLambda {
  private stack: Stack;
  private props: LambdaProps;
  public lambdaFunction: NodejsFunction;

  constructor(stack: Stack, props: LambdaProps) {
    this.stack = stack;
    this.props = props;
    this.initialize();
  }

  private initialize() {
    this.createLambda();
    this.grantAccessTable();
  }

  private createLambda() {
    const name = this.props.name;
    const lambdaId = `Sriwijaya-${name}`;
    this.lambdaFunction = new NodejsFunction(this.stack, lambdaId, {
      entry: join(__dirname, '..', this.props.path),
      handler: 'handler',
      runtime: Runtime.NODEJS_14_X,
      functionName: lambdaId,
      environment: {},
    });
  }

  private grantAccessTable() {
    if (this.props.table) {
      this.props.table.grantTableRight(this.lambdaFunction);
    }
  }
}
