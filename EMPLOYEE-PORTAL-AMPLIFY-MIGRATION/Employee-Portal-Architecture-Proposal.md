# Employee Portal UI - AWS Amplify Architecture Proposal

## 🎯 **Proposed Architecture**

### **Complete System Flow**
```
Internet → CloudFront (Built-in LB) → S3 (AngularJS) → API Gateway App (ECS) → Internal ALB → Backend Services
           (No ALB Needed)             (Static Files)   (Host Header Routing)   (Host-Based)   (EMP,CORE,AUTH,FILES)
```

---

## 🏗️ **Architecture Components**

### **Frontend Layer - AWS Amplify (No Load Balancer Needed)**
```
┌─────────────────────────────────────────┐
│           AWS Amplify                   │
├─────────────────────────────────────────┤
│ • S3 Bucket (Static AngularJS Hosting) │
│ • CloudFront CDN (Built-in Load Bal.)  │
│ • CI/CD Pipeline (GitLab Integration)  │
│ • Custom Domain & SSL Certificate      │
│ • No ALB Required (CloudFront handles) │
└─────────────────────────────────────────┘
```

### **API Layer - In-House API Gateway (ECS Fargate)**
```
┌─────────────────────────────────────────┐
│        API Gateway Application          │
│         (In-House/On-Prem → ECS)        │
├─────────────────────────────────────────┤
│ • Traffic Routing (Receptionist)        │
│ • Host Header Routing Logic             │
│ • Request/Response Processing           │
│ • Authentication Handling               │
│ • Internal ALB Integration              │
│ • Running on ECS Fargate                │
└─────────────────────────────────────────┘
```

## 🔧 **Internal ALB with Host-Based Routing Solution**

### **Recommended Architecture**
```
API Gateway App → Internal ALB → Backend Services
                     ↓
              Host-Based Routing:
              ├── emp.internal → EMP Service
              ├── core.internal → CORE Service  
              ├── auth.internal → AUTH Service
              └── files.internal → FILES Service
```

### **API Gateway Database (Simplified)**
```sql
-- Single ALB endpoint for all services
service_endpoints table:
├── EMP:   internal-alb-123.elb.amazonaws.com
├── CORE:  internal-alb-123.elb.amazonaws.com  
├── AUTH:  internal-alb-123.elb.amazonaws.com
└── FILES: internal-alb-123.elb.amazonaws.com
```

### **API Gateway App Code Update**
```python
def route_request(service_name, request_data):
    # Get ALB endpoint (same for all services)
    alb_endpoint = get_service_endpoint(service_name)
    
    # Map service to host header
    host_mapping = {
        'EMP': 'emp.internal',
        'CORE': 'core.internal', 
        'AUTH': 'auth.internal',
        'FILES': 'files.internal'
    }
    
    # Make request with Host header for routing
    headers = {
        'Host': host_mapping[service_name],
        'Content-Type': 'application/json'
    }
    
    response = requests.post(
        f"http://{alb_endpoint}/api/data", 
        data=request_data,
        headers=headers
    )
    
    return response
```

### **Internal ALB Configuration**
```yaml
# Internal ALB Setup
Load Balancer: internal-alb-123.elb.amazonaws.com
Scheme: internal
Listeners:
  - Port: 80
    Protocol: HTTP
    
# Host-Based Routing Rules
Rules:
  - Host: emp.internal   → EMP Target Group (Port 3000)
  - Host: core.internal  → CORE Target Group (Port 3001)
  - Host: auth.internal  → AUTH Target Group (Port 3002)
  - Host: files.internal → FILES Target Group (Port 3003)
```

### **Benefits of Internal ALB Approach**
- ✅ **Single endpoint** - One ALB URL for all services
- ✅ **No IP management** - ALB handles backend IPs automatically
- ✅ **Built-in health checks** - Unhealthy tasks removed automatically
- ✅ **Load balancing** - Distributes traffic across multiple tasks
- ✅ **Easy scaling** - Add more tasks to target groups
- ✅ **Simple monitoring** - ALB metrics and logs

