# Employee Portal UI - AWS Amplify Architecture Proposal (FINAL)

## 🎯 **Final Proposed Architecture**

### **Complete System Flow with Public ALB**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Internet     │───▶│   CloudFront    │───▶│   Public ALB    │───▶│  Internal ALB   │───▶│ Backend Services│
│   (Employees)   │    │   (Built-in LB) │    │ (API Gateway)   │    │ (Host Routing)  │    │(EMP,CORE,AUTH,  │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘    │    FILES)       │
                                │                       │                       │             └─────────────────┘
                                ▼                       ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
                       │   S3 Bucket     │    │ API Gateway App │    │ Target Groups   │
                       │ (AngularJS App) │    │   (ECS Fargate) │    │ • EMP:3000      │
                       └─────────────────┘    └─────────────────┘    │ • CORE:3001     │
                                                                     │ • AUTH:3002     │
                                                                     │ • FILES:3003    │
                                                                     └─────────────────┘
```

### **DNS-Based Request Flow**
```
┌─────────────────┐
│ 1. Employee     │
│ Opens Browser   │
│ employee-portal │
│ .company.com    │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ 2. CloudFront   │
│ Serves AngularJS│
│ from S3         │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ 3. AngularJS    │
│ Makes API Call  │
│ api.company.com │
│ /auth/login     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ 4. Public ALB   │
│ Routes to API   │
│ Gateway App     │
│ (ECS Fargate)   │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ 5. API Gateway  │
│ App Adds Host   │
│ Header: auth.   │
│ internal        │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ 6. Internal ALB │
│ Routes based on │
│ Host Header to  │
│ AUTH Service    │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ 7. AUTH Service │
│ Processes Login │
│ Returns JWT     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ 8. Response     │
│ Back to Employee│
│ Portal UI       │
└─────────────────┘
```

---

## 🏗️ **Architecture Components**

### **Frontend Layer - AWS Amplify**
```
┌─────────────────────────────────────────────────────────────────┐
│                        AWS Amplify                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐  │
│  │   S3 Bucket     │    │   CloudFront    │    │   CI/CD     │  │
│  │ (AngularJS App) │◀──▶│ (Built-in LB)   │◀──▶│ (GitLab)    │  │
│  │ Static Hosting  │    │ Global CDN      │    │ Pipeline    │  │
│  └─────────────────┘    └─────────────────┘    └─────────────┘  │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │ Custom Domain   │    │ SSL Certificate │                    │
│  │ employee-portal │    │ HTTPS Security  │                    │
│  │ .company.com    │    │                 │                    │
│  └─────────────────┘    └─────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

### **API Layer - Public ALB + API Gateway (ECS Fargate)**
```
┌─────────────────────────────────────────────────────────────────┐
│                      Public ALB + API Gateway                   │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐  │
│  │   Public ALB    │    │ API Gateway App │    │ Health      │  │
│  │ api.company.com │◀──▶│   (ECS Fargate) │◀──▶│ Checks      │  │
│  │ SSL Termination │    │ Traffic Routing │    │ /health     │  │
│  └─────────────────┘    └─────────────────┘    └─────────────┘  │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐  │
│  │ Load Balancing  │    │ Host Header     │    │ CORS        │  │
│  │ Multiple Tasks  │    │ Logic           │    │ Configuration│  │
│  │                 │    │ emp.internal    │    │             │  │
│  └─────────────────┘    │ core.internal   │    └─────────────┘  │
│                         │ auth.internal   │                     │
│                         │ files.internal  │                     │
│                         └─────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
```

