# Test Architecture

## Network Layer
- **VPC**: Virtual Private Cloud for network isolation
- **Internet Gateway**: Provides internet connectivity to public subnets

## Compute Layer
- **EC2 Instances**: Virtual machines running application servers
- **EKS Cluster**: Kubernetes cluster for containerized workloads

## Kubernetes Resources
- **Pods**: Running containerized applications
- **Services**: Load balancing for pods
- **Ingress**: External access to services

## Database Layer
- **RDS**: PostgreSQL relational database for persistent data

## Monitoring
- **Prometheus**: Metrics collection and monitoring

## Relationships
1. VPC contains Internet Gateway
2. VPC contains EC2 Instances
3. EKS Cluster runs in VPC
4. Pods run in EKS Cluster
5. Services expose Pods
6. Ingress routes to Services
7. Application connects to RDS
8. Prometheus monitors all components
