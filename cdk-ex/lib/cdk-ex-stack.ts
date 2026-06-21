import * as cdk from 'aws-cdk-lib/core';
import * as sns from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';

export class CdkExStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props ?: cdk.StackProps) {
    super(scope, id, props);


    const standardTopic = new sns.Topic(this, 'StandardTopic', {
      topicName: 'standard-topic',
    });

    const fifoTopicFifo = new sns.Topic(this, 'FifoTopicFifo', {
      topicName: 'fifo-topic.fifo',
      fifo: true,
    });

  }
}
