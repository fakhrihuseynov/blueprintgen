# Deployable Resources — Diagram (current)

## Infrastructure Components

### Network Layer
- Main VPC (`aws_vpc.this`)
- Internet Gateway (`aws_internet_gateway.igw`)
- Public Route Table (`aws_route_table.public`)
- Public Subnet 0 (`aws_subnet.public[0]`)
- Public Subnet 1 (`aws_subnet.public[1]`)
- Route Table Association (subnet 0) (`aws_route_table_association.public[0]`)
- Route Table Association (subnet 1) (`aws_route_table_association.public[1]`)
- Workers Security Group (`aws_security_group.workers`)

### Compute Layer
- EKS Control Plane (`aws_eks_cluster.this`)
- EKS Node Group (`aws_eks_node_group.ng`)

### Identity & Access
- EKS Cluster Role (`aws_iam_role.eks_cluster`)
- Node Instance Role (`aws_iam_role.node`)
- Cluster Policy Attachment (`aws_iam_role_policy_attachment.cluster`)
- Node Worker Policy Attachment (`aws_iam_role_policy_attachment.node_worker`)
- Node EC2 Policy Attachment (`aws_iam_role_policy_attachment.node_ec2`)
- Node CNI Policy Attachment (`aws_iam_role_policy_attachment.node_cni`)

### Kubernetes Workloads
- Deployment: `nginx-deployment` (3 replicas) — namespace `my-namespace`

## Relationships
1. `aws_vpc.this` → `aws_internet_gateway.igw` — attached
2. `aws_vpc.this` → `aws_route_table.public` — contains
3. `aws_vpc.this` → `aws_subnet.public[0]` — contains
4. `aws_vpc.this` → `aws_subnet.public[1]` — contains
5. `aws_route_table.public` → `aws_route_table_association.public[0]` — associated with
6. `aws_route_table.public` → `aws_route_table_association.public[1]` — associated with
7. `aws_subnet.public[0]` → `aws_route_table_association.public[0]` — association target
8. `aws_subnet.public[1]` → `aws_route_table_association.public[1]` — association target
9. `aws_security_group.workers` → `aws_eks_node_group.ng` — used by
10. `aws_iam_role.eks_cluster` → `aws_eks_cluster.this` — assumed by
11. `aws_iam_role.node` → `aws_eks_node_group.ng` — assumed by
12. `aws_eks_cluster.this` → `nginx-deployment` — hosts Kubernetes workloads
13. `aws_eks_node_group.ng` → `nginx-deployment` — runs pods for the deployment