### **Backend Layer - Internal ALB + Microservices**
```
┌─────────────────────────────────────────────────────────────────┐
│                Internal ALB + Backend Services                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                Internal ALB Configuration                   │ │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ │ │
│  │ │emp.internal │ │core.internal│ │auth.internal│ │files.   │ │ │
│  │ │→ EMP:3000   │ │→ CORE:3001  │ │→ AUTH:3002  │ │internal │ │ │
│  │ └─────────────┘ └─────────────┘ └─────────────┘ │→FILES:  │ │ │
│  └─────────────────────────────────────────────────│ 3003    │─┘ │
│                                                    └─────────┘   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │ EMP Service │  │CORE Service │  │AUTH Service │  │  FILES  │ │
│  │ Employee    │  │ Core        │  │ Authentication│  │ Service │ │
│  │ Management  │  │ Business    │  │ & Security    │  │ File    │ │
│  │ Port: 3000  │  │ Logic       │  │ Port: 3002    │  │ Mgmt    │ │
│  │             │  │ Port: 3001  │  │               │  │ Port:   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  │ 3003    │ │
│                                                      └─────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🌐 **DNS Configuration**

### **Domain Setup**
```yaml
# Frontend Domain
employee-portal.company.com → CloudFront Distribution

# API Domain  
api.company.com → Public ALB (api-gateway-alb-456.elb.amazonaws.com)

# Route 53 Configuration
Records:
├── employee-portal.company.com (ALIAS) → CloudFront
└── api.company.com (ALIAS) → Public ALB
```

### **SSL Certificates**
```yaml
# Wildcard Certificate
Certificate: *.company.com
Validation: DNS validation via Route 53
Usage:
├── CloudFront (employee-portal.company.com)
└── Public ALB (api.company.com)
```

---

## 🔧 **Load Balancer Configuration**

### **Public ALB (API Gateway)**
```yaml
Name: api-gateway-alb
Scheme: internet-facing
DNS: api-gateway-alb-456.elb.amazonaws.com
Custom Domain: api.company.com

Listeners:
  - Port: 443 (HTTPS)
    Protocol: HTTPS
    SSL Certificate: *.company.com
    
Target Groups:
  - Name: api-gateway-targets
    Protocol: HTTP
    Port: 80
    Health Check: /health
    Targets: API Gateway App (ECS Fargate)

Security Groups:
  - Inbound: 443 from 0.0.0.0/0
  - Outbound: 80 to API Gateway App
```

### **Internal ALB (Backend Services)**
```yaml
Name: backend-services-alb  
Scheme: internal
DNS: internal-alb-123.elb.amazonaws.com

Host-Based Routing Rules:
├── emp.internal → EMP Target Group (Port 3000)
├── core.internal → CORE Target Group (Port 3001)  
├── auth.internal → AUTH Target Group (Port 3002)
└── files.internal → FILES Target Group (Port 3003)

Security Groups:
  - Inbound: 80 from API Gateway App
  - Outbound: 3000-3003 to Backend Services
```

---

## 💻 **Technical Implementation**

### **AngularJS Configuration (Clean DNS)**
```javascript
// Clean API configuration with DNS
const API_BASE_URL = 'https://api.company.com';

// Authentication Service
app.service('AuthService', function($http) {
  this.login = function(credentials) {
    return $http.post(API_BASE_URL + '/auth/login', credentials);
  };
  
  this.logout = function() {
    return $http.post(API_BASE_URL + '/auth/logout');
  };
});

