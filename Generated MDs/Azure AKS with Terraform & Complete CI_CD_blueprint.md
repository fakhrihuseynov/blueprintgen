# Deployable Resources — Diagram (current)

## Infrastructure Components

### Cloud Stack:
Azure

### Network Layer
- Virtual Network (`azurerm_virtual_network.aks_vnet`)
- Subnet (`azurerm_subnet.public`)
- Subnet (`azurerm_subnet.private`)

### Compute Layer
- AKS Cluster (`azurerm_kubernetes_cluster.aks`)

### Kubernetes Workloads
- Kubernetes Deployment
- Kubernetes Service

## Relationships
1. 10.0 → azurerm_virtual_network.aks_vnet — depends on
2. azurerm_virtual_network.aks_vnet → azurerm_subnet.public — provides address space
3. 10.0 → azurerm_subnet.public — depends on
4. azurerm_virtual_network.aks_vnet → azurerm_subnet.private — provides address space
5. 10.0 → azurerm_subnet.private — depends on
6. Virtual Network (`azurerm_virtual_network.aks_vnet`) → AKS Cluster (`azurerm_kubernetes_cluster.aks`) — network isolation
7. Subnet (`azurerm_subnet.public`) → AKS Cluster (`azurerm_kubernetes_cluster.aks`) — provides network addressing
8. Subnet (`azurerm_subnet.private`) → AKS Cluster (`azurerm_kubernetes_cluster.aks`) — provides network addressing
9. AKS Cluster (`azurerm_kubernetes_cluster.aks`) → Kubernetes Deployment — hosts workload
10. AKS Cluster (`azurerm_kubernetes_cluster.aks`) → Kubernetes Service — hosts workload
