# Architecture Diagram Template

> Use this template to describe your cloud architecture. The AI will generate a visual diagram from this markdown.

## Project Overview
<!-- Brief description of what this architecture does -->
**Project Name:** [Your Project Name]  
**Environment:** [Development/Staging/Production]  
**Purpose:** [Brief description of the system]

---

## Network Layer
<!-- Describe your network infrastructure -->

### VPC (Virtual Private Cloud)
- **VPC Name:** [vpc-name]
- **CIDR Block:** [10.0.0.0/16]
- **Purpose:** Network isolation and security

### Subnets
- **Public Subnet 1:** [10.0.1.0/24] in Availability Zone A
- **Public Subnet 2:** [10.0.2.0/24] in Availability Zone B
- **Private Subnet 1:** [10.0.10.0/24] in Availability Zone A
- **Private Subnet 2:** [10.0.20.0/24] in Availability Zone B

### Connectivity
- **Internet Gateway:** Provides internet access to public subnets
- **NAT Gateway:** Allows private subnets to access internet
- **Route Tables:** Route traffic between subnets and internet

---

## Compute Layer
<!-- Describe compute resources: EC2, Lambda, EKS, ECS -->

### EC2 Instances
- **Web Servers:** [t3.medium] instances in public subnets
- **Application Servers:** [t3.large] instances in private subnets
- **Purpose:** Host web application and API services

### EKS (Kubernetes Cluster)
- **Cluster Name:** [cluster-name]
- **Node Groups:** [t3.large] instances across multiple AZs
- **Purpose:** Run containerized microservices
- **Namespaces:**
  - `production` - Main application workloads
  - `monitoring` - Observability stack
  - `kube-system` - System components

---

## Kubernetes Workloads
<!-- Describe Kubernetes resources inside EKS cluster -->

### Deployments
- **Backend API Deployment:** Flask/FastAPI application (3 replicas)
- **Frontend Deployment:** React/Vue.js SPA (2 replicas)
- **Worker Deployment:** Background job processor (2 replicas)

### Services
- **Backend Service:** ClusterIP service exposing backend pods on port 8080
- **Frontend Service:** ClusterIP service exposing frontend pods on port 3000
- **Database Service:** ExternalName service pointing to RDS

### Ingress
- **Application Ingress:** AWS Load Balancer Controller managing ALB
  - Routes `/api/*` to backend service
  - Routes `/*` to frontend service

### ConfigMaps & Secrets
- **App ConfigMap:** Application configuration (environment variables)
- **Database Secret:** RDS connection credentials
- **API Keys Secret:** Third-party service credentials

---

## Database Layer
<!-- Describe databases: RDS, DynamoDB, ElastiCache -->

### RDS (Relational Database)
- **Engine:** PostgreSQL 15
- **Instance Type:** db.r6g.large
- **Multi-AZ:** Yes
- **Purpose:** Store application data (users, orders, products)

### DynamoDB
- **Table Name:** [table-name]
- **Capacity:** On-demand
- **Purpose:** Session storage and caching

### ElastiCache (Redis)
- **Node Type:** cache.r6g.large
- **Purpose:** Application caching and session management

---

## Storage Layer
<!-- Describe S3, EBS, EFS -->

### S3 Buckets
- **Assets Bucket:** User uploads and static assets
- **Logs Bucket:** Application and access logs
- **Backup Bucket:** Database backups

### EBS Volumes
- **Attached to EC2 instances** for persistent storage

### EFS (Elastic File System)
- **Shared storage** for multiple EC2 instances

---

## Load Balancing & CDN
<!-- Describe load balancers and content delivery -->

### Application Load Balancer (ALB)
- **Public-facing ALB:** Routes traffic to web servers
- **Health Checks:** Monitor application health
- **SSL/TLS Termination:** HTTPS support

### CloudFront (CDN)
- **Distribution:** Cache static assets globally
- **Origin:** S3 bucket for static content

---

## Security & Identity
<!-- Describe security components -->

