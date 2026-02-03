# [Architecture Name] — Diagram Template

## Infrastructure Components

### Cloud Stack:
[AWS/Azure/GCP]

### Network Layer
- [Resource Name] (`[technical_id_or_terraform_resource]`)
- [Resource Name] (`[technical_id_or_terraform_resource]`)
- [Resource Name] (`[technical_id_or_terraform_resource]`)

### Compute Layer
- [Resource Name] (`[technical_id_or_terraform_resource]`)
- [Resource Name] (`[technical_id_or_terraform_resource]`)

### Data Layer
- [Resource Name] (`[technical_id_or_terraform_resource]`)
- [Resource Name] (`[technical_id_or_terraform_resource]`)

### Identity & Access
- [Resource Name] (`[technical_id_or_terraform_resource]`)
- [Resource Name] (`[technical_id_or_terraform_resource]`)

### Kubernetes Workloads
- [Resource Name] (`[technical_id_or_terraform_resource]`)
- [Resource Name] (`[technical_id_or_terraform_resource]`)

## Relationships
1. `[source_id]` → `[target_id]` — [relationship_description]
2. `[source_id]` → `[target_id]` — [relationship_description]
3. `[source_id]` → `[target_id]` — [relationship_description]

---

# CRITICAL TEMPLATE RULES FOR MD GENERATION

## ✅ DO (What Works):

### 1. Resource Format
```
- [Clear Resource Name] (`technical_identifier`)
```
**Examples**:
- Main VPC (`aws_vpc.main`)
- Public Subnet 1 (`aws_subnet.public[0]`)
- EKS Cluster (`aws_eks_cluster.prod`)
- Backend Deployment (`k8s-deploy-backend`)

### 2. ONE Resource Per Line
```
✅ CORRECT:
- Public Subnet 1 (`subnet-abc123`)
- Public Subnet 2 (`subnet-def456`)
- Public Subnet 3 (`subnet-ghi789`)

❌ WRONG:
- Public Subnets: `subnet-abc123`, `subnet-def456`, `subnet-ghi789`
```

### 3. Clear Section Headers
Always use these exact sections in order:
- Network Layer (VPC, Subnets, Load Balancers, Security Groups)
- Compute Layer (EKS, EC2, Node Groups, AKS, VMs)
- Data Layer (RDS, DynamoDB, Storage, Databases)
- Identity & Access (IAM Roles, Policies, Users)
- Kubernetes Workloads (Namespaces, Deployments, Services, ConfigMaps)

### 4. Relationship Format
```
[number]. `[exact_source_id]` → `[exact_target_id]` — [short_description]
```
**Use EXACT IDs from resources above**, wrapped in backticks

**Examples**:
```
1. `aws_vpc.main` → `aws_internet_gateway.igw` — attached
2. `aws_subnet.public[0]` → `aws_eks_cluster.prod` — provides network
3. `aws_eks_cluster.prod` → `k8s-namespace-prod` — hosts workload
```

## ❌ DON'T (What Breaks):

### 1. DON'T Aggregate Multiple Resources
```
❌ WRONG:
- Load Balancers:
  - Ingress ALB: `alb-abc123`
  - Istio Gateway ALB: `alb-def456`

✅ CORRECT:
- Ingress ALB (`alb-abc123`)
- Istio Gateway ALB (`alb-def456`)
```

### 2. DON'T Use "X+" or Vague Counts
```
❌ WRONG:
- Deployments: 15+ pods across all namespaces
- Services: 10+ (LoadBalancer, ClusterIP types)

✅ CORRECT:
- Frontend Deployment (`deploy-frontend`)
- Backend Deployment (`deploy-backend`)
- API Deployment (`deploy-api`)
- Frontend Service (`svc-frontend`)
- Backend Service (`svc-backend`)
```

### 3. DON'T Use Nested Bullets
```
❌ WRONG:
- Load Balancers:
  - Ingress ALB: `alb-abc123`
  - Security Groups:
    - ALB SG: `sg-ghi789`

✅ CORRECT (Flat list):
- Ingress ALB (`alb-abc123`)
- ALB Security Group (`sg-ghi789`)
```