// Employee Service
app.service('EmployeeService', function($http) {
  this.getProfile = function() {
    return $http.get(API_BASE_URL + '/employee/profile', {
      headers: { 
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });
  };
  
  this.updateProfile = function(data) {
    return $http.put(API_BASE_URL + '/employee/profile', data, {
      headers: { 
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });
  };
});
```

### **API Gateway App Configuration**
```python
# API Gateway App - Host Header Routing
def route_request(service_name, request_data):
    # Internal ALB endpoint (same for all services)
    internal_alb_endpoint = "internal-alb-123.elb.amazonaws.com"
    
    # Service to host header mapping
    host_mapping = {
        'EMP': 'emp.internal',
        'CORE': 'core.internal', 
        'AUTH': 'auth.internal',
        'FILES': 'files.internal'
    }
    
    # Make request with Host header for routing
    headers = {
        'Host': host_mapping[service_name],
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization')
    }
    
    response = requests.post(
        f"http://{internal_alb_endpoint}/api/data", 
        data=request_data,
        headers=headers
    )
    
    return response

# CORS Configuration for Amplify
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'https://employee-portal.company.com')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Health Check Endpoint for ALB
@app.route('/health')
def health_check():
    return {'status': 'healthy', 'timestamp': datetime.now().isoformat()}
```

### **Amplify Configuration**
```yaml
# amplify.yml - Build Configuration
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
        - echo "API_BASE_URL=https://api.company.com" > dist/config.js
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*

# Custom Domain Configuration
customDomain:
  domainName: employee-portal.company.com
  certificateArn: arn:aws:acm:us-east-1:123456789:certificate/abc123
```

---

## 💰 **Final Cost Structure**

### **Monthly Cost Breakdown**
```
AWS Amplify (Frontend):
├── Amplify Hosting: $5-10
├── CloudFront CDN: $5-15
├── S3 Storage: $1-3
└── Subtotal: $11-28/month

Load Balancers:
├── Public ALB (API Gateway): $20/month
├── Internal ALB (Backend): $20/month  
└── Subtotal: $40/month

Total Monthly Cost: $51-68/month

Previous Cost (All ECS Fargate): ~$100/month
Monthly Savings: $32-49 (32-49% reduction)
```

### **Scaling Cost Projections**
```
Traffic Level      | Frontend | ALBs | Total
──────────────────┼──────────┼──────┼──────
Low (1K users)    | $15      | $40  | $55
Medium (10K users)| $25      | $40  | $65  
High (50K users)  | $40      | $40  | $80
```

---

## ⚡ **Performance & Reliability Benefits**

### **Frontend Performance**
- **Global CDN**: CloudFront 200+ edge locations
- **Fast Loading**: Static assets cached globally  
- **Auto-scaling**: Handles traffic spikes automatically
- **Zero Downtime**: Blue/green deployments

### **API Performance**
- **DNS-based**: Clean api.company.com endpoint
- **Load Balancing**: Multiple API Gateway instances
- **Health Checks**: Automatic failover
- **SSL Termination**: HTTPS at ALB level

### **Backend Reliability**
- **Host-based Routing**: Efficient service discovery
- **Internal Load Balancing**: Distribute backend load
- **Health Monitoring**: Unhealthy services removed
- **Auto-scaling**: ECS service scaling

---

## 🔒 **Security Features**

### **Network Security**
```yaml
Security Groups:
├── CloudFront → Public ALB: 443 only
├── Public ALB → API Gateway: 80 only  
├── API Gateway → Internal ALB: 80 only
└── Internal ALB → Backend: 3000-3003 only

VPC Configuration:
├── Public Subnets: Public ALB only
├── Private Subnets: API Gateway App
└── Private Subnets: Backend Services
```

### **Application Security**
- **JWT Authentication**: Token-based auth
- **CORS Protection**: Restricted origins
- **HTTPS Only**: End-to-end encryption
- **Input Validation**: API Gateway sanitization

### **Infrastructure Security**
- **AWS IAM**: Role-based access control
- **VPC Isolation**: Private backend networks
- **DDoS Protection**: CloudFront + ALB protection
- **SSL/TLS**: Managed certificates

---

## 📊 **Monitoring & Observability**

### **CloudWatch Metrics**
```yaml
Frontend Monitoring:
├── CloudFront: Cache hit ratio, origin latency
├── S3: Request metrics, error rates
└── Amplify: Build success/failure rates

API Monitoring:  
├── Public ALB: Request count, latency, errors
├── ECS: CPU, memory, task health
└── API Gateway App: Custom application metrics

Backend Monitoring:
├── Internal ALB: Target health, response times  
├── ECS Services: Resource utilization
└── Microservices: Business metrics
```

### **Logging Strategy**
```yaml
Access Logs:
├── CloudFront → S3 bucket
├── Public ALB → S3 bucket
└── Internal ALB → S3 bucket

Application Logs:
├── API Gateway App → CloudWatch Logs
└── Backend Services → CloudWatch Logs

Centralized Logging:
└── All logs → CloudWatch Insights for analysis
```

---

## 🚀 **Implementation Roadmap**

### **Phase 1: Infrastructure Setup (Week 1)**
- [ ] Create Public ALB for API Gateway
- [ ] Configure DNS records (api.company.com)
- [ ] Setup SSL certificates
- [ ] Configure Internal ALB host-based routing
- [ ] Update security groups and VPC configuration

### **Phase 2: Amplify Migration (Week 2)**
- [ ] Create AWS Amplify project
- [ ] Connect GitLab repository (AngularJS app)
- [ ] Configure custom domain (employee-portal.company.com)
- [ ] Update API base URL to api.company.com
- [ ] Test frontend deployment

### **Phase 3: API Gateway Integration (Week 3)**
- [ ] Deploy API Gateway App to ECS behind Public ALB
- [ ] Configure health checks and target groups
- [ ] Update CORS for new Amplify domain
- [ ] Test API routing to backend services
- [ ] Validate end-to-end functionality

### **Phase 4: Go-Live & Optimization (Week 4)**
- [ ] DNS cutover to new architecture
- [ ] Monitor performance and errors
- [ ] Cleanup old ECS Fargate frontend resources
- [ ] Setup monitoring dashboards
- [ ] Document operational procedures

---

## ✅ **Key Benefits Summary**

### **Client Requirements Met**
- ✅ **DNS Support**: Clean api.company.com endpoint
- ✅ **Load Balancing**: Public ALB for API Gateway
- ✅ **SSL/HTTPS**: Managed certificates
- ✅ **High Availability**: Multi-AZ deployment
- ✅ **Scalability**: Auto-scaling capabilities

### **Technical Advantages**
- ✅ **Modern Architecture**: Serverless frontend + containerized API
- ✅ **Cost Optimization**: 32-49% cost reduction
- ✅ **Performance**: Global CDN + load balancing
- ✅ **Maintainability**: Simplified operations
- ✅ **Security**: Defense in depth approach

### **Business Value**
- ✅ **Faster Development**: CI/CD automation
- ✅ **Better User Experience**: Global performance
- ✅ **Reduced Operational Overhead**: Managed services
- ✅ **Future-Ready**: Scalable architecture foundation

---

## 📋 **Final Architecture Validation**

### **Requirements Checklist**
- ✅ **Frontend Migration**: AngularJS → AWS Amplify
- ✅ **DNS Support**: Custom domains for both frontend and API
- ✅ **Load Balancing**: Public ALB for API Gateway
- ✅ **Backend Integration**: Seamless microservices connectivity
- ✅ **Cost Optimization**: Significant monthly savings
- ✅ **Performance**: Global CDN + load balancing
- ✅ **Security**: HTTPS, VPC, IAM, CORS
- ✅ **Monitoring**: Comprehensive observability
- ✅ **CI/CD**: Automated deployments from GitLab

---

## 📞 **Project Approval & Next Steps**

### **Ready for Implementation**
This final architecture addresses all client requirements including:
- DNS support for API Gateway via Public ALB
- Cost-effective frontend migration to Amplify
- Seamless backend integration with existing microservices
- Production-ready security and monitoring

### **Immediate Actions Required**
1. **Client Approval**: Review and approve final architecture
2. **Resource Allocation**: Assign development and DevOps teams
3. **AWS Account Setup**: Ensure proper permissions and access
4. **Timeline Confirmation**: Finalize 4-week implementation schedule

---

*This final architecture provides a production-ready, scalable, and cost-effective solution that meets all client requirements while maintaining full compatibility with existing backend infrastructure.*
