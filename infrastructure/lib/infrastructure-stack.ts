import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const tasksTable = new dynamodb.Table(this, 'TasksTable', {
      tableName: 'server-task-tasks',
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'taskId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    tasksTable.addGlobalSecondaryIndex({
      indexName: 'StatusIndex',
      partitionKey: {
        name: 'status',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'createdAt',
        type: dynamodb.AttributeType.STRING,
      },
    });

    const taskImagesBucket = new s3.Bucket(this, 'TaskImagesBucket', {
      bucketName: `server-task-images-${this.account}-${this.region}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
            s3.HttpMethods.DELETE,
          ],
          allowedOrigins: ['http://localhost:3000'],
          allowedHeaders: ['*'],
        },
      ],
    });

    const taskFunction = new lambda.Function(this, 'TaskFunction', {
      functionName: 'server-task-api-handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        TASKS_TABLE_NAME: tasksTable.tableName,
        TASK_IMAGES_BUCKET_NAME: taskImagesBucket.bucketName,
      },
    });

    tasksTable.grantReadWriteData(taskFunction);
    taskImagesBucket.grantReadWrite(taskFunction);

    taskFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['rekognition:DetectLabels'],
        resources: ['*'],
      })
    );

    const api = new apigateway.RestApi(this, 'ServerTaskApi', {
      restApiName: 'server-task-api',
      description: 'API Gateway for ServerTask serverless task management app',
      defaultCorsPreflightOptions: {
        allowOrigins: ['http://localhost:3000'],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    const tasks = api.root.addResource('tasks');

    tasks.addMethod('GET', new apigateway.LambdaIntegration(taskFunction));
    tasks.addMethod('POST', new apigateway.LambdaIntegration(taskFunction));

    const task = tasks.addResource('{taskId}');
    task.addMethod('GET', new apigateway.LambdaIntegration(taskFunction));
    task.addMethod('PUT', new apigateway.LambdaIntegration(taskFunction));
    task.addMethod('DELETE', new apigateway.LambdaIntegration(taskFunction));

    const uploadUrl = task.addResource('upload-url');
    uploadUrl.addMethod('POST', new apigateway.LambdaIntegration(taskFunction));

    const processImage = task.addResource('process-image');
    processImage.addMethod('POST', new apigateway.LambdaIntegration(taskFunction));

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'ServerTask API Gateway URL',
    });

    new cdk.CfnOutput(this, 'TasksTableName', {
      value: tasksTable.tableName,
      description: 'DynamoDB table name',
    });

    new cdk.CfnOutput(this, 'TaskImagesBucketName', {
      value: taskImagesBucket.bucketName,
      description: 'S3 bucket for task images',
    });
  }
}