### 4. DON'T Put Multiple IDs in One Line
```
❌ WRONG:
- Subnets (`subnet-1`, `subnet-2`, `subnet-3`)
- Namespaces: istio-system, argocd, monitoring

✅ CORRECT:
- Subnet 1 (`subnet-1`)
- Subnet 2 (`subnet-2`)
- Subnet 3 (`subnet-3`)
- Istio System Namespace (`istio-system`)
- ArgoCD Namespace (`argocd`)
- Monitoring Namespace (`monitoring`)
```

### 5. DON'T Use Long Descriptive Labels
```
❌ WRONG:
- VPC: `eks-prod-vpc` (10.0.0.0/16)
- EKS Cluster: `prod-cluster` (v1.28, 3-10 nodes)

✅ CORRECT:
- Production VPC (`eks-prod-vpc`)
- EKS Production Cluster (`prod-cluster`)
```

### 6. DON'T Mix References and Resources
```
❌ WRONG (mixing module references with resources):
- module.vpc
- eks-charts.github
- kubernetes.github
- Services: 10+

✅ CORRECT (actual infrastructure resources only):
- Main VPC (`module.vpc.id`)
- EKS Cluster (`eks-prod`)
```

## 📋 Quality Checklist

Before generating MD, verify:
- [ ] Each resource is on its own line
- [ ] Each resource has format: `- Name (id)`
- [ ] No aggregated lists (no commas, no "X+")
- [ ] No nested bullets (flat list only)
- [ ] Relationship IDs match exactly resource IDs
- [ ] Relationship IDs are wrapped in backticks
- [ ] Clear section headers (Network, Compute, Data, Identity, Kubernetes)
- [ ] Cloud Stack specified at top

## 🎯 Perfect Example (Copy This Structure):

```markdown
# AWS EKS Production Architecture

## Infrastructure Components

### Cloud Stack:
AWS

### Network Layer
- Main VPC (`aws_vpc.main`)
- Internet Gateway (`aws_internet_gateway.igw`)
- Public Subnet 1 (`aws_subnet.public[0]`)
- Public Subnet 2 (`aws_subnet.public[1]`)
- Private Subnet 1 (`aws_subnet.private[0]`)
- Private Subnet 2 (`aws_subnet.private[1]`)
- Application Load Balancer (`aws_lb.app`)
- ALB Security Group (`aws_security_group.alb`)

### Compute Layer
- EKS Cluster (`aws_eks_cluster.main`)
- EKS Node Group (`aws_eks_node_group.main`)
- Node Security Group (`aws_security_group.nodes`)

### Identity & Access
- EKS Cluster IAM Role (`aws_iam_role.eks_cluster`)
- Node IAM Role (`aws_iam_role.eks_nodes`)

### Kubernetes Workloads
- Production Namespace (`k8s-namespace-prod`)
- Frontend Deployment (`k8s-deploy-frontend`)
- Backend Deployment (`k8s-deploy-backend`)
- Frontend Service (`k8s-svc-frontend`)
- Backend Service (`k8s-svc-backend`)

## Relationships
1. `aws_vpc.main` → `aws_internet_gateway.igw` — attached
2. `aws_vpc.main` → `aws_subnet.public[0]` — contains
3. `aws_vpc.main` → `aws_subnet.public[1]` — contains
4. `aws_subnet.public[0]` → `aws_lb.app` — hosts load balancer
5. `aws_security_group.alb` → `aws_lb.app` — secures
6. `aws_iam_role.eks_cluster` → `aws_eks_cluster.main` — assumed by
7. `aws_iam_role.eks_nodes` → `aws_eks_node_group.main` — assumed by
8. `aws_eks_cluster.main` → `k8s-namespace-prod` — hosts namespace
9. `k8s-namespace-prod` → `k8s-deploy-frontend` — contains
10. `k8s-namespace-prod` → `k8s-deploy-backend` — contains
11. `k8s-deploy-frontend` → `k8s-svc-frontend` — exposes
12. `k8s-deploy-backend` → `k8s-svc-backend` — exposes
```

---

# Summary: The Golden Rules

1. **ONE resource = ONE line** (no aggregation, no commas, no "X+")
2. **Format**: `- Name (id)` - simple and consistent
3. **Flat list** - no nested bullets, no sub-items
4. **Clear sections** - Network, Compute, Data, Identity, Kubernetes
5. **Exact IDs in relationships** - use same IDs wrapped in backticks
6. **Short clear names** - "Public Subnet 1" not "Public Subnets: subnet-1, subnet-2..."

**This template = contract between your MD generator and this diagram tool**
