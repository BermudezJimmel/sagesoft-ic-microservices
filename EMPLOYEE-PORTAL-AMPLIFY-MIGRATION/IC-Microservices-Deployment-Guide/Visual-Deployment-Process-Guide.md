# Visual Deployment Process Guide: On-Premises to ECR → ECS Fargate

## 🎯 **Complete Deployment Flow Overview**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  On-Premises    │───▶│  Docker Build   │───▶│  Amazon ECR     │───▶│  ECS Fargate    │───▶│ Application     │
│  Application    │    │  & Tag Process  │    │  Repository     │    │  Deployment     │    │ Load Balancer   │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 📋 **Step-by-Step Visual Process**

### **Phase 1: Environment Setup & Authentication**

| Step | Service | Action | Command/Process | Visual Status |
|------|---------|--------|-----------------|---------------|
| 1.1 | **AWS CLI** | Configure Authentication | `aws configure` | 🔧 **Setup** |
| 1.2 | **AWS CLI** | Verify Connection | `aws sts get-caller-identity` | ✅ **Verified** |

```
┌─────────────────────────────────────────────────────────────────┐
│                     AWS CLI Configuration                       │
├─────────────────────────────────────────────────────────────────┤
│  Input Required:                                                │
│  • Access Key ID: ****************N7WD                         │
│  • Secret Access Key: ****************hHrp                     │
│  • Default region: ap-southeast-1                              │
│  • Output format: json                                         │
├─────────────────────────────────────────────────────────────────┤
│  Verification Output:                                           │
│  {                                                              │
│    "UserId": "...CX",                                          │
│    "Account": "795189341938",                                  │
│    "Arn": "arn:aws:iam::795189341938:user/IC-Jericho"        │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

### **Phase 2: Container Registry Setup**

| Step | Service | Action | Command/Process | Visual Status |
|------|---------|--------|-----------------|---------------|
| 2.1 | **Amazon ECR** | Create Repository | `aws ecr create-repository --repository-name [repo-name]` | 🏗️ **Creating** |
| 2.2 | **Amazon ECR** | Authenticate Docker | `aws ecr get-login-password` | 🔐 **Authenticating** |
| 2.3 | **Docker** | Login to ECR | `docker login --username AWS` | ✅ **Login Succeed** |

```
┌─────────────────────────────────────────────────────────────────┐
│                    Amazon ECR Repository                        │
├─────────────────────────────────────────────────────────────────┤
│  Repository Creation:                                           │
│  ┌─────────────────┐    ┌─────────────────┐                   │
│  │ AWS CLI Command │───▶│ ECR Repository  │                   │
│  │ create-repo     │    │ Created         │                   │
│  └─────────────────┘    └─────────────────┘                   │
│                                                                 │
│  Authentication Flow:                                           │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │ Get Login Token │───▶│ Docker Login    │───▶│ Authenticated│ │
│  │ from ECR        │    │ to ECR Registry │    │ Successfully │ │
│  └─────────────────┘    └─────────────────┘    └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

### **Phase 3: Docker Image Build & Push Process**

| Step | Service | Action | Command/Process | Visual Status |
|------|---------|--------|-----------------|---------------|
| 3.1 | **Docker** | Build Local Image | `docker build -t [image-name]:latest .` | 🔨 **Building** |
| 3.2 | **Docker** | Tag for ECR | `docker tag [local-image] [ecr-uri]:latest` | 🏷️ **Tagging** |
| 3.3 | **Docker** | Push to ECR | `docker push [ecr-uri]:latest` | ⬆️ **Pushing** |
| 3.4 | **Amazon ECR** | Verify Upload | `aws ecr list-images --repository-name [repo]` | ✅ **Verified** |

```
┌─────────────────────────────────────────────────────────────────┐
│                Docker Image Build & Push Flow                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │ On-Premises App │───▶│ Docker Build    │───▶│ Local Image │ │
│  │ Source Code     │    │ Process         │    │ Created     │ │
│  └─────────────────┘    └─────────────────┘    └─────────────┘ │
│                                │                               │
│                                ▼                               │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │ ECR Repository  │◀───│ Docker Push     │◀───│ Image Tagged│ │
│  │ Image Stored    │    │ Process         │    │ for ECR     │ │
│  └─────────────────┘    └─────────────────┘    └─────────────┘ │
│                                                                 │
│  Image URI Format:                                              │
│  [aws-account-id].dkr.ecr.[region].amazonaws.com/[repo]:latest │
└─────────────────────────────────────────────────────────────────┘
```

---

### **Phase 4: ECS Infrastructure Setup**

