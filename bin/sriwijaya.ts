#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { SriwijayaStack } from '../lib/sriwijaya-stack';

const app = new cdk.App();
new SriwijayaStack(app, 'SriwijayaStack');
