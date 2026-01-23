# Sample Architecture Description

## Project Overview
This is a production web application hosted on AWS with EKS cluster for container orchestration.

## Infrastructure Components

### Network Layer
- **VPC**: Main virtual private cloud with CIDR 10.0.0.0/16
- **Internet Gateway**: Provides internet connectivity to the VPC
- **Public Subnets**: Two public subnets in different availability zones
- **Route Tables**: Route table for public subnet routing

### Compute Layer
- **EKS Cluster**: Kubernetes cluster for running containerized applications
- **Node Groups**: Auto-scaling group of EC2 instances for EKS worker nodes
- **Security Groups**: Firewall rules for worker nodes

### IAM & Security
- **EKS Cluster Role**: IAM role for EKS cluster management
- **Node Instance Role**: IAM role for worker node instances
- **Policy Attachments**: Various policy attachments for cluster and node permissions

### Application Components
- **Backend Deployment**: Flask API running in containers
- **Frontend Deployment**: React SPA running in containers
- **Ingress Controller**: AWS Load Balancer Controller for routing traffic
- **Services**: Kubernetes services for internal communication

## Resource Relationships

1. VPC contains the Internet Gateway
2. VPC contains Public Subnets
3. Route Tables are associated with Public Subnets
4. EKS Cluster is deployed in the VPC
5. Node Groups are part of EKS Cluster
6. Security Groups control traffic to Node Groups
7. IAM Roles are assumed by EKS Cluster and Node Groups
8. Backend and Frontend Deployments run on Node Groups
9. Ingress Controller routes traffic to Services
10. Services load balance traffic to Deployments
