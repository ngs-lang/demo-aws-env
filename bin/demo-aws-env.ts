#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { PipelineStack } from '../lib/pipeline-stack';
import {CodeBucketStack} from "../lib/code-bucket-stack";

const app = new cdk.App();

const codeBucketStack = new CodeBucketStack(app, 'CodeBucket');

new PipelineStack(app, 'DemoAwsEnvStackOne', {
  sourceBucket: codeBucketStack.bucket,
  envName: 'one',
  succeed: true,
});

new PipelineStack(app, 'DemoAwsEnvStackTwo', {
  sourceBucket: codeBucketStack.bucket,
  envName: 'two',
  succeed: true,
});

new PipelineStack(app, 'DemoAwsEnvStackThree', {
  sourceBucket: codeBucketStack.bucket,
  envName: 'three',
  succeed: false,
});

new PipelineStack(app, 'DemoAwsEnvStackFour', {
  sourceBucket: codeBucketStack.bucket,
  envName: 'four',
  succeed: true,
});