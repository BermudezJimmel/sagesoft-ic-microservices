# Employee Portal Amplify Migration - Detailed Implementation Plan (DIP)

Based on Employee-Portal-Architecture-Proposal-FINAL.md

## Phase 1: Infrastructure Setup

| STEP # | DESCRIPTION | ACTOR | ACTUAL STEP | NEEDED INPUT | EXPECTED OUTPUT | TIME |
|--------|-------------|-------|-------------|--------------|-----------------|------|
| 1 | **AWS Amplify Setup** | DevOps | | | | |
| 1.1 | Choose source code provider | DevOps | Navigate to AWS Amplify Console → New App → Host web app | AWS Account Access | Amplify Console opened | 2 mins |
| 1.2 | GitLab Connect | DevOps | Select GitLab as source provider | GitLab credentials, Repository access | GitLab connected to Amplify | 5 mins |
| 1.3 | Add Repository and branch | DevOps | Select Repository: `sagesoft-ic-microservices` | Repository: sagesoft-ic-microservices | Repository selected | 2 mins |
| 1.4 | Select Branch | DevOps | Select Branch: `main` | Branch: main | Branch selected | 1 min |
| 1.5 | App settings configuration | DevOps | Configure app settings | | | |
| | | | App name: `employee-portal-ui` | App name | App name configured | 1 min |
| | | | Build Settings: Use amplify.yml | amplify.yml file in repo | Build settings configured | 2 mins |
| | | | Frontend build command: `npm run build:prod` | Build command | Build command set | 1 min |
| | | | Build output Directory: `dist/employee-portal-ui` | Output directory | Output directory set | 1 min |
| 1.6 | Deploy Application | DevOps | Click on "Save and Deploy" | All previous configurations | Deploying App status | 10-15 mins |
| 1.7 | Add Custom Domain | DevOps | Click on "Domain management" → "Add domain" | Domain access | Domain configuration page | 2 mins |
| 1.8 | Configure Domain | DevOps | Add domain: `employee-portal.company.com` | Domain: employee-portal.company.com | Domain added | 2 mins |
| 1.9 | SSL Configuration | DevOps | Select "Amplify managed certificate" | Domain validation access | SSL Certificate provisioning | 30-45 mins |
| 1.10 | DNS Configuration | DevOps | Get Amplify DNS name and add CNAME record | DNS management access | CNAME: employee-portal.company.com → d1234.amplifyapp.com | 5 mins |

## Phase 2: API Gateway Setup

| STEP # | DESCRIPTION | ACTOR | ACTUAL STEP | NEEDED INPUT | EXPECTED OUTPUT | TIME |
|--------|-------------|-------|-------------|--------------|-----------------|------|
| 2 | **Public ALB for API Gateway** | DevOps | | | | |
| 2.1 | Create Public ALB | DevOps | EC2 Console → Load Balancers → Create ALB | VPC, Subnets, Security Groups | Public ALB created | 10 mins |
| 2.2 | Configure ALB Settings | DevOps | Name: `api-gateway-alb`, Scheme: internet-facing | ALB configuration | ALB configured | 5 mins |
| 2.3 | Add SSL Certificate | DevOps | Add certificate for `*.company.com` | SSL Certificate ARN | HTTPS listener configured | 5 mins |
| 2.4 | Create Target Group | DevOps | Create target group: `api-gateway-targets` | Target group settings | Target group created | 5 mins |
| 2.5 | Configure Health Checks | DevOps | Health check path: `/health`, Port: 80 | Health check settings | Health checks configured | 3 mins |
| 2.6 | DNS Configuration | DevOps | Route 53: `api.company.com` → ALB DNS | Route 53 access | DNS record created | 5 mins |

## Phase 3: Internal ALB Setup

| STEP # | DESCRIPTION | ACTOR | ACTUAL STEP | NEEDED INPUT | EXPECTED OUTPUT | TIME |
|--------|-------------|-------|-------------|--------------|-----------------|------|
| 3 | **Internal ALB for Backend Services** | DevOps | | | | |
| 3.1 | Create Internal ALB | DevOps | Create ALB: `backend-services-alb`, Scheme: internal | VPC, Private subnets | Internal ALB created | 10 mins |
| 3.2 | Create Target Groups | DevOps | Create 4 target groups: emp-tg, core-tg, auth-tg, files-tg | Target group configurations | 4 target groups created | 15 mins |
| 3.3 | Configure Host-based Routing | DevOps | Add listener rules for host-based routing | Host headers mapping | Routing rules configured | 10 mins |
| | | | Rule 1: Host = `emp.internal` → emp-tg | Host header rule | EMP routing configured | |
| | | | Rule 2: Host = `core.internal` → core-tg | Host header rule | CORE routing configured | |
| | | | Rule 3: Host = `auth.internal` → auth-tg | Host header rule | AUTH routing configured | |
| | | | Rule 4: Host = `files.internal` → files-tg | Host header rule | FILES routing configured | |

## Phase 4: ECS Services Configuration

| STEP # | DESCRIPTION | ACTOR | ACTUAL STEP | NEEDED INPUT | EXPECTED OUTPUT | TIME |
|--------|-------------|-------|-------------|--------------|-----------------|------|
| 4 | **ECS Services Setup** | DevOps | | | | |
| 4.1 | Update API Gateway Service | DevOps | Attach API Gateway service to Public ALB target group | ECS service configuration | API Gateway connected to Public ALB | 10 mins |
| 4.2 | Update Backend Services | DevOps | Attach each backend service to respective target groups | Service configurations | Backend services connected to Internal ALB | 20 mins |
| 4.3 | Configure Security Groups | DevOps | Update security groups for ALB communication | Security group rules | Network access configured | 15 mins |
| 4.4 | Test Service Health | DevOps | Verify all target groups show healthy targets | Health check status | All services healthy | 10 mins |

## Phase 5: Application Configuration

| STEP # | DESCRIPTION | ACTOR | ACTUAL STEP | NEEDED INPUT | EXPECTED OUTPUT | TIME |
|--------|-------------|-------|-------------|--------------|-----------------|------|
| 5 | **Frontend Configuration** | Developer | | | | |
| 5.1 | Update Environment Config | Developer | Update `environment.prod.ts` with API URL | API URL: https://api.company.com | Production config updated | 5 mins |
| 5.2 | Update CORS Settings | Developer | Configure CORS in API Gateway app | Amplify domain: employee-portal.company.com | CORS configured | 10 mins |
| 5.3 | Test API Integration | Developer | Test API calls from frontend to backend | API endpoints | API integration working | 15 mins |

## Phase 6: Testing & Validation

| STEP # | DESCRIPTION | ACTOR | ACTUAL STEP | NEEDED INPUT | EXPECTED OUTPUT | TIME |
|--------|-------------|-------|-------------|--------------|-----------------|------|
| 6 | **End-to-End Testing** | QA/Developer | | | | |
| 6.1 | Frontend Access Test | QA | Access https://employee-portal.company.com | Browser access | Frontend loads successfully | 5 mins |
| 6.2 | Authentication Test | QA | Test login functionality | Test credentials | Login works, JWT token received | 10 mins |
| 6.3 | API Integration Test | QA | Test all API endpoints through frontend | API test cases | All APIs respond correctly | 20 mins |
| 6.4 | Performance Test | QA | Test page load times and responsiveness | Performance tools | Performance meets requirements | 15 mins |
| 6.5 | Security Test | QA | Verify HTTPS, CORS, and authentication | Security checklist | Security requirements met | 10 mins |

## Phase 7: Go-Live & Monitoring

| STEP # | DESCRIPTION | ACTOR | ACTUAL STEP | NEEDED INPUT | EXPECTED OUTPUT | TIME |
|--------|-------------|-------|-------------|--------------|-----------------|------|
| 7 | **Production Deployment** | DevOps | | | | |
| 7.1 | DNS Cutover | DevOps | Update DNS to point to new architecture | DNS management access | Traffic routed to new system | 5 mins |
| 7.2 | Monitor Deployment | DevOps | Monitor CloudWatch metrics and logs | Monitoring tools | System stable and healthy | 30 mins |
| 7.3 | Cleanup Old Resources | DevOps | Remove old ECS Fargate frontend resources | Resource identification | Old resources cleaned up | 15 mins |
| 7.4 | Setup Monitoring Dashboards | DevOps | Create CloudWatch dashboards | Monitoring requirements | Dashboards configured | 20 mins |

## Continuous Operations

| STEP # | DESCRIPTION | ACTOR | ACTUAL STEP | NEEDED INPUT | EXPECTED OUTPUT | TIME |
|--------|-------------|-------|-------------|--------------|-----------------|------|
| 8 | **Automatic Deployments** | Developer | | | | |
| 8.1 | Code Changes | Developer | Push changes to GitLab main branch | Code changes | Code committed to repository | 5 mins |
| 8.2 | Automatic Build | Amplify | Amplify automatically detects changes and builds | Git webhook trigger | Build process started | 1 min |
| 8.3 | Automatic Deployment | Amplify | Amplify deploys new version to production | Build artifacts | New version deployed | 5-10 mins |
| 8.4 | Validation | Developer | Verify deployment success | Deployment status | New version live and working | 5 mins |

