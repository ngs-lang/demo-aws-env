import * as cdk from 'aws-cdk-lib';
import {Aspects, pipelines, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {IBucket} from "aws-cdk-lib/aws-s3";
import {Policy, PolicyStatement} from "aws-cdk-lib/aws-iam";

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps & { sourceBucket: IBucket, envName: string }) {
    super(scope, id, props);

    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      pipelineName: `DemoNoRepoPipeline-${props.envName}`,
      synth: new pipelines.CodeBuildStep('Synth', {
        input: pipelines.CodePipelineSource.s3(props.sourceBucket, 'source.zip'),
        installCommands: ['npm install -g aws-cdk', 'npm ci'],
        commands: ['npm run build', 'npx cdk synth'],
        primaryOutputDirectory: 'cdk.out',
      }),
    });

    const policy = new Policy(this, 'S3ReadAccessPolicy', {
      statements: [
        new PolicyStatement({
          actions: ['s3:Get*'],
          resources: [
            `arn:aws:s3:::${props.sourceBucket.bucketName}/*`
          ],
        }),
      ],
    });

    Aspects.of(pipeline).add({
      visit(node) {
        if (node instanceof pipelines.CodePipeline) {
          node.pipeline.role.attachInlinePolicy(
            policy
          )
        }
      },
    })


    pipeline.addStage(new AppStage(this, 'DeployApp', {
      envName: props.envName,
    }));
  }
}

export class AppStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props: cdk.StageProps & { envName: string }) {
    super(scope, id, props);
    new AppStack(this, `MyAppStack-${props.envName}`, {
      envName: props.envName,
    });
  }
}

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps & { envName: string }) {
    super(scope, id, props);
    new cdk.aws_lambda.Function(this, 'MyFunction', {
      functionName: `MyFunction-${props.envName}`,
      runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: cdk.aws_lambda.Code.fromInline('exports.handler = async (event) => { console.log(event); return "Hello World"; };'),
    });
  }
}
