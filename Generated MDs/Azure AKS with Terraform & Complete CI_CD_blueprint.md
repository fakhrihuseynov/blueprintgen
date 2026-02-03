# Azure AKS Production Architecture

## Infrastructure Components

### Cloud Stack:
Azure

### Network Layer
- Main VPC (`azurerm_virtual_network.aks_vnet`)
- Public Subnet 1 (`azurerm_subnet.public[0]`)
- Private Subnet 1 (`azurerm_subnet.private[0]`)
- Ingress Subnet 1 (`azurerm_subnet.ingress[0]`)

### Compute Layer
- AKS Cluster (`azurerm_kubernetes_cluster.aks_cluster`)
- Blue Node Pool (`azurerm_kubernetes_cluster_node_pool.blue`)
- Green Node Pool (`azurerm_kubernetes_cluster_node_pool.green`)

### Identity & Access
- AKS Cluster IAM Role (`azurerm_role_assignment.cluster_role`)
- Node IAM Role (`azurerm_role_assignment.node_role`)
- ALB Controller IAM Role (`azurerm_role_assignment.alb_controller_role`)

### Kubernetes Workloads
- Default Namespace (`k8s-namespace-default`)
- Sample App Deployment (`k8s-deploy-sample-app`)
- Sample App Service (`k8s-svc-sample-app`)
- Ingress Controller (`k8s-ingress-controller`)

## Relationships
1. `azurerm_virtual_network.aks_vnet` → `azurerm_subnet.public[0]` — contains
2. `azurerm_virtual_network.aks_vnet` → `azurerm_subnet.private[0]` — contains
3. `azurerm_virtual_network.aks_vnet` → `azurerm_subnet.ingress[0]` — contains
4. `azurerm_kubernetes_cluster.aks_cluster` → `azurerm_subnet.private[0]` — uses
5. `azurerm_kubernetes_cluster_node_pool.blue` → `azurerm_kubernetes_cluster.aks_cluster` — part of
6. `azurerm_kubernetes_cluster_node_pool.green` → `azurerm_kubernetes_cluster.aks_cluster` — part of
7. `azurerm_role_assignment.cluster_role` → `azurerm_kubernetes_cluster.aks_cluster` — assigned to
8. `azurerm_role_assignment.node_role` → `azurerm_kubernetes_cluster_node_pool.blue` — assigned to
9. `azurerm_role_assignment.node_role` → `azurerm_kubernetes_cluster_node_pool.green` — assigned to
10. `azurerm_role_assignment.alb_controller_role` → `k8s-ingress-controller` — assigned to
11. `k8s-namespace-default` → `k8s-deploy-sample-app` — contains
12. `k8s-deploy-sample-app` → `k8s-svc-sample-app` — exposes