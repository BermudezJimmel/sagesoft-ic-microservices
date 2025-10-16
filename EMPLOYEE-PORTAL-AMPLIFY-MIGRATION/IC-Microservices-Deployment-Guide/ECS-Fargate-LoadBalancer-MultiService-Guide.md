# ECS Fargate with Load Balancer - Target Group per Container Setup

## Complete Step-by-Step Guide for Multiple Microservices

This guide shows how to deploy multiple microservices (EMP, CORE, AUTH, FILES) on ECS Fargate with individual target groups and host-based routing.

---

## 🏗️ **Architecture Overview**

```
Internet → ALB → Host-Based Routing → Target Groups → ECS Services → Fargate Tasks

ALB Routing Rules:
├── emp.internal → EMP Target Group → EMP Service (Port 3000)
├── core.internal → CORE Target Group → CORE Service (Port 3001)  
├── auth.internal → AUTH Target Group → AUTH Service (Port 3002)
└── files.internal → FILES Target Group → FILES Service (Port 3003)
```

---

## Phase 1: Create Target Groups (One per Service)

### 1.1 Create Target Groups for Each Service
```bash
# Create Target Group for EMP Service
aws elbv2 create-target-group \
  --name emp-service-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-12345678 \
  --target-type ip \
  --health-check-path /health \
  --health-check-interval-seconds 30 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --region ap-southeast-1

# Create Target Group for CORE Service  
aws elbv2 create-target-group \
  --name core-service-tg \
  --protocol HTTP \
  --port 3001 \
  --vpc-id vpc-12345678 \
  --target-type ip \
  --health-check-path /health \
  --health-check-interval-seconds 30 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --region ap-southeast-1

# Create Target Group for AUTH Service
aws elbv2 create-target-group \
  --name auth-service-tg \
  --protocol HTTP \
  --port 3002 \
  --vpc-id vpc-12345678 \
  --target-type ip \
  --health-check-path /health \
  --health-check-interval-seconds 30 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --region ap-southeast-1

# Create Target Group for FILES Service
aws elbv2 create-target-group \
  --name files-service-tg \
  --protocol HTTP \
  --port 3003 \
  --vpc-id vpc-12345678 \
  --target-type ip \
  --health-check-path /health \
  --health-check-interval-seconds 30 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --region ap-southeast-1
```

### 1.2 Get Target Group ARNs
```bash
# Get all Target Group ARNs (save these for later use)
aws elbv2 describe-target-groups --query "TargetGroups[*].[TargetGroupName,TargetGroupArn]" --output table --region ap-southeast-1

# Get individual ARNs
EMP_TG_ARN=$(aws elbv2 describe-target-groups --names emp-service-tg --query 'TargetGroups[0].TargetGroupArn' --output text --region ap-southeast-1)
CORE_TG_ARN=$(aws elbv2 describe-target-groups --names core-service-tg --query 'TargetGroups[0].TargetGroupArn' --output text --region ap-southeast-1)
AUTH_TG_ARN=$(aws elbv2 describe-target-groups --names auth-service-tg --query 'TargetGroups[0].TargetGroupArn' --output text --region ap-southeast-1)
FILES_TG_ARN=$(aws elbv2 describe-target-groups --names files-service-tg --query 'TargetGroups[0].TargetGroupArn' --output text --region ap-southeast-1)

# Verify ARNs are set
echo "EMP TG ARN: $EMP_TG_ARN"
echo "CORE TG ARN: $CORE_TG_ARN"
echo "AUTH TG ARN: $AUTH_TG_ARN"
echo "FILES TG ARN: $FILES_TG_ARN"
```

---

## Phase 2: Create Application Load Balancer

### 2.1 Create ALB
```bash
# Create Application Load Balancer
aws elbv2 create-load-balancer \
  --name microservices-alb \
  --subnets subnet-12345 subnet-67890 \
  --security-groups sg-12345678 \
  --scheme internet-facing \
  --type application \
  --ip-address-type ipv4 \
  --region ap-southeast-1

# Get ALB ARN
ALB_ARN=$(aws elbv2 describe-load-balancers --names microservices-alb --query 'LoadBalancers[0].LoadBalancerArn' --output text --region ap-southeast-1)
echo "ALB ARN: $ALB_ARN"
```

