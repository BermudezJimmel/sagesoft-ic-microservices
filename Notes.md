Create Role for IAM ECS

#CORE
aws ecs run-task --cluster ic-microservices-core-cluster --launch-type FARGATE --network-configuration "awsvpcConfiguration={subnets=[subnet-0b2ee0c3f32851186],securityGroups=[sg-096f63e4a75771c79],assignPublicIp=ENABLED}" --task-definition ic-microservices-core-task

Login ECR
- aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin 795189341938.dkr.ecr.ap-southeast-1.amazonaws.com

#RUN TASK

#CORE
aws ecs run-task --cluster ic-microservices-core-cluster --launch-type FARGATE --network-configuration "awsvpcConfiguration={subnets=[subnet-0b2ee0c3f32851186],securityGroups=[sg-096f63e4a75771c79],assignPublicIp=ENABLED}" --task-definition ic-microservices-core-task

#API Gateway
aws ecs run-task --cluster ic-microservices-api-gateway-cluster --launch-type FARGATE --network-configuration "awsvpcConfiguration={subnets=[subnet-0b2ee0c3f32851186],securityGroups=[sg-096f63e4a75771c79],assignPublicIp=ENABLED}" --task-definition ic-microservices-api-gateway-task

#Authentication
aws ecs run-task --cluster ic-microservices-authentiation-api-cluster --launch-type FARGATE --network-configuration "awsvpcConfiguration={subnets=[subnet-0b2ee0c3f32851186],securityGroups=[sg-096f63e4a75771c79],assignPublicIp=ENABLED}" --task-definition ic-microservices-authentication-api-task


Step 1: Create a Simple "Hello World" Docker Application
Step 2: Build the Docker Image
Step 3: Push the Docker Image to Amazon Fargate
Step 4: Deploy to Amazon ECS

Reference:
- IC-Repository: https://sagesoftinc-my.sharepoint.com/:f:/g/personal/joseph_era_sagesoftcloud_com/EsDB2Ds4MWdOjLL_qp7BDRMBM7i1MaAuIfzCt8q-_UhJWA?e=MDTxQs
- Forked Repository from Upper: https://github.com/BermudezJimmel/amazon-ecs-workshop-labs/blob/main/Lab1-ECS-Hello-World.md
- Architecture Diagram: https://sagesoftinc-my.sharepoint.com/:u:/g/personal/joseph_era_sagesoftcloud_com/EaJlzDpQxCRAgvzXDLBzS4YBitaePCoF9eYU4YIaAXhnMQ?e=JJk95Z

Files: 
- IAM: s3-microservices-accesskeys
- S3 Bucket: ic-microservices-s3
- Object Store : ic-microservices-s3

SSH Tunnel: 
Oracle: 

Connection sa ELS 
ECTPL Jumpbox


Summary Flow
1. Build Docker image locally or on-prem.
    - docker buildx build --platform linux/amd64,linux/arm64 -t [image-name] .
2. Push the image to AWS ECR.
- aws ecr create-repository --repository-name [your-respository-name]
- aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin 795189341938.dkr.ecr.ap-southeast-1.amazonaws.com
- docker tag <image-name>:<tag> <aws-account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/<repository-name>:<tag>
- docker push <aws-account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/<repository-name>:<tag>
3. Create Cluster > Reflect to AWS COnsole ECS Cluster
4. Create Task Definition > Reflect to AWS Console ECS Task Definition

3. Create and register an ECS task definition.
4. Deploy the task to AWS Fargate.
5. Verify and access the deployed application.