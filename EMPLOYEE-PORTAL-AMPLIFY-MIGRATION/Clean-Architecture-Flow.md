# Employee Portal Amplify Migration - Architecture Overview

## 🎯 **Current vs Target Architecture**

### **Current State (ECS Fargate)**
```
Internet → Public ALB → Employee Portal UI (ECS) → API Gateway → Internal ALB → Backend Services
                        ($30/month)                                    (EMP, CORE, AUTH, FILES)
```

### **Target State (AWS Amplify)**
```
Internet → CloudFront/S3 (Amplify) → API Gateway → Internal ALB → Backend Services
           ($10/month)                                        (EMP, CORE, AUTH, FILES)
```

---

## 📊 **Cost Analysis**

### **Current Monthly Costs**
```
Frontend Infrastructure:
├── Public ALB: $20
├── ECS Fargate (UI): $30
└── Total: $50/month
```

### **Target Monthly Costs**
```
Frontend Infrastructure:
├── Amplify Hosting: $5
├── CloudFront CDN: $5
└── Total: $10/month

Monthly Savings: $40 (80% reduction)
```

---

## 🏗️ **Technical Architecture**

### **Components Staying Unchanged**
- ✅ **API Gateway**: Existing routing logic preserved
- ✅ **Internal ALB**: Multi-port setup (3000-3003) unchanged
- ✅ **Backend Services**: EMP, CORE, AUTH, FILES remain on ECS
- ✅ **Database**: All existing endpoints and configurations preserved

### **Components Being Migrated**
- 🔄 **Employee Portal UI**: ECS Fargate → AWS Amplify
- 🔄 **Public Access**: Public ALB → CloudFront CDN
- 🔄 **CI/CD**: Manual deployment → Automated GitLab pipeline

---

## 🔄 **Migration Flow**

### **Phase 1: Amplify Setup**
1. Configure AWS Amplify with GitLab repository
2. Set up build pipeline for AngularJS application
3. Configure custom domain and SSL certificate

### **Phase 2: API Integration**
1. Update AngularJS app to use API Gateway endpoints
2. Configure CORS settings for cross-origin requests
3. Test authentication flow with existing AUTH service

### **Phase 3: Cutover**
1. Deploy application to Amplify
2. Update DNS to point to CloudFront distribution
3. Decommission Public ALB and ECS Fargate UI service

---

## 🌐 **Data Flow Example**

### **Employee Login Process**
```
1. Employee → employee-portal.company.com (CloudFront)
2. CloudFront → S3 (serves AngularJS app)
3. AngularJS → API Gateway (/api/auth/login)
4. API Gateway → Internal ALB:3002 (AUTH service)
5. AUTH service → validates credentials
6. Response → Employee Portal (authentication token)
```

### **Employee Data Access**
```
1. AngularJS → API Gateway (/api/employee/profile)
2. API Gateway → Internal ALB:3000 (EMP service)
3. EMP service → returns employee data
4. Response → Employee Portal (profile information)
```

---

## ✅ **Benefits Summary**

### **Cost Optimization**
- **80% reduction** in frontend infrastructure costs
- **No server management** overhead for UI layer
- **Pay-per-use** pricing model with Amplify

### **Performance Improvements**
- **Global CDN** distribution via CloudFront
- **Faster loading times** worldwide
- **Automatic caching** of static assets

### **Operational Benefits**
- **Automated deployments** from GitLab commits
- **Zero downtime** deployments
- **Simplified infrastructure** management

### **Security Enhancements**
- **AWS managed infrastructure** security
- **DDoS protection** via CloudFront
- **Backend services remain internal** and protected

---

## 🚀 **Implementation Timeline**

### **Week 1: Setup & Configuration**
- AWS Amplify project creation
- GitLab integration and build pipeline
- Domain and SSL certificate setup

### **Week 2: Application Migration**
- AngularJS code updates for API endpoints
- CORS configuration and testing
- Authentication flow validation

### **Week 3: Testing & Validation**
- End-to-end functionality testing
- Performance benchmarking
- Security validation

### **Week 4: Go-Live**
- DNS cutover to CloudFront
- Public ALB and ECS service decommission
- Post-migration monitoring

---

## 🔧 **Technical Requirements**

### **Prerequisites**
- GitLab repository access for CI/CD integration
- AWS account with appropriate permissions
- Domain management access for DNS updates

### **Configuration Changes**
- **AngularJS App**: Update API base URLs to use API Gateway
- **CORS Settings**: Configure API Gateway for cross-origin requests
- **Authentication**: Ensure token-based auth works with new flow

### **No Changes Required**
- Backend service code or configuration
- Database schemas or connections
- Internal ALB listener configuration
- API Gateway routing logic

---

## 📋 **Risk Mitigation**

### **Low Risk Items**
- ✅ **Backend services unchanged** - no service disruption
- ✅ **Gradual migration** - can rollback at any point
- ✅ **Proven technology** - Amplify is mature AWS service

### **Managed Risks**
- 🔄 **DNS cutover** - planned maintenance window
- 🔄 **CORS configuration** - thorough testing before go-live
- 🔄 **Authentication flow** - validation in staging environment

---

## 💡 **Client Value Proposition**

### **Immediate Benefits**
- **$480 annual savings** on frontend infrastructure
- **Improved global performance** via CDN
- **Reduced operational complexity**

### **Long-term Benefits**
- **Scalable architecture** for future growth
- **Modern CI/CD pipeline** for faster development
- **Foundation for further modernization**

---

## 📞 **Next Steps**

1. **Client approval** for migration approach
2. **Timeline confirmation** and resource allocation
3. **Staging environment** setup for testing
4. **Go-live date** scheduling

---

*This migration maintains 100% compatibility with existing backend services while modernizing frontend delivery for improved performance and cost efficiency.*