### 2.2 Create Listener with Default Action
```bash
# Create Listener with default 404 response
aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=fixed-response,FixedResponseConfig='{MessageBody="Service not found",StatusCode="404",ContentType="text/plain"}' \
  --region ap-southeast-1

# Get Listener ARN
LISTENER_ARN=$(aws elbv2 describe-listeners --load-balancer-arn $ALB_ARN --query 'Listeners[0].ListenerArn' --output text --region ap-southeast-1)
echo "Listener ARN: $LISTENER_ARN"
```

### 2.3 Add Host-Based Routing Rules
```bash
# Create routing rule for EMP Service
aws elbv2 create-rule \
  --listener-arn $LISTENER_ARN \
  --priority 1 \
  --conditions Field=host-header,Values=emp.internal \
  --actions Type=forward,TargetGroupArn=$EMP_TG_ARN \
  --region ap-southeast-1

# Create routing rule for CORE Service
aws elbv2 create-rule \
  --listener-arn $LISTENER_ARN \
  --priority 2 \
  --conditions Field=host-header,Values=core.internal \
  --actions Type=forward,TargetGroupArn=$CORE_TG_ARN \
  --region ap-southeast-1

# Create routing rule for AUTH Service
aws elbv2 create-rule \
  --listener-arn $LISTENER_ARN \
  --priority 3 \
  --conditions Field=host-header,Values=auth.internal \
  --actions Type=forward,TargetGroupArn=$AUTH_TG_ARN \
  --region ap-southeast-1

# Create routing rule for FILES Service
aws elbv2 create-rule \
  --listener-arn $LISTENER_ARN \
  --priority 4 \
  --conditions Field=host-header,Values=files.internal \
  --actions Type=forward,TargetGroupArn=$FILES_TG_ARN \
  --region ap-southeast-1
```

---

## Phase 3: Create ECS Cluster

### 3.1 Create ECS Cluster
```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name microservices-cluster --region ap-southeast-1
```

### 3.2 Verify Cluster Creation
```bash
# Check cluster status
aws ecs list-clusters --region ap-southeast-1
aws ecs describe-clusters --clusters microservices-cluster --region ap-southeast-1
```

---

## Phase 4: Create Task Definitions (One per Service)

### 4.1 Create EMP Service Task Definition
Create file: `emp-task-definition.json`
```json
{
  "family": "emp-service-task",
  "networkMode": "awsvpc",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "emp-service-container",
      "image": "123456789012.dkr.ecr.ap-southeast-1.amazonaws.com/emp-service:latest",
      "memory": 512,
      "cpu": 256,
      "essential": true,
      "portMappings": [
        {
          "containerPort": 3000,
          "hostPort": 3000,
          "protocol": "tcp"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-create-group": "true",
          "awslogs-group": "/ecs/emp-service",
          "awslogs-region": "ap-southeast-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3000"
        }
      ]
    }
  ],
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512"
}
```

### 4.2 Create CORE Service Task Definition
Create file: `core-task-definition.json`
```json
{
  "family": "core-service-task",
  "networkMode": "awsvpc",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "core-service-container",
      "image": "123456789012.dkr.ecr.ap-southeast-1.amazonaws.com/core-service:latest",
      "memory": 512,
      "cpu": 256,
      "essential": true,
      "portMappings": [
        {
          "containerPort": 3001,
          "hostPort": 3001,
          "protocol": "tcp"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-create-group": "true",
          "awslogs-group": "/ecs/core-service",
          "awslogs-region": "ap-southeast-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3001"
        }
      ]
    }
  ],
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512"
}
```

### 4.3 Create AUTH Service Task Definition
Create file: `auth-task-definition.json`
```json
{
  "family": "auth-service-task",
  "networkMode": "awsvpc",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "auth-service-container",
      "image": "123456789012.dkr.ecr.ap-southeast-1.amazonaws.com/auth-service:latest",
      "memory": 512,
      "cpu": 256,
      "essential": true,
      "portMappings": [
        {
          "containerPort": 3002,
          "hostPort": 3002,
          "protocol": "tcp"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-create-group": "true",
          "awslogs-group": "/ecs/auth-service",
          "awslogs-region": "ap-southeast-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3002"
        }
      ]
    }
  ],
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512"
}
```

### 4.4 Create FILES Service Task Definition
Create file: `files-task-definition.json`
```json
{
  "family": "files-service-task",
  "networkMode": "awsvpc",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "files-service-container",
      "image": "123456789012.dkr.ecr.ap-southeast-1.amazonaws.com/files-service:latest",
      "memory": 512,
      "cpu": 256,
      "essential": true,
      "portMappings": [
        {
          "containerPort": 3003,
          "hostPort": 3003,
          "protocol": "tcp"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-create-group": "true",
          "awslogs-group": "/ecs/files-service",
          "awslogs-region": "ap-southeast-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3003"
        }
      ]
    }
  ],
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512"
}
```