## Summary Timeline

| **Phase** | **Total Time** | **Dependencies** |
|-----------|----------------|------------------|
| Phase 1: Amplify Setup | 60-75 mins | AWS Account, GitLab Access, Domain Access |
| Phase 2: Public ALB Setup | 35 mins | VPC, SSL Certificate |
| Phase 3: Internal ALB Setup | 35 mins | Private Subnets, Target Groups |
| Phase 4: ECS Configuration | 55 mins | ECS Services, Security Groups |
| Phase 5: App Configuration | 30 mins | Source Code Access |
| Phase 6: Testing | 60 mins | Test Environment |
| Phase 7: Go-Live | 70 mins | Production Access |
| **Total Implementation Time** | **5-6 hours** | **All Prerequisites Met** |

## Key Success Metrics

- ✅ Frontend accessible at `https://employee-portal.company.com`
- ✅ API accessible at `https://api.company.com`
- ✅ All microservices responding through Internal ALB
- ✅ Automatic deployments working from GitLab
- ✅ SSL certificates active and valid
- ✅ Performance improved with CloudFront CDN
- ✅ Cost reduced by 32-49% monthly

## CSV Export Ready Tables

### Phase 1: Infrastructure Setup
```csv
STEP #,DESCRIPTION,ACTOR,ACTUAL STEP,NEEDED INPUT,EXPECTED OUTPUT,TIME
1,AWS Amplify Setup,DevOps,,,
1.1,Choose source code provider,DevOps,Navigate to AWS Amplify Console → New App → Host web app,AWS Account Access,Amplify Console opened,2 mins
1.2,GitLab Connect,DevOps,Select GitLab as source provider,GitLab credentials Repository access,GitLab connected to Amplify,5 mins
1.3,Add Repository and branch,DevOps,Select Repository: sagesoft-ic-microservices,Repository: sagesoft-ic-microservices,Repository selected,2 mins
1.4,Select Branch,DevOps,Select Branch: main,Branch: main,Branch selected,1 min
1.5,App settings configuration,DevOps,Configure app settings,,,
,,,App name: employee-portal-ui,App name,App name configured,1 min
,,,Build Settings: Use amplify.yml,amplify.yml file in repo,Build settings configured,2 mins
,,,Frontend build command: npm run build:prod,Build command,Build command set,1 min
,,,Build output Directory: dist/employee-portal-ui,Output directory,Output directory set,1 min
1.6,Deploy Application,DevOps,Click on Save and Deploy,All previous configurations,Deploying App status,10-15 mins
1.7,Add Custom Domain,DevOps,Click on Domain management → Add domain,Domain access,Domain configuration page,2 mins
1.8,Configure Domain,DevOps,Add domain: employee-portal.company.com,Domain: employee-portal.company.com,Domain added,2 mins
1.9,SSL Configuration,DevOps,Select Amplify managed certificate,Domain validation access,SSL Certificate provisioning,30-45 mins
1.10,DNS Configuration,DevOps,Get Amplify DNS name and add CNAME record,DNS management access,CNAME: employee-portal.company.com → d1234.amplifyapp.com,5 mins
```

### Phase 2: API Gateway Setup
```csv
STEP #,DESCRIPTION,ACTOR,ACTUAL STEP,NEEDED INPUT,EXPECTED OUTPUT,TIME
2,Public ALB for API Gateway,DevOps,,,
2.1,Create Public ALB,DevOps,EC2 Console → Load Balancers → Create ALB,VPC Subnets Security Groups,Public ALB created,10 mins
2.2,Configure ALB Settings,DevOps,Name: api-gateway-alb Scheme: internet-facing,ALB configuration,ALB configured,5 mins
2.3,Add SSL Certificate,DevOps,Add certificate for *.company.com,SSL Certificate ARN,HTTPS listener configured,5 mins
2.4,Create Target Group,DevOps,Create target group: api-gateway-targets,Target group settings,Target group created,5 mins
2.5,Configure Health Checks,DevOps,Health check path: /health Port: 80,Health check settings,Health checks configured,3 mins
2.6,DNS Configuration,DevOps,Route 53: api.company.com → ALB DNS,Route 53 access,DNS record created,5 mins
```

