import { Stack } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/lib/aws-lambda-nodejs';
import { join } from 'path';
import { GenericTable } from './generic-table';

export interface LambdaProps {
  name: string;
  path: string;
  tableList?: GenericTable[];
}

interface LambdaEnv {
  [key: string]: string;
}

export class GenericLambda {
  private stack: Stack;
  private props: LambdaProps;
  private lambdaFunction: NodejsFunction;

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
      entry: join(__dirname, '..', 'src', 'lambda', `${name}.ts`),
      handler: 'handler',
      functionName: lambdaId,
      environment: {
        ENV_LAMBDA: this.createLambdaEnv(),
      },
    });
  }

  private grantAccessTable() {
    if (this.props.tableList) {
      for (const table of this.props.tableList) {
        table.grantTableRight(this.lambdaFunction);
      }
    }
  }

  private createLambdaEnv(): string {
    let listEnv: LambdaEnv[] = [];
    if (this.props.tableList) {
      for (const table of this.props.tableList) {
        let tableEnv = {
          TABLE_NAME: table.props.tableName,
          PRIMARY_KEY: table.props.primaryKey,
        };
        listEnv.push(tableEnv);
      }
    }
    return JSON.stringify(listEnv);
  }
}