### **Alternative Solutions (For Reference)**

#### **Option 1: Service Discovery**
```yaml
# Replace private IPs with service discovery
ECS Service Discovery:
├── EMP.internal:3000
├── CORE.internal:3001
├── AUTH.internal:3002
└── FILES.internal:3003

Benefits:
- Automatic IP updates
- Health check integration
- No manual database updates
```

#### **Option 2: Keep Current + Auto-Update**
```python
# API Gateway App - Auto IP Discovery
import boto3

def update_service_ips():
    ecs = boto3.client('ecs')
    
    # Get current task IPs
    tasks = ecs.list_tasks(cluster='backend-cluster')
    
    # Update database with current IPs
    for task in tasks:
        service_name = task['group'].split(':')[1]
        private_ip = get_task_private_ip(task['taskArn'])
        update_database(service_name, private_ip)

# Run every 5 minutes
```

### **Backend Layer - Microservices**
```
┌─────────────────────────────────────────┐
│         Backend Microservices           │
├─────────────────────────────────────────┤
│ • EMP Service (Employee Management)     │
│ • CORE Service (Core Business Logic)   │
│ • AUTH Service (Authentication)         │
│ • FILES Service (File Management)      │
└─────────────────────────────────────────┘
```

---

## 🔄 **Data Flow Examples**

### **Employee Login Flow**
```
1. Employee → employee-portal.company.com
2. CloudFront → Serves AngularJS application from S3
3. AngularJS → POST /api/auth/login (API Gateway App on ECS Fargate)
4. API Gateway App → Adds Host: auth.internal header
5. Internal ALB → Routes to AUTH service based on host header
6. AUTH Service → Validates credentials, returns JWT token
7. Response → Employee Portal displays dashboard
```

### **Employee Data Retrieval**
```
1. Employee → Clicks "My Profile"
2. AngularJS → GET /api/employee/profile (with JWT token)
3. API Gateway App → Adds Host: emp.internal header
4. Internal ALB → Routes to EMP service based on host header
5. EMP Service → Returns employee profile data
6. Response → Employee Portal displays profile information
```

---

## 💰 **Cost Structure**

### **AWS Amplify Costs**
```
Monthly Estimates:
├── Amplify Hosting: $5-10
├── CloudFront CDN: $5-15 (based on traffic)
├── S3 Storage: $1-3
└── Total Frontend: ~$15-25/month
```

### **Scaling Costs**
```
Traffic Level     | Monthly Cost
─────────────────┼──────────────
Low (1K users)   | $10-15
Medium (10K users)| $20-30
High (50K users)  | $40-60
```

---

## ⚡ **Performance Benefits**

### **Global Performance**
- **CloudFront CDN**: 200+ edge locations worldwide
- **Fast Loading**: Static assets cached globally
- **Auto-scaling**: Handles traffic spikes automatically

### **Reliability**
- **99.9% Uptime**: AWS managed infrastructure
- **Zero Downtime Deployments**: Blue/green deployment strategy
- **Disaster Recovery**: Multi-region redundancy

---

## 🔧 **Technical Implementation**

### **Employee Portal UI (Existing AngularJS)**
```javascript
// Existing AngularJS app configuration update
// API Configuration for microservices
const API_BASE_URL = 'https://api.company.com';

// Authentication Service (update existing)
app.service('AuthService', function($http) {
  this.login = function(credentials) {
    return $http.post(API_BASE_URL + '/auth/login', credentials);
  };
});

// Employee Service (update existing)
app.service('EmployeeService', function($http) {
  this.getProfile = function() {
    return $http.get(API_BASE_URL + '/employee/profile', {
      headers: { 
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });
  };
});
```

### **API Gateway App Configuration (ECS Fargate)**
```yaml
# API Gateway App Routes (Already Migrated to ECS)
/api/auth/*     → AUTH Microservice
/api/employee/* → EMP Microservice  
/api/core/*     → CORE Microservice
/api/files/*    → FILES Microservice

# CORS Configuration (Update for Amplify)
Access-Control-Allow-Origin: https://employee-portal.company.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type

# Load Balancer Configuration
ALB → API Gateway App (ECS Fargate) → Backend Microservices
```