### IAM Roles & Policies
- **EC2 Instance Role:** Access to S3 and DynamoDB
- **EKS Node Role:** Kubernetes node permissions
- **Lambda Execution Role:** Function execution permissions

### Security Groups
- **Web Tier SG:** Allow HTTP/HTTPS from internet
- **App Tier SG:** Allow traffic from web tier only
- **Database SG:** Allow traffic from app tier only

### Secrets Management
- **AWS Secrets Manager:** Store database credentials
- **KMS (Key Management Service):** Encrypt sensitive data

---

## Monitoring & Logging
<!-- Describe observability stack -->

### Prometheus
- **Deployment:** Metrics collection from Kubernetes pods
- **Scraping:** Collects metrics every 15 seconds
- **Storage:** Time-series database for metrics

### Grafana
- **Deployment:** Visualization dashboards
- **Data Source:** Connected to Prometheus
- **Dashboards:** Application metrics, infrastructure health

### Fluent Bit
- **DaemonSet:** Log collection from all pods
- **Destination:** CloudWatch Logs or S3

### CloudWatch
- **Metrics:** EC2, RDS, Lambda metrics
- **Logs:** Application and system logs
- **Alarms:** Alert on threshold breaches

---

## CI/CD Pipeline
<!-- Describe deployment pipeline -->

### CodePipeline
- **Source:** GitHub repository
- **Build:** CodeBuild compiles and tests code
- **Deploy:** CodeDeploy updates EKS or EC2

### CodeBuild
- **Build Projects:** Compile, test, and create Docker images
- **Output:** Push images to ECR (Container Registry)

### CodeDeploy
- **Deployment Groups:** Manage rolling updates
- **Deployment Strategy:** Blue/Green or Rolling

---

## Relationships & Data Flow
<!-- Describe how components connect and data flows -->

### User Request Flow
1. User accesses application via CloudFront
2. CloudFront routes to ALB
3. ALB routes to Kubernetes Ingress
4. Ingress routes to Frontend Service
5. Frontend calls Backend API Service
6. Backend connects to RDS database
7. Backend caches data in ElastiCache

### Monitoring Flow
1. Prometheus scrapes metrics from all Kubernetes pods
2. Grafana queries Prometheus for dashboard visualization
3. Fluent Bit collects logs from pods
4. Logs sent to CloudWatch for analysis
5. CloudWatch Alarms trigger on errors

### Deployment Flow
1. Developer pushes code to GitHub
2. CodePipeline detects change
3. CodeBuild runs tests and builds Docker image
4. Image pushed to ECR
5. CodeDeploy updates Kubernetes deployments
6. Rolling update with zero downtime

---

## Backup & Disaster Recovery
<!-- Describe backup and DR strategy -->

### Database Backups
- **RDS Automated Backups:** Daily snapshots retained for 7 days
- **Manual Snapshots:** Created before major releases

### Cross-Region Replication
- **S3 Replication:** Critical data replicated to secondary region
- **RDS Read Replica:** In different region for DR

---

## Scaling Strategy
<!-- Describe how the system scales -->

### Auto Scaling
- **EC2 Auto Scaling:** Scale based on CPU utilization
- **Kubernetes HPA:** Scale pods based on CPU/memory
- **DynamoDB Auto Scaling:** Scale read/write capacity

### Load Distribution
- **Multiple Availability Zones:** Resources spread across AZs
- **Geographic Distribution:** CloudFront edge locations worldwide

---

## Additional Services
<!-- Any other AWS/cloud services used -->

### Lambda Functions
- **Image Processing:** Resize uploaded images
- **Scheduled Tasks:** Daily cleanup jobs

### SQS (Simple Queue Service)
- **Job Queue:** Asynchronous task processing

### SNS (Simple Notification Service)
- **Alerts:** Send notifications on critical events

---

## Notes
<!-- Additional context or special configurations -->

- All resources tagged with `Environment`, `Project`, and `Owner` tags
- Private subnets use NAT Gateway for outbound internet access
- All traffic encrypted in transit (TLS) and at rest (KMS)
- Regular security audits using AWS Config and Security Hub
