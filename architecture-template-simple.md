# Quick Architecture Template

> Minimal template for quick diagram generation

## Infrastructure

### Network
- VPC for network isolation
- Public and Private Subnets

### Compute  
- EC2 instances for web servers
- EKS cluster for containerized applications

### Kubernetes
- Deployments: backend, frontend, worker
- Services: expose pods internally
- Ingress: route external traffic

### Database
- RDS PostgreSQL for application data
- ElastiCache Redis for caching

### Storage
- S3 bucket for static assets

### Monitoring
- Prometheus for metrics
- Grafana for dashboards

## Connections
1. Users access application through Load Balancer
2. Load Balancer routes to Kubernetes Ingress
3. Ingress forwards to Services
4. Services route to Deployments (Pods)
5. Pods connect to RDS database
6. Prometheus monitors all components