| Step | Service | Action | Command/Process | Visual Status |
|------|---------|--------|-----------------|---------------|
| 4.1 | **Amazon ECS** | Create Cluster | `aws ecs create-cluster --cluster-name [name]` | 🏗️ **Creating** |
| 4.2 | **Amazon ECS** | Verify Cluster | `aws ecs list-clusters --region [region]` | ✅ **Active** |

```
┌─────────────────────────────────────────────────────────────────┐
│                    ECS Cluster Creation                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐                   │
│  │ AWS CLI Command │───▶│ ECS Cluster     │                   │
│  │ create-cluster  │    │ [cluster-name]  │                   │
│  └─────────────────┘    └─────────────────┘                   │
│                                │                               │
│                                ▼                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              ECS Cluster Components                     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │   │
│  │  │   Fargate   │  │   Tasks     │  │  Services   │    │   │
│  │  │  Capacity   │  │ Definitions │  │   (Future)  │    │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

### **Phase 5: Task Definition Creation & Registration**

| Step | Service | Action | Command/Process | Visual Status |
|------|---------|--------|-----------------|---------------|
| 5.1 | **Local** | Create Task Definition | Create `task-definition.json` | 📝 **Creating** |
| 5.2 | **Amazon ECS** | Register Task Definition | `aws ecs register-task-definition --cli-input-json file://task-definition.json` | 📋 **Registered** |

```
┌─────────────────────────────────────────────────────────────────┐
│                   Task Definition Structure                     │
├─────────────────────────────────────────────────────────────────┤
│  task-definition.json:                                          │
│  {                                                              │
│    "family": "[task-name]",                                    │
│    "networkMode": "awsvpc",                                    │
│    "executionRoleArn": "[execution-role-arn]",                │
│    "containerDefinitions": [                                   │
│      {                                                         │
│        "name": "[container-name]",                            │
│        "image": "[ecr-image-uri]:latest",                     │
│        "memory": 256,                                         │
│        "cpu": 256,                                            │
│        "essential": true,                                     │
│        "portMappings": [                                      │
│          {                                                    │
│            "containerPort": [port],                           │
│            "hostPort": [port]                                 │
│          }                                                    │
│        ],                                                     │
│        "logConfiguration": {                                  │
│          "logDriver": "awslogs",                             │
│          "options": {                                        │
│            "awslogs-create-group": "true",                   │
│            "awslogs-group": "[log-group-name]",              │
│            "awslogs-region": "[region]",                     │
│            "awslogs-stream-prefix": "[prefix]"               │
│          }                                                   │
│        }                                                     │
│      }                                                       │
│    ],                                                        │
│    "requiresCompatibilities": ["FARGATE"],                   │
│    "cpu": "256",                                             │
│    "memory": "512"                                           │
│  }                                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

### **Phase 6: Load Balancer Setup (Optional but Recommended)**

| Step | Service | Action | Command/Process | Visual Status |
|------|---------|--------|-----------------|---------------|
| 6.1 | **Elastic Load Balancing** | Create Target Group | `aws elbv2 create-target-group` | 🎯 **Creating** |
| 6.2 | **Elastic Load Balancing** | Create Application Load Balancer | AWS Console or CLI | ⚖️ **Creating** |
| 6.3 | **Elastic Load Balancing** | Get Target Group ARN | `aws elbv2 describe-target-groups` | 📋 **Retrieved** |

```
┌─────────────────────────────────────────────────────────────────┐
│                Load Balancer Architecture                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │    Internet     │───▶│ Application     │───▶│ Target Group│ │
│  │    Traffic      │    │ Load Balancer   │    │ (IP Type)   │ │
│  └─────────────────┘    └─────────────────┘    └─────────────┘ │
│                                │                       │       │
│                                ▼                       ▼       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Target Group Configuration             │   │
│  │  • Name: [target-group-name]                       │   │
│  │  • Protocol: HTTP                                  │   │
│  │  • Port: [application-port]                        │   │
│  │  • VPC: [your-vpc-id]                             │   │
│  │  • Target Type: ip (for Fargate)                  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

### **Phase 7: ECS Service Deployment**

| Step | Service | Action | Command/Process | Visual Status |
|------|---------|--------|-----------------|---------------|
| 7.1 | **Amazon ECS** | Create ECS Service | `aws ecs create-service` with load balancer | 🚀 **Deploying** |
| 7.2 | **Amazon ECS** | Verify Service Status | Check AWS Console or CLI | ✅ **Running** |
| 7.3 | **Application** | Access via Load Balancer | Use ALB DNS name | 🌐 **Live** |

