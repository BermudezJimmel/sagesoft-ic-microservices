Amazon **ECS (Elastic Container Service)** is a fully managed container orchestration service that allows you to run, manage, and scale Docker containers on AWS. It supports **Fargate (Serverless)** and **EC2 (self-managed infrastructure)** launch types.

# Deploying to Amazon ECS with FARGATE

Deploying Docker image on FARGATE is serverless means that there is no server will be maintained.

# Create an ECS Cluster
Creating an ECS cluster can be done on AWS Console or via CLI but for this guide we are going to use CLI.

```shell
aws ecs create-cluster --cluster-name [your_cluster_name]
```

You can check your AWS Console if the cluster created or you can run the following command.
```shell
aws ecs list-clusters --region [your-region]
```

# Register a Task Definition
After creating a cluster, you need to create a task definition that will provision and make your application run. Create a file named `task-definition.json` and define your task as follows:

```json
{
  "family": "[name-of-task]",
  "networkMode": "awsvpc",
  "executionRoleArn": "[execution-role-arn]",
  "containerDefinitions": [
    {
      "name": "[container-name]",
      "image": "<aws_account_id>.dkr.ecr.<your-region>.amazonaws.com/docker-image-name:latest",
      "memory": 256,
      "cpu": 256,
      "essential": true,
      "portMappings": [
        {
          "containerPort": [port],
          "hostPort": [port]
        }
      ],
      "logConfiguration": {
             "logDriver": "awslogs",
             "options": {
                 "awslogs-create-group": "true",
                 "awslogs-group": "[log-group-name]",
                 "awslogs-region": "[your-region]",
                 "awslogs-stream-prefix": "[prefix-name]"
             }
      }
    }
  ],
  "requiresCompatibilities": [
    "FARGATE"
  ],
  "cpu": "256",
  "memory": "512"
}
```

# Register Task Definition
After creating the `task-definition.json`, you can now register it on AWS using the command below:
```shell
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

When running this command make sure that you are on the directory where the `task-definition.json` is located.

# Run the task to ECS

You can now deploy the task to ECS using the command below:
```shell
aws ecs run-task --cluster [your-cluster-name] --launch-type FARGATE --network-configuration "awsvpcConfiguration={subnets=[<your-public-subnet-id>],securityGroups=[<your-security-group-id>],assignPublicIp=ENABLED}" --task-defintion [your-task-defintiion]
```

You can access your application using the public ip assigned. you can check it on your AWS console.

# Deploying Application with ECS Service
An **ECS Service** is AWS manages and maintains tasks within an ECS cluster. It ensures that the desired number of tasks are always running and an be integrated with a **Load balancer** for traffic distribution.

# Create the service using the AWS CLI
Using your registered `task-definition.json` you can now provision 'ECS Service' using the following command:
```shell
aws ecs create-service --cluster [cluster-name] \ 
--service-name [service-name] \
--task-definition [task-definition] \
--launch-type FARGATE \
--platform-version 1.4.0 \
--desired-count 1 \
--network-configuration "awsvpcConfiguration={subnets=[<your-public-subnet-id>],securityGroups=[<your-security-groupd-id>],assignedPublicIp=ENABLED}" \
--load-balancers "targetGroupArn=<your-target-group-arn>,containerName=[your-container-name],containerPort=[port]" 
```

If you don't want to attach `load balancer` you can just run the command without the `--load-balancers` flag.

# Attach Load Balancer
A **load balancer** is used to distribute incoming network traffic across multiple servers to ensure no single server becomes overwhelmed.

# Create a Target Group
You can create a `Target Group` on AWS console on `EC2` > `Load Balancing` > `Target Groups` but you can also do this on CLI by running the command below:

For Fargate:
```shell
aws elbv2 create-target-group \
--name [target-group-name] \
--protocol HTTP \
--port [port] \
--vpc-id [your-vpc-id] \
--target-type ip
```

For EC2
```shell
aws elbv2 create-target-group \
--name [target-group-name] \
--protocol HTTP \
--port [port] \
--vpc-id [your-vpc-id] \
--target-type instance
```

# Get the Target Group ARN
you can get the target ARN on AWS console or by running the command below:

```shell
aws elbv2 describe-target-groups --query "TargetGroups[*].TargetGroupArn"
```

# Create a Load Balancer
For better service availability and scalability, you may want to front your ECS service with a load balancer. You can skip this step if you're just experimenting with minimal configurations, but it's recommended for production scenarios.

# Create an Application Load Balancer using the AWS Management Console
- Navigate to EC2 and select Load Balancers.
- Click `Create Load Balancer` and choose `Application Load Balancer`
- Configure with the following:
	- Name: `[load-balancer-name]`
	- Scheme: Internet-facing
	- Listeners: HTTP on port 80
	- Availability zones: Select at least two subnets in different AZs
- Configure security groups to allow HTTP traffic.
- Skip the target groups for now, you will create one while setting up the service


