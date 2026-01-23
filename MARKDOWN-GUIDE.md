# Writing Effective Architecture Descriptions

## Best Practices for AI Diagram Generation

### ✅ DO: Use Clear Service Names

**Good:**
```markdown
- RDS PostgreSQL database
- EKS Kubernetes cluster
- Lambda functions for image processing
- S3 bucket for storage
- EC2 instances for web servers
```

**Why:** The AI recognizes standard AWS service names and maps them to correct icons.

---

### ✅ DO: Describe Kubernetes Resources Explicitly

**Good:**
```markdown
### Kubernetes Workloads
- Deployment: backend-api (3 replicas)
- Service: backend-svc (ClusterIP)
- Ingress: app-ingress (routes external traffic)
- ConfigMap: app-config
- Secret: db-credentials
- Pod: worker pods
```

**Why:** Using standard Kubernetes terms (Deployment, Service, Pod, Ingress, ConfigMap, Secret) ensures correct icon selection.

---

### ✅ DO: Organize by Logical Layers

**Good:**
```markdown
## Network Layer
- VPC
- Subnets

## Compute Layer
- EC2 instances
- EKS cluster

## Database Layer
- RDS
- DynamoDB

## Monitoring
- Prometheus
- Grafana
```

**Why:** Hierarchical organization helps the AI create grouped containers in the diagram.

---

### ✅ DO: Describe Relationships

**Good:**
```markdown
## Connections
1. User → CloudFront → ALB
2. ALB → Kubernetes Ingress
3. Ingress → Services
4. Services → Pods
5. Pods → RDS database
6. Prometheus monitors Pods
```

**Why:** Explicit relationships create correct edges/connections in the diagram.

---

### ❌ DON'T: Use Ambiguous Terms

**Bad:**
```markdown
- Database (which one? RDS, DynamoDB, ElastiCache?)
- Server (EC2? EKS node? Lambda?)
- Storage (S3? EBS? EFS?)
- Cache (ElastiCache Redis? DynamoDB?)
```

**Better:**
```markdown
- RDS PostgreSQL database
- EC2 web server instances
- S3 bucket for assets
- ElastiCache Redis for caching
```

---

### ❌ DON'T: Mix Concepts

**Bad:**
```markdown
- Load balancer subnet gateway
- EKS EC2 cluster nodes
```

**Better:**
```markdown
- Application Load Balancer
- Public Subnet
- Internet Gateway
- EKS Cluster
- EC2 node instances
```

**Why:** Each component should be described separately for correct diagram representation.

---

### ❌ DON'T: Use Generic Terms for Kubernetes

**Bad:**
```markdown
- Container
- Application
- Service (too generic)
```

**Better:**
```markdown
- Deployment (for Kubernetes pods)
- Pod (for running containers)
- Service (Kubernetes Service for load balancing)
- Ingress (for external routing)
```

---

## Icon Mapping Guide

### AWS Services (Use these exact terms)

| Describe as... | AI will use icon |
|---------------|------------------|
| VPC, Virtual Private Cloud | Virtual-Private-Cloud.svg |
| EC2, EC2 instance | EC2.svg |
| EKS, Kubernetes cluster | Elastic-Kubernetes-Service.svg |
| RDS, RDS database | RDS.svg |
| DynamoDB, DynamoDB table | DynamoDB.svg |
| S3, S3 bucket | Simple-Storage-Service.svg |
| Lambda, Lambda function | Lambda.svg |
| Load Balancer, ALB, ELB | Elastic-Load-Balancing.svg |
| **IAM Role** (any IAM resource) | Identity-and-Access-Management.svg |
| **Policy Attachment** | Identity-and-Access-Management.svg |
| **Internet Gateway** | Virtual-Private-Cloud.svg (use VPC icon) |
| **Subnet** | Virtual-Private-Cloud.svg (use VPC icon) |
| **Route Table** | Virtual-Private-Cloud.svg (use VPC icon) |
| **Security Group** | Res_Firewall_48_Light.svg (General/) |

### Kubernetes Resources (Use these terms)

| Describe as... | AI will use icon |
|---------------|------------------|
| Deployment, deploy | deploy.svg |
| Service, svc | svc.svg |
| Pod | pod.svg |
| Ingress | ing.svg |
| ConfigMap | cm.svg |
| Secret | secret.svg |
| Namespace | ns.svg |

### Monitoring Tools

| Describe as... | AI will use icon |
|---------------|------------------|
| Prometheus | prometheus.svg |
| Grafana | grafana.svg |
| Fluent Bit, FluentBit | fluentbit.svg |

---

## Template Structure

### Minimum Required Sections

```markdown
## Infrastructure Components
[List your components]

## Relationships
[Describe how components connect]
```

### Recommended Sections

```markdown
## Network Layer
## Compute Layer
## Kubernetes Workloads
## Database Layer
## Storage Layer
## Monitoring
## Relationships & Data Flow
```

---

## Example: Simple 3-Tier Application

```markdown
# Web Application Architecture

## Network
- VPC for network isolation
- Public subnets for load balancer
- Private subnets for application

## Load Balancing
- Application Load Balancer receives traffic

## Compute
- EKS cluster hosts application

## Kubernetes
- Frontend Deployment (React app)
- Backend Deployment (Node.js API)
- Frontend Service (ClusterIP)
- Backend Service (ClusterIP)
- Ingress (routes traffic)

## Database
- RDS PostgreSQL database

## Monitoring
- Prometheus collects metrics
- Grafana displays dashboards

## Connections
1. Users → ALB → Ingress
2. Ingress → Frontend Service → Frontend Pods
3. Ingress → Backend Service → Backend Pods
4. Backend Pods → RDS
5. Prometheus → All Pods
6. Grafana → Prometheus
```

---

## Tips for Better Diagrams

1. **Be Specific:** Say "RDS PostgreSQL" not just "database"
2. **Use Standard Names:** AWS service names, Kubernetes resource types
3. **Group Related Items:** Network components together, compute together
4. **Describe Flow:** Explain how data moves through the system
5. **Mention Monitoring:** Include observability components
6. **Keep It Logical:** Follow real-world architecture patterns

---

## Common Mistakes to Avoid

❌ **Too Vague:**
> "We have a server that connects to a database"

✅ **Specific:**
> "EC2 web server instances connect to RDS PostgreSQL database"

---

❌ **Non-Standard Terms:**
> "K8s container deployment thing"

✅ **Standard Terms:**
> "Kubernetes Deployment with 3 pod replicas"

---

❌ **Missing Connections:**
> Lists components but doesn't explain relationships

✅ **Clear Flow:**
> Explicitly describes how components connect and data flows

---

## Need Help?

Check the provided templates:
- **architecture-template.md** - Comprehensive template with all sections
- **architecture-template-simple.md** - Quick minimal template
- **test-architecture.md** - Working example

Generate your diagram and iterate based on results!
