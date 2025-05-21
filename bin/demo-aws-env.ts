#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { PipelineStack } from '../lib/pipeline-stack';
import {CodeBucketStack} from "../lib/code-bucket-stack";

const app = new cdk.App();

const codeBucketStack = new CodeBucketStack(app, 'CodeBucket');

new PipelineStack(app, 'DemoAwsEnvStackOne', {
  sourceBucket: codeBucketStack.bucket,
  envName: 'one'
});