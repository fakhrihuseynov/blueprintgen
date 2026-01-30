// Icon Validator Module
// Validates AI-generated icon paths and provides intelligent fallbacks

class IconValidator {
    constructor(availableIcons, cloudStack = null) {
        this.availableIcons = availableIcons;
        this.cloudStack = cloudStack;
    }

    // Runtime validation and auto-fix for icon paths
    validateAndFixIcons(json) {
        if (!json.nodes) return json;
        
        let fixCount = 0;
        json.nodes.forEach(node => {
            if (!node.icon) return;
            
            // Check if icon file exists in our loaded icons
            const iconExists = this.availableIcons.some(icon => 
                node.icon.includes(icon.name + '.svg')
            );
            
            if (!iconExists) {
                console.warn(`⚠️  Icon not found: ${node.icon} for "${node.label}"`);
                
                // Try to find fallback
                const fallback = this.findFallbackIcon(node);
                if (fallback) {
                    console.log(`   ✅ Using fallback: ${fallback}`);
                    node.icon = fallback;
                    fixCount++;
                } else {
                    console.log(`   ❌ No fallback found - removing icon field`);
                    delete node.icon;
                }
            }
        });
        
        if (fixCount > 0) {
            showToast('info', `Auto-fixed ${fixCount} invalid icon path(s)`);
        }
        
        return json;
    }

    // Smart fallback icon finder using pattern matching
    findFallbackIcon(node) {
        const label = (node.label || '').toLowerCase();
        const type = node.type || '';
        
        // CloudWatch Alarms (NEW - check General folder)
        if (/high.cpu|cpu.alarm|cpu.utilization/i.test(label)) {
            return './assets/icons/General/High-CPU-Alarm.svg';
        }
        if (/error.rate|error.alarm|5xx|4xx|api.error/i.test(label)) {
            return './assets/icons/General/Error-Rate-Alarm.svg';
        }
        if (/alarm|alert/i.test(label)) {
            return './assets/icons/General/Alert_48_Light.svg';
        }
        
        // Monitoring Resources (check Monitoring folder first, then General)
        if (/cloudwatch|cloud.watch/i.test(label)) {
            return './assets/icons/Monitoring/CloudWatch.svg';
        }
        if (/prometheus/i.test(label)) {
            return './assets/icons/Monitoring/prometheus.svg';
        }
        if (/grafana/i.test(label)) {
            return './assets/icons/Monitoring/grafana.svg';
        }
        if (/fluentbit|fluent.bit/i.test(label)) {
            return './assets/icons/Monitoring/fluentbit.svg';
        }
        if (/log|logs|logging/i.test(label)) {
            return './assets/icons/General/Logs_48_Light.svg';
        }
        if (/metric|metrics/i.test(label)) {
            return './assets/icons/General/Metrics_48_Light.svg';
        }
        
        // Container nodes fallback - EVERY container gets an icon!
        if (node.type === 'container') {
            // Logical grouping containers
            if (/network.layer|network.tier/i.test(label)) {
                return './assets/icons/General/Folder_48_Light.svg';
            }
            if (/compute.tier|compute.layer/i.test(label)) {
                return './assets/icons/General/Folder_48_Light.svg';
            }
            if (/data.layer|data.tier|database.layer/i.test(label)) {
                return './assets/icons/General/Folder_48_Light.svg';
            }
            if (/production|staging|development|environment/i.test(label)) {
                return './assets/icons/General/Folder_48_Light.svg';
            }
            if (/deployment|kubernetes.deployment/i.test(label)) {
                return './assets/icons/Kubernetes/deploy.svg';
            }
            if (/service|kubernetes.service/i.test(label)) {
                return './assets/icons/Kubernetes/svc.svg';
            }
            // Default container fallback
            return './assets/icons/General/Folder_48_Light.svg';
        }
        
        // Azure-specific resources (when Cloud Stack is Azure)
        if (this.cloudStack === 'Azure') {
            // Azure Kubernetes/AKS
            if (/kubernetes|aks/i.test(label)) {
                return this.findAzureIcon('Kubernetes-Services', 'containers') || 
                       this.findAzureIcon('Kubernetes-Services', 'compute');
            }
            // Azure Virtual Network
            if (/virtual.network|vnet/i.test(label)) {
                return this.findAzureIcon('Virtual-Networks', 'networking');
            }
            // Azure Subnet
            if (/subnet/i.test(label)) {
                return this.findAzureIcon('Subnet', 'networking');
            }
            // Azure Storage Account
            if (/storage.account|storage/i.test(label)) {
                return this.findAzureIcon('Storage-Accounts', 'storage');
            }
            // Azure Database/SQL
            if (/sql|database|cosmos/i.test(label)) {
                return this.findAzureIcon('SQL-Database', 'databases') ||
                       this.findAzureIcon('Azure-Cosmos-DB', 'databases');
            }
            // Azure Container Registry
            if (/container.registry|acr/i.test(label)) {
                return this.findAzureIcon('Container-Registries', 'containers');
            }
            // Azure App Service
            if (/app.service|web.app/i.test(label)) {
                return this.findAzureIcon('App-Services', 'app services');
            }
        }
        
        // Azure resource prefix detection (azurerm_)
        if (/azure|azurerm/i.test(label)) {
            if (/kubernetes|aks/i.test(label)) {
                return this.findAzureIcon('Kubernetes-Services', 'containers');
            }
            if (/virtual.network|vnet/i.test(label)) {
                return this.findAzureIcon('Virtual-Networks', 'networking');
            }
            if (/subnet/i.test(label)) {
                return this.findAzureIcon('Subnet', 'networking');
            }
        }
        
        // IAM/Security/Identity Resources (only if not Azure)
        if (this.cloudStack !== 'Azure' && /role|policy|iam|identity|access|user|permission/i.test(label)) {
            return './assets/icons/AWS/Security-Identity-Compliance/Identity-and-Access-Management.svg';
        }
        
        // Networking Resources (AWS fallback - only if not Azure)
        if (this.cloudStack !== 'Azure' && /vpc|subnet|route|gateway|network|internet/i.test(label)) {
            return './assets/icons/AWS/Networking-Content-Delivery/Virtual-Private-Cloud.svg';
        }
        
        // Security Group / Firewall (prefer AWS icons)
        if (/security.group|sg/i.test(label)) {
            return './assets/icons/AWS/Security-Identity-Compliance/Network-Firewall.svg';
        }
        if (/nacl|network.acl/i.test(label)) {
            return './assets/icons/AWS/Security-Identity-Compliance/Network-Firewall.svg';
        }
        if (/waf|web.application.firewall/i.test(label)) {
            return './assets/icons/AWS/Security-Identity-Compliance/WAF.svg';
        }
        if (/shield/i.test(label)) {
            return './assets/icons/AWS/Security-Identity-Compliance/Shield.svg';
        }
        if (/firewall/i.test(label)) {
            // Generic firewall - check if AWS Firewall Manager exists, else use General
            return './assets/icons/AWS/Security-Identity-Compliance/Firewall-Manager.svg';
        }
        
        // Kubernetes Resources
        if (/deployment/i.test(label)) return './assets/icons/Kubernetes/deploy.svg';
        if (/\bservice\b/i.test(label) && !/^aws/i.test(label)) return './assets/icons/Kubernetes/svc.svg';
        if (/\bpod\b/i.test(label)) return './assets/icons/Kubernetes/pod.svg';
        if (/ingress/i.test(label)) return './assets/icons/Kubernetes/ing.svg';
        if (/configmap/i.test(label)) return './assets/icons/Kubernetes/cm.svg';
        if (/secret/i.test(label)) return './assets/icons/Kubernetes/secret.svg';
        
        // Generic Fallbacks by Type (updated paths without Res_ prefix)
        if (type === 'compute') return './assets/icons/General/Server_48_Light.svg';
        if (type === 'database' || type === 'storage') return './assets/icons/General/Database_48_Light.svg';
        if (type === 'network') return './assets/icons/General/Internet_48_Light.svg';
        
        return null;
    }

    // Check if specific icon exists
    iconExists(iconPath) {
        return this.availableIcons.some(icon => 
            iconPath.includes(icon.name + '.svg')
        );
    }

    // Get icon by name (fuzzy search)
    findIconByName(name) {
        const nameLower = name.toLowerCase();
        return this.availableIcons.find(icon => 
            icon.name.toLowerCase().includes(nameLower)
        );
    }
    
    // Find Azure icon by name and category
    findAzureIcon(iconName, category) {
        const icon = this.availableIcons.find(icon => 
            icon.category === 'Azure' && 
            icon.subcategory === category &&
            icon.name === iconName
        );
        return icon ? icon.path : null;
    }
}