### **Amplify Configuration**
```yaml
# amplify.yml - GitLab Integration
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*

# GitLab Repository Integration
repository:
  source: GitLab
  branch: main
  auto_deploy: true
```

---

## 📋 **Key Clarifications**

### **Why No Load Balancer for Amplify?**
- **CloudFront is built-in load balancer** - handles global traffic distribution
- **S3 + CloudFront = Complete solution** - no additional ALB needed
- **Cost effective** - avoid unnecessary ALB charges (~$20/month)
- **Better performance** - CloudFront edge locations worldwide

### **AngularJS in S3 - How It Works**
```
Build Process:
1. GitLab CI/CD → Builds AngularJS app
2. Generates static files → HTML, JS, CSS, assets
3. Amplify uploads → S3 bucket
4. CloudFront serves → Global distribution

Runtime:
Browser → CloudFront → S3 → Downloads AngularJS → Runs in browser
```

## 🚀 **Implementation Plan**

### **Phase 1: Infrastructure Setup (Week 1)**
- [ ] AWS Amplify project creation
- [ ] GitLab repository connection (existing AngularJS app)
- [ ] Domain and SSL certificate configuration
- [ ] Create Internal ALB with host-based routing rules

### **Phase 2: Application Integration (Week 2-3)**
- [ ] Import existing AngularJS application from GitLab
- [ ] Configure API endpoints for Internal ALB
- [ ] Update API Gateway App with host header routing logic
- [ ] CORS configuration testing with Internal ALB

### **Phase 3: Testing & Deployment (Week 4)**
- [ ] End-to-end functionality testing
- [ ] Performance optimization
- [ ] Security validation
- [ ] Production deployment

---

## 🔒 **Security Features**

### **Frontend Security**
- **HTTPS Only**: SSL/TLS encryption via CloudFront
- **JWT Authentication**: Token-based authentication
- **CORS Protection**: Restricted cross-origin requests

### **API Security**
- **Authentication Middleware**: JWT token validation
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Sanitize all requests

### **Infrastructure Security**
- **AWS IAM**: Role-based access control
- **VPC Integration**: Backend services in private subnets
- **DDoS Protection**: CloudFront built-in protection

---

## 📊 **Monitoring & Analytics**

### **Performance Monitoring**
- **CloudWatch**: Infrastructure metrics
- **Amplify Analytics**: User behavior tracking
- **API Gateway Logs**: Request/response monitoring

### **Business Metrics**
- **User Engagement**: Page views, session duration
- **API Usage**: Endpoint performance, error rates
- **Cost Optimization**: Resource utilization tracking

---

## ✅ **Benefits Summary**

### **For Employees**
- **Fast Loading**: Global CDN performance
- **Always Available**: 99.9% uptime guarantee
- **Mobile Friendly**: Responsive design

### **For IT Operations**
- **No Server Management**: Fully managed infrastructure
- **Automated Deployments**: CI/CD from GitLab
- **Scalable**: Handles growth automatically

### **For Business**
- **Cost Effective**: Pay-per-use pricing
- **Quick Time-to-Market**: Rapid deployment
- **Future Ready**: Modern architecture foundation

---

## 📋 **Next Steps**

1. **Approve Architecture**: Confirm technical approach
2. **Resource Allocation**: Assign development team
3. **Timeline Confirmation**: Finalize project schedule
4. **Environment Setup**: Create AWS accounts and access

---

## 📞 **Project Requirements**

### **Technical Prerequisites**
- AWS account with Amplify access
- Existing GitLab repository (AngularJS Employee Portal)
- Domain name for employee portal
- API Gateway App (already on ECS Fargate) endpoint URL

### **Team Requirements**
- Frontend Developer (AngularJS)
- DevOps Engineer (AWS/Amplify)
- Backend Integration Specialist

---

*This architecture provides a modern, scalable, and cost-effective solution for the Employee Portal UI while seamlessly integrating with existing backend microservices.*
