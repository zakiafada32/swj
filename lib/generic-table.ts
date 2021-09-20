import { Stack } from 'aws-cdk-lib';
import { AttributeType, Table } from 'aws-cdk-lib/lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/lib/aws-lambda-nodejs';

export interface TableProps {
  tableName: string;
  primaryKey: string;
  secondaryIndex?: string;
}

export class GenericTable {
  public props: TableProps;

  private stack: Stack;
  private table: Table;

  public constructor(stack: Stack, props: TableProps) {
    this.stack = stack;
    this.props = props;
    this.initialize();
  }

  public grantTableRight(lambda: NodejsFunction) {
    // todo: add more specific operation
    this.table.grantReadWriteData(lambda);
  }

  private initialize() {
    this.createTable();
    this.addSecondaryIndexes();
  }

  private createTable() {
    this.table = new Table(this.stack, this.props.tableName, {
      partitionKey: {
        name: this.props.primaryKey,
        type: AttributeType.STRING,
      },
      tableName: this.props.tableName,
    });
  }

  private addSecondaryIndexes() {
    if (this.props.secondaryIndex) {
      this.table.addGlobalSecondaryIndex({
        indexName: this.props.secondaryIndex,
        partitionKey: {
          name: this.props.secondaryIndex,
          type: AttributeType.STRING,
        },
      });
    }
  }
}
