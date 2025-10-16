# Employee Portal UI - Angular Application

## 🎯 **Overview**

This is a modern Angular-based Employee Portal UI designed for deployment on AWS Amplify. The application provides employee authentication, dashboard, and profile management functionality.

## 🏗️ **Architecture**

- **Frontend Framework**: Angular 17
- **Deployment**: AWS Amplify (S3 + CloudFront)
- **API Integration**: RESTful APIs via `api.company.com`
- **Authentication**: JWT Token-based

## 📁 **Project Structure**

```
employee-portal-ui/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── login/           # Login component
│   │   │   ├── dashboard/       # Dashboard component
│   │   │   └── profile/         # Profile management
│   │   ├── services/
│   │   │   ├── auth.service.ts  # Authentication service
│   │   │   └── employee.service.ts # Employee data service
│   │   ├── app.module.ts        # Main app module
│   │   └── app-routing.module.ts # Routing configuration
│   ├── environments/
│   │   ├── environment.ts       # Development config
│   │   └── environment.prod.ts  # Production config
│   └── index.html              # Main HTML file
├── amplify.yml                 # Amplify build configuration
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## 🚀 **Features**

### **Authentication**
- JWT token-based login
- Secure logout functionality
- Route protection for authenticated users

### **Dashboard**
- Welcome message with user info
- Employee directory listing
- Quick stats and metrics
- Navigation to profile management

### **Profile Management**
- View and edit employee information
- Form validation
- Real-time updates

## 🛠️ **Development Setup**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Angular CLI

### **Installation**
```bash
# Install dependencies
npm install

# Install Angular CLI globally (if not installed)
npm install -g @angular/cli

# Start development server
npm start
```

### **Development Server**
```bash
# Run on http://localhost:4200
ng serve

# Run with specific port
ng serve --port 4300
```

## 🏭 **Build & Deployment**

### **Local Build**
```bash
# Development build
npm run build

# Production build
npm run build:prod
```

### **AWS Amplify Deployment**

The application is configured for automatic deployment via AWS Amplify:

1. **Connect Repository**: Link GitLab repository to Amplify
2. **Build Configuration**: Uses `amplify.yml` for build settings
3. **Environment Variables**: Configure API endpoints in Amplify console
4. **Custom Domain**: Set up `employee-portal.company.com`

### **Environment Configuration**

**Development** (`environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

**Production** (`environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.company.com'
};
```

## 🔌 **API Integration**

### **Authentication Endpoints**
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### **Employee Endpoints**
- `GET /employee/profile` - Get user profile
- `PUT /employee/profile` - Update user profile  
- `GET /employee/list` - Get employee directory

### **API Configuration**
```typescript
// Headers for authenticated requests
{
  'Authorization': 'Bearer <jwt-token>',
  'Content-Type': 'application/json'
}
```

## 🔒 **Security Features**

- **JWT Authentication**: Secure token-based auth
- **Route Guards**: Protected routes for authenticated users
- **HTTPS Only**: SSL/TLS encryption
- **Security Headers**: CSP, HSTS, XSS protection
- **Input Validation**: Form validation and sanitization

## 📱 **Responsive Design**

- **Mobile-First**: Responsive design for all devices
- **Grid Layout**: CSS Grid for flexible layouts
- **Touch-Friendly**: Optimized for mobile interactions

## 🧪 **Testing**

```bash
# Run unit tests
npm test

# Run e2e tests
npm run e2e

# Run linting
npm run lint
```

## 📊 **Performance Optimization**

- **Lazy Loading**: Route-based code splitting
- **Tree Shaking**: Unused code elimination
- **Minification**: Production build optimization
- **CDN Delivery**: CloudFront global distribution

## 🔧 **Configuration**

### **Amplify Build Settings**
```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build:prod
  artifacts:
    baseDirectory: dist/employee-portal-ui
    files:
      - '**/*'
```

### **Custom Headers**
- Strict-Transport-Security
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection

## 🚀 **Deployment Checklist**

- [ ] Update API URL in production environment
- [ ] Configure custom domain in Amplify
- [ ] Set up SSL certificate
- [ ] Configure CORS on API Gateway
- [ ] Test authentication flow
- [ ] Verify responsive design
- [ ] Check performance metrics

## 📞 **Support**

For technical support or questions:
- **Development Team**: [dev-team@company.com]
- **DevOps Team**: [devops@company.com]
- **Project Manager**: [pm@company.com]

---

*This Employee Portal UI is designed for seamless integration with AWS Amplify and the existing backend microservices architecture.*