### 4.5 Register All Task Definitions
```bash
# Register all task definitions
aws ecs register-task-definition --cli-input-json file://emp-task-definition.json --region ap-southeast-1
aws ecs register-task-definition --cli-input-json file://core-task-definition.json --region ap-southeast-1
aws ecs register-task-definition --cli-input-json file://auth-task-definition.json --region ap-southeast-1
aws ecs register-task-definition --cli-input-json file://files-task-definition.json --region ap-southeast-1

# Verify task definitions are registered
aws ecs list-task-definitions --region ap-southeast-1
```

---

## Phase 5: Create ECS Services (One per Target Group)

### 5.1 Create EMP Service
```bash
aws ecs create-service \
  --cluster microservices-cluster \
  --service-name emp-service \
  --task-definition emp-service-task \
  --launch-type FARGATE \
  --platform-version 1.4.0 \
  --desired-count 2 \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345,subnet-67890],securityGroups=[sg-12345678],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=$EMP_TG_ARN,containerName=emp-service-container,containerPort=3000" \
  --region ap-southeast-1
```

### 5.2 Create CORE Service
```bash
aws ecs create-service \
  --cluster microservices-cluster \
  --service-name core-service \
  --task-definition core-service-task \
  --launch-type FARGATE \
  --platform-version 1.4.0 \
  --desired-count 2 \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345,subnet-67890],securityGroups=[sg-12345678],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=$CORE_TG_ARN,containerName=core-service-container,containerPort=3001" \
  --region ap-southeast-1
```

### 5.3 Create AUTH Service
```bash
aws ecs create-service \
  --cluster microservices-cluster \
  --service-name auth-service \
  --task-definition auth-service-task \
  --launch-type FARGATE \
  --platform-version 1.4.0 \
  --desired-count 2 \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345,subnet-67890],securityGroups=[sg-12345678],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=$AUTH_TG_ARN,containerName=auth-service-container,containerPort=3002" \
  --region ap-southeast-1
```

### 5.4 Create FILES Service
```bash
aws ecs create-service \
  --cluster microservices-cluster \
  --service-name files-service \
  --task-definition files-service-task \
  --launch-type FARGATE \
  --platform-version 1.4.0 \
  --desired-count 2 \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345,subnet-67890],securityGroups=[sg-12345678],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=$FILES_TG_ARN,containerName=files-service-container,containerPort=3003" \
  --region ap-southeast-1
```

---

## Phase 6: Verify Deployment

### 6.1 Check Service Status
```bash
# Check all services status
aws ecs describe-services --cluster microservices-cluster --services emp-service core-service auth-service files-service --region ap-southeast-1

# Check running tasks
aws ecs list-tasks --cluster microservices-cluster --region ap-southeast-1

# Check specific service details
aws ecs describe-services --cluster microservices-cluster --services emp-service --query 'services[0].{ServiceName:serviceName,Status:status,RunningCount:runningCount,DesiredCount:desiredCount}' --region ap-southeast-1
```

### 6.2 Check Target Group Health
```bash
# Check target health for each service
echo "Checking EMP Service targets:"
aws elbv2 describe-target-health --target-group-arn $EMP_TG_ARN --region ap-southeast-1

echo "Checking CORE Service targets:"
aws elbv2 describe-target-health --target-group-arn $CORE_TG_ARN --region ap-southeast-1

echo "Checking AUTH Service targets:"
aws elbv2 describe-target-health --target-group-arn $AUTH_TG_ARN --region ap-southeast-1

echo "Checking FILES Service targets:"
aws elbv2 describe-target-health --target-group-arn $FILES_TG_ARN --region ap-southeast-1
```

### 6.3 Get Load Balancer DNS
```bash
# Get ALB DNS name
ALB_DNS=$(aws elbv2 describe-load-balancers --names microservices-alb --query "LoadBalancers[0].DNSName" --output text --region ap-southeast-1)
echo "Load Balancer DNS: $ALB_DNS"
```

---

## Phase 7: Test the Setup

### 7.1 Test Each Service Health Endpoint
```bash
# Test EMP Service
echo "Testing EMP Service:"
curl -H "Host: emp.internal" http://$ALB_DNS/health

# Test CORE Service  
echo "Testing CORE Service:"
curl -H "Host: core.internal" http://$ALB_DNS/health

# Test AUTH Service
echo "Testing AUTH Service:"
curl -H "Host: auth.internal" http://$ALB_DNS/health

# Test FILES Service
echo "Testing FILES Service:"
curl -H "Host: files.internal" http://$ALB_DNS/health
```