### Phase 3: Internal ALB Setup
```csv
STEP #,DESCRIPTION,ACTOR,ACTUAL STEP,NEEDED INPUT,EXPECTED OUTPUT,TIME
3,Internal ALB for Backend Services,DevOps,,,
3.1,Create Internal ALB,DevOps,Create ALB: backend-services-alb Scheme: internal,VPC Private subnets,Internal ALB created,10 mins
3.2,Create Target Groups,DevOps,Create 4 target groups: emp-tg core-tg auth-tg files-tg,Target group configurations,4 target groups created,15 mins
3.3,Configure Host-based Routing,DevOps,Add listener rules for host-based routing,Host headers mapping,Routing rules configured,10 mins
,,,Rule 1: Host = emp.internal → emp-tg,Host header rule,EMP routing configured,
,,,Rule 2: Host = core.internal → core-tg,Host header rule,CORE routing configured,
,,,Rule 3: Host = auth.internal → auth-tg,Host header rule,AUTH routing configured,
,,,Rule 4: Host = files.internal → files-tg,Host header rule,FILES routing configured,
```

### Phase 4: ECS Services Configuration
```csv
STEP #,DESCRIPTION,ACTOR,ACTUAL STEP,NEEDED INPUT,EXPECTED OUTPUT,TIME
4,ECS Services Setup,DevOps,,,
4.1,Update API Gateway Service,DevOps,Attach API Gateway service to Public ALB target group,ECS service configuration,API Gateway connected to Public ALB,10 mins
4.2,Update Backend Services,DevOps,Attach each backend service to respective target groups,Service configurations,Backend services connected to Internal ALB,20 mins
4.3,Configure Security Groups,DevOps,Update security groups for ALB communication,Security group rules,Network access configured,15 mins
4.4,Test Service Health,DevOps,Verify all target groups show healthy targets,Health check status,All services healthy,10 mins
```

### Phase 5: Application Configuration
```csv
STEP #,DESCRIPTION,ACTOR,ACTUAL STEP,NEEDED INPUT,EXPECTED OUTPUT,TIME
5,Frontend Configuration,Developer,,,
5.1,Update Environment Config,Developer,Update environment.prod.ts with API URL,API URL: https://api.company.com,Production config updated,5 mins
5.2,Update CORS Settings,Developer,Configure CORS in API Gateway app,Amplify domain: employee-portal.company.com,CORS configured,10 mins
5.3,Test API Integration,Developer,Test API calls from frontend to backend,API endpoints,API integration working,15 mins
```

### Phase 6: Testing & Validation
```csv
STEP #,DESCRIPTION,ACTOR,ACTUAL STEP,NEEDED INPUT,EXPECTED OUTPUT,TIME
6,End-to-End Testing,QA/Developer,,,
6.1,Frontend Access Test,QA,Access https://employee-portal.company.com,Browser access,Frontend loads successfully,5 mins
6.2,Authentication Test,QA,Test login functionality,Test credentials,Login works JWT token received,10 mins
6.3,API Integration Test,QA,Test all API endpoints through frontend,API test cases,All APIs respond correctly,20 mins
6.4,Performance Test,QA,Test page load times and responsiveness,Performance tools,Performance meets requirements,15 mins
6.5,Security Test,QA,Verify HTTPS CORS and authentication,Security checklist,Security requirements met,10 mins
```

### Phase 7: Go-Live & Monitoring
```csv
STEP #,DESCRIPTION,ACTOR,ACTUAL STEP,NEEDED INPUT,EXPECTED OUTPUT,TIME
7,Production Deployment,DevOps,,,
7.1,DNS Cutover,DevOps,Update DNS to point to new architecture,DNS management access,Traffic routed to new system,5 mins
7.2,Monitor Deployment,DevOps,Monitor CloudWatch metrics and logs,Monitoring tools,System stable and healthy,30 mins
7.3,Cleanup Old Resources,DevOps,Remove old ECS Fargate frontend resources,Resource identification,Old resources cleaned up,15 mins
7.4,Setup Monitoring Dashboards,DevOps,Create CloudWatch dashboards,Monitoring requirements,Dashboards configured,20 mins
```

### Continuous Operations
```csv
STEP #,DESCRIPTION,ACTOR,ACTUAL STEP,NEEDED INPUT,EXPECTED OUTPUT,TIME
8,Automatic Deployments,Developer,,,
8.1,Code Changes,Developer,Push changes to GitLab main branch,Code changes,Code committed to repository,5 mins
8.2,Automatic Build,Amplify,Amplify automatically detects changes and builds,Git webhook trigger,Build process started,1 min
8.3,Automatic Deployment,Amplify,Amplify deploys new version to production,Build artifacts,New version deployed,5-10 mins
8.4,Validation,Developer,Verify deployment success,Deployment status,New version live and working,5 mins
```

---

*This detailed implementation plan provides step-by-step instructions for migrating the Employee Portal from ECS Fargate to AWS Amplify with complete backend integration.*
