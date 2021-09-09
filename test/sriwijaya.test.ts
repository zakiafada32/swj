import * as cdk from 'aws-cdk-lib';
import * as Sriwijaya from '../lib/sriwijaya-stack';

test('SQS Queue and SNS Topic Created', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Sriwijaya.SriwijayaStack(app, 'MyTestStack');
    // THEN
    const actual = JSON.stringify(app.synth().getStackArtifact(stack.artifactId).template);
    expect(actual).toContain('AWS::SQS::Queue');
    expect(actual).toContain('AWS::SNS::Topic');
});