```
┌─────────────────────────────────────────────────────────────────┐
│                    ECS Service Deployment                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ECS Service Creation Command:                                  │
│  aws ecs create-service \                                       │
│    --cluster [cluster-name] \                                   │
│    --service-name [service-name] \                              │
│    --task-definition [task-definition] \                        │
│    --launch-type FARGATE \                                      │
│    --platform-version 1.4.0 \                                  │
│    --desired-count 1 \                                          │
│    --network-configuration "awsvpcConfiguration={              │
│      subnets=[subnet-id],                                       │
│      securityGroups=[sg-id],                                    │
│      assignPublicIp=ENABLED                                     │
│    }" \                                                         │
│    --load-balancers "targetGroupArn=[tg-arn],                  │
│      containerName=[container-name],                            │
│      containerPort=[port]"                                      │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │ ECS Service     │───▶│ Fargate Tasks   │───▶│ Running App │ │
│  │ Created         │    │ Started         │    │ Accessible  │ │
│  └─────────────────┘    └─────────────────┘    └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 **Complete Architecture Flow**

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              Production Architecture                                     │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐            │
│  │   Internet  │───▶│     ALB     │───▶│ Target Group│───▶│ ECS Service │            │
│  │   Traffic   │    │ (Port 80)   │    │ (IP Type)   │    │ (Fargate)   │            │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘            │
│                                                                    │                   │
│                                                                    ▼                   │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│  │                           ECS Fargate Tasks                                     │  │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                        │  │
│  │  │   Task 1    │    │   Task 2    │    │   Task N    │                        │  │
│  │  │ Container:  │    │ Container:  │    │ Container:  │                        │  │
│  │  │ [app-name]  │    │ [app-name]  │    │ [app-name]  │                        │  │
│  │  │ Port: [port]│    │ Port: [port]│    │ Port: [port]│                        │  │
│  │  └─────────────┘    └─────────────┘    └─────────────┘                        │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
│                                     │                                                  │
│                                     ▼                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│  │                          CloudWatch Logs                                       │  │
│  │  • Log Group: /ecs/[app-name]                                                  │  │
│  │  • Log Stream: ecs/[container-name]/[task-id]                                  │  │
│  │  • Real-time application logs and monitoring                                   │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 **Services & Resources Summary**

| **AWS Service** | **Purpose** | **Configuration** | **Status** |
|-----------------|-------------|-------------------|------------|
| **AWS CLI** | Authentication & Management | Access Keys, Region: ap-southeast-1 | ✅ **Configured** |
| **Amazon ECR** | Container Image Registry | Repository for Docker images | ✅ **Active** |
| **Amazon ECS** | Container Orchestration | Fargate cluster with services | ✅ **Running** |
| **Elastic Load Balancing** | Traffic Distribution | Application Load Balancer + Target Groups | ✅ **Distributing** |
| **CloudWatch Logs** | Application Monitoring | Centralized logging for containers | ✅ **Monitoring** |
| **VPC & Security Groups** | Network Security | Subnet isolation and traffic control | ✅ **Secured** |

---

## 🎯 **Key Success Indicators**

### ✅ **Deployment Verification Checklist**
- [ ] ECR repository contains the latest image
- [ ] ECS cluster is active and healthy
- [ ] Task definition is registered successfully
- [ ] ECS service is running with desired task count
- [ ] Load balancer health checks are passing
- [ ] Application is accessible via ALB DNS name
- [ ] CloudWatch logs are capturing application output
- [ ] Security groups allow proper traffic flow

### 📈 **Monitoring & Maintenance**
- **Health Checks**: Target group health status
- **Scaling**: ECS service auto-scaling based on metrics
- **Logs**: CloudWatch logs for troubleshooting
- **Updates**: New image deployments via ECR push
- **Security**: Regular security group and IAM review

---

## 🔧 **Troubleshooting Quick Reference**

| **Issue** | **Possible Cause** | **Solution** |
|-----------|-------------------|--------------|
| Task fails to start | Insufficient resources or image pull errors | Check task definition CPU/memory, verify ECR permissions |
| Health checks failing | Application not responding on health check path | Verify application health endpoint, check security groups |
| Cannot access application | Load balancer or security group misconfiguration | Check ALB listener rules, verify security group inbound rules |
| Image push fails | ECR authentication or permissions | Re-authenticate with ECR, check IAM permissions |

---

*This visual guide provides a complete overview of the On-Premises to ECR → ECS Fargate deployment process, including all AWS services, configurations, and verification steps.*