### 7.2 Test API Endpoints (if available)
```bash
# Test EMP API endpoints
curl -H "Host: emp.internal" http://$ALB_DNS/api/employees

# Test CORE API endpoints
curl -H "Host: core.internal" http://$ALB_DNS/api/settings

# Test AUTH API endpoints
curl -H "Host: auth.internal" -X POST -H "Content-Type: application/json" -d '{"username":"test","password":"test"}' http://$ALB_DNS/api/login

# Test FILES API endpoints
curl -H "Host: files.internal" http://$ALB_DNS/api/files
```

---

## Phase 8: Monitoring and Troubleshooting

### 8.1 Check CloudWatch Logs
```bash
# View logs for each service
aws logs describe-log-groups --log-group-name-prefix "/ecs/" --region ap-southeast-1

# Stream logs for EMP service
aws logs tail /ecs/emp-service --follow --region ap-southeast-1

# Stream logs for CORE service
aws logs tail /ecs/core-service --follow --region ap-southeast-1
```

### 8.2 Monitor Service Metrics
```bash
# Check service events for issues
aws ecs describe-services --cluster microservices-cluster --services emp-service --query 'services[0].events[0:5]' --region ap-southeast-1

# Check task status
aws ecs describe-tasks --cluster microservices-cluster --tasks $(aws ecs list-tasks --cluster microservices-cluster --service-name emp-service --query 'taskArns[0]' --output text --region ap-southeast-1) --region ap-southeast-1
```

---

## Phase 9: Scaling and Updates

### 9.1 Scale Services
```bash
# Scale EMP service to 3 tasks
aws ecs update-service --cluster microservices-cluster --service emp-service --desired-count 3 --region ap-southeast-1

# Scale all services
aws ecs update-service --cluster microservices-cluster --service emp-service --desired-count 3 --region ap-southeast-1
aws ecs update-service --cluster microservices-cluster --service core-service --desired-count 3 --region ap-southeast-1
aws ecs update-service --cluster microservices-cluster --service auth-service --desired-count 3 --region ap-southeast-1
aws ecs update-service --cluster microservices-cluster --service files-service --desired-count 3 --region ap-southeast-1
```

### 9.2 Update Service with New Image
```bash
# Update task definition with new image and register
# Then update service to use new task definition
aws ecs update-service --cluster microservices-cluster --service emp-service --task-definition emp-service-task:2 --region ap-southeast-1
```

---

## 🔧 **Prerequisites Checklist**

Before running these commands, ensure you have:

- [ ] **AWS CLI configured** with proper credentials and region
- [ ] **VPC ID** (replace `vpc-12345678`)
- [ ] **Subnet IDs** (replace `subnet-12345` and `subnet-67890`)
- [ ] **Security Group ID** (replace `sg-12345678`)
- [ ] **ECR repositories** created for each service
- [ ] **Docker images** pushed to ECR
- [ ] **ECS Task Execution Role** created (`ecsTaskExecutionRole`)
- [ ] **Proper IAM permissions** for ECS, ALB, and CloudWatch

---

## 🚨 **Important Notes**

1. **Replace Placeholder Values**:
   - `vpc-12345678` → Your actual VPC ID
   - `subnet-12345`, `subnet-67890` → Your actual subnet IDs
   - `sg-12345678` → Your actual security group ID
   - `123456789012` → Your actual AWS account ID

2. **Security Group Requirements**:
   - Allow inbound traffic on ports 3000-3003 from ALB security group
   - Allow outbound traffic to internet for ECR image pulls

3. **Health Check Endpoints**:
   - Each service must have a `/health` endpoint
   - Health checks must return HTTP 200 status

4. **Service Dependencies**:
   - Create target groups BEFORE creating services
   - Ensure ECR images exist before registering task definitions

---

## 📊 **Architecture Summary**

```
Components Created:
├── 4 Target Groups (one per service)
├── 1 Application Load Balancer
├── 4 Host-based routing rules
├── 1 ECS Cluster
├── 4 Task Definitions
└── 4 ECS Services (2 tasks each = 8 total tasks)

Traffic Flow:
Internet → ALB → Host Header Check → Target Group → ECS Service → Fargate Task
```

**Result**: Each microservice runs independently with its own target group, allowing for individual scaling, monitoring, and deployment while sharing a single load balancer for cost efficiency.
