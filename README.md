# ServerTask

ServerTask is a serverless task management application built on AWS.

The project uses React for the frontend and AWS serverless services for the backend, including API Gateway, Lambda, DynamoDB, S3, Rekognition, and AWS CDK.

## Project Goals

- Create, view, update, and delete tasks
- Store task data in DynamoDB
- Upload task images to S3
- Analyze uploaded images using Amazon Rekognition
- Define cloud infrastructure using AWS CDK
- Demonstrate a cost effective serverless architecture

## Architecture

React frontend communicates with API Gateway. API Gateway invokes Lambda functions that manage task data in DynamoDB, generate S3 upload URLs, and call Rekognition for image analysis.