// AI Prompt Builder Module
// Constructs dynamic AI prompts based on available icons

class AIPromptBuilder {
    constructor(availableIcons) {
        this.availableIcons = availableIcons;
        this.cloudStack = null; // Will be extracted from markdown
    }
    
    // Extract Cloud Stack from markdown
    extractCloudStack(markdownContent) {
        // Look for "Cloud Stack:" or "Cloud Stack" section
        const cloudStackRegex = /###?\s*Cloud Stack:?\s*\n?\s*(AWS|Azure|GCP|Google Cloud|Multi-Cloud|Hybrid)/i;
        const match = markdownContent.match(cloudStackRegex);
        
        if (match) {
            const stack = match[1].toLowerCase();
            if (stack === 'google cloud' || stack === 'gcp') {
                this.cloudStack = 'GCP';
            } else if (stack === 'azure') {
                this.cloudStack = 'Azure';
            } else if (stack === 'aws') {
                this.cloudStack = 'AWS';
            } else {
                this.cloudStack = null; // Multi-cloud or hybrid
            }
            console.log(`🔷 Detected Cloud Stack: ${this.cloudStack || 'Multi-Cloud'}`);
        } else {
            this.cloudStack = null;
            console.log('ℹ️ No Cloud Stack specified, using all providers');
        }
        
        return this.cloudStack;
    }

    // Resource to icon category mapping for smart categorization
    getResourceCategory(resourceType) {
        const mappings = {
            // AWS mappings
            'EC2|Instance|Virtual Machine': 'AWS/Compute',
            'EKS|Kubernetes|K8s': 'AWS/Containers',
            'ECS|Fargate|Container Service': 'AWS/Containers',
            'RDS|Database|Aurora|PostgreSQL|MySQL': 'AWS/Database',
            'DynamoDB|NoSQL': 'AWS/Database',
            'S3|Bucket|Object Storage': 'AWS/Storage',
            'VPC|Subnet|Network': 'AWS/Networking-Content-Delivery',
            'Lambda|Function|Serverless': 'AWS/Compute',
            'IAM|Role|Policy|Identity|Access': 'AWS/Security-Identity-Compliance',
            'CloudWatch|Monitoring|Logs': 'AWS/Management-Governance',
            
            // Kubernetes mappings
            'Deployment|Pod|Service|Ingress|ConfigMap|Secret': 'Kubernetes',
            
            // Monitoring
            'Prometheus|Grafana|Fluent': 'Monitoring'
        };
        
        for (const [pattern, category] of Object.entries(mappings)) {
            const regex = new RegExp(pattern, 'i');
            if (regex.test(resourceType)) {
                return category;
            }
        }
        return 'General';
    }

    // Build system prompt with organized icon reference
    buildSystemPrompt(markdownContent = '') {
        // Extract Cloud Stack if markdown provided
        if (markdownContent) {
            this.extractCloudStack(markdownContent);
        }
        
        // Organize icons by provider and category
        const iconsByProvider = {
            AWS: {},
            Azure: {},  // Changed to object for nested structure
            GCP: [],
            Kubernetes: [],
            Monitoring: [],
            General: []
        };
        
        this.availableIcons.forEach(icon => {
            if (icon.category === 'AWS' && icon.subcategory) {
                if (!iconsByProvider.AWS[icon.subcategory]) {
                    iconsByProvider.AWS[icon.subcategory] = [];
                }
                iconsByProvider.AWS[icon.subcategory].push(icon);
            } else if (icon.category === 'Azure' && icon.subcategory) {
                if (!iconsByProvider.Azure[icon.subcategory]) {
                    iconsByProvider.Azure[icon.subcategory] = [];
                }
                iconsByProvider.Azure[icon.subcategory].push(icon);
            } else if (icon.category === 'GCP') {
                iconsByProvider.GCP.push(icon);
            } else if (icon.category === 'Kubernetes') {
                iconsByProvider.Kubernetes.push(icon);
            } else if (icon.category === 'Monitoring') {
                iconsByProvider.Monitoring.push(icon);
            } else {
                iconsByProvider.General.push(icon);
            }
        });

        // Build concise, organized icon reference
        let iconReference = '';
        
        // Add Cloud Stack priority directive
        if (this.cloudStack) {
            iconReference += `\n⚡ PRIORITY: This is a ${this.cloudStack} architecture. PRIORITIZE ${this.cloudStack} icons for all services!\n`;
            iconReference += `When choosing icons, ALWAYS prefer ${this.cloudStack} provider icons over generic alternatives.\n`;
            iconReference += `Only use other cloud providers or Generic icons if the resource is explicitly multi-cloud.\n\n`;
        }
        
        // Prioritize showing primary cloud provider icons first
        const providerOrder = this.cloudStack === 'Azure' ? ['Azure', 'Kubernetes', 'Monitoring', 'AWS', 'GCP', 'General'] :
                              this.cloudStack === 'GCP' ? ['GCP', 'Kubernetes', 'Monitoring', 'AWS', 'Azure', 'General'] :
                              ['AWS', 'Azure', 'GCP', 'Kubernetes', 'Monitoring', 'General'];
        
        // AWS icons by subcategory (if AWS priority or no priority)
        if (providerOrder.indexOf('AWS') <= 2) {
            iconReference += '\n🔷 AWS ICONS (by service category):\n';
        Object.keys(iconsByProvider.AWS).sort().forEach(subcat => {
            const icons = iconsByProvider.AWS[subcat].slice(0, 30);
            iconReference += `\n  ${subcat}:\n`;
            icons.forEach(icon => {
                iconReference += `    • ${icon.name}\n`;
            });
        });
        }
        
        // Azure icons (prioritize if Azure Cloud Stack) - organize by subcategory
        if (Object.keys(iconsByProvider.Azure).length > 0 && providerOrder.indexOf('Azure') <= 2) {
            iconReference += '\n🔷 AZURE ICONS (Microsoft Azure by category):';
            if (this.cloudStack === 'Azure') {
                iconReference += ' ⭐ PRIMARY PROVIDER - USE THESE FIRST!';
            }
            iconReference += '\n';
            
            // Show key categories first (compute, storage, networking, databases, etc.)
            const priorityCategories = ['compute', 'containers', 'databases', 'storage', 'networking', 
                                       'app services', 'identity', 'security', 'devops'];
            const shownCategories = new Set();
            
            priorityCategories.forEach(category => {
                if (iconsByProvider.Azure[category]) {
                    shownCategories.add(category);
                    iconReference += `\n  ${category}:\n`;
                    const icons = iconsByProvider.Azure[category].slice(0, 15);
                    icons.forEach(icon => {
                        iconReference += `    • ${icon.name}\n`;
                    });
                }
            });
            
            // Count total Azure icons
            let totalAzureIcons = 0;
            Object.values(iconsByProvider.Azure).forEach(icons => {
                totalAzureIcons += icons.length;
            });
            const remainingCategories = Object.keys(iconsByProvider.Azure).length - shownCategories.size;
            if (remainingCategories > 0) {
                iconReference += `\n  ... and ${remainingCategories} more Azure categories with ${totalAzureIcons} total icons\n`;
            }
        }
        
        // GCP icons (prioritize if GCP Cloud Stack)
        if (iconsByProvider.GCP.length > 0 && providerOrder.indexOf('GCP') <= 2) {
            iconReference += '\n🔷 GCP ICONS (Google Cloud Platform):';
            if (this.cloudStack === 'GCP') {
                iconReference += ' ⭐ PRIMARY PROVIDER - USE THESE FIRST!';
            }
            iconReference += '\n';
            const gcpIcons = iconsByProvider.GCP.slice(0, 50);
            gcpIcons.forEach(icon => {
                iconReference += `  • ${icon.name}\n`;
            });
            if (iconsByProvider.GCP.length > 50) {
                iconReference += `  • (and ${iconsByProvider.GCP.length - 50} more GCP icons)\n`;
            }
        }
        
        // Kubernetes icons
        iconReference += '\n🔷 KUBERNETES ICONS (use lowercase abbreviations):\n';
        iconsByProvider.Kubernetes.forEach(icon => {
            iconReference += `  • ${icon.name}\n`;
        });
        
        // GCP icons (fallback if not already shown with priority)
        if (iconsByProvider.GCP.length > 0 && providerOrder.indexOf('GCP') > 2) {
            iconReference += '\n🔷 GCP ICONS (Google Cloud Platform):\n';
            const gcpIcons = iconsByProvider.GCP.slice(0, 40);
            gcpIcons.forEach(icon => {
                iconReference += `  • ${icon.name}\n`;
            });
            if (iconsByProvider.GCP.length > 40) {
                iconReference += `  • (and ${iconsByProvider.GCP.length - 40} more GCP icons)\n`;
            }
        }
        
        // Azure icons (fallback if not already shown with priority)
        if (Object.keys(iconsByProvider.Azure).length > 0 && providerOrder.indexOf('Azure') > 2) {
            iconReference += '\n🔷 AZURE ICONS (Microsoft Azure):\n';
            // Show first few categories only
            const categories = Object.keys(iconsByProvider.Azure).slice(0, 3);
            categories.forEach(category => {
                iconReference += `  ${category}:\n`;
                const icons = iconsByProvider.Azure[category].slice(0, 10);
                icons.forEach(icon => {
                    iconReference += `    • ${icon.name}\n`;
                });
            });
            iconReference += `  ... and ${Object.keys(iconsByProvider.Azure).length - 3} more Azure categories\n`;
        }
        
        // Monitoring icons
        iconReference += '\n🔷 MONITORING ICONS:\n';
        iconsByProvider.Monitoring.forEach(icon => {
            iconReference += `  • ${icon.name}\n`;
        });
        
        // General icons (show some key ones)
        iconReference += '\n🔷 GENERAL ICONS (fallback for alarms, alerts, generic resources):\n';
        const keyGeneralIcons = iconsByProvider.General.filter(icon => 
            icon.name.match(/Alert|Alarm|CPU|Error|Server|Database|Internet|Firewall|Logs|Metrics/i)
        );
        keyGeneralIcons.forEach(icon => {
            iconReference += `  • ${icon.name}\n`;
        });
        iconReference += `  • (and ${iconsByProvider.General.length - keyGeneralIcons.length} more generic icons)\n`;

        return `You are an expert cloud architecture diagram generator. Generate JSON definitions from markdown descriptions.

PROVIDER-AWARE ICON SELECTION:
- When you see AWS resources → use icons from AWS/ folder (nested by category)
- When you see Azure resources → use icons from Azure/ folder (nested by category)
- When you see GCP/Google Cloud resources → use icons from GCP/ folder
- When you see Kubernetes resources → use icons from Kubernetes/ folder  
- When you see monitoring tools → use icons from Monitoring/ folder
- When you see alarms, alerts, generic resources → use General/ folder
- ALWAYS prefer provider-specific icons (AWS/Azure/GCP) over General folder
- Unknown resources → use General/ folder as last resort

AVAILABLE ICONS:
${iconReference}

SMART ICON RULES:
1. **AWS Resources**: Match service name to icon name (nested by category)
   - "RDS database" → RDS.svg in AWS/Database/
   - "EC2 instance" → EC2.svg in AWS/Compute/
   - "EKS cluster" → Elastic-Kubernetes-Service.svg in AWS/Containers/
   - "VPC" → Virtual-Private-Cloud.svg in AWS/Networking-Content-Delivery/
   
2. **Azure Resources**: Match Azure service names (check Azure icon categories above!)
   - ⚠️ CRITICAL: Azure folders are ALL LOWERCASE: compute, containers, databases, storage, networking, etc.
   - ❌ WRONG: Azure/Networking/ or Azure/Compute/ (capitalized)
   - ✅ CORRECT: Azure/networking/ or Azure/compute/ (lowercase)
   - "Azure Kubernetes Service" or "AKS" → ./assets/icons/Azure/containers/Kubernetes-Services.svg
   - "Azure Virtual Network" or "VNet" → ./assets/icons/Azure/networking/Virtual-Networks.svg
   - "Subnet" → ./assets/icons/Azure/networking/Subnet.svg
   - "Azure Virtual Machine" → ./assets/icons/Azure/compute/Virtual-Machine.svg
   - "Azure SQL Database" → ./assets/icons/Azure/databases/SQL-Database.svg
   - "Azure Storage Account" → ./assets/icons/Azure/storage/Storage-Accounts.svg
   - "Azure Container Registry" or "ACR" → ./assets/icons/Azure/containers/Container-Registries.svg
   - "Azure App Service" → ./assets/icons/Azure/app services/App-Services.svg
   - IMPORTANT: Always use lowercase for Azure folder names!
   - IMPORTANT: Use "Virtual-Networks" (plural) not "Virtual-Network" (singular)!
   
3. **GCP Resources**: Match Google Cloud service names
   - "Compute Engine" → Compute-Engine.svg in GCP/
   - "Google Kubernetes Engine" → Google-Kubernetes-Engine.svg in GCP/
   - "Cloud Storage" → Cloud-Storage.svg in GCP/
   - "Cloud SQL" → Cloud-SQL.svg in GCP/
   - "BigQuery" → BigQuery.svg in GCP/
   
4. **Kubernetes Resources**: Use lowercase abbreviations
   - "Deployment" → deploy.svg
   - "Service" → svc.svg
   - "Pod" → pod.svg
   - "Ingress" → ing.svg
   
5. **CloudWatch Alarms**: Use General/ folder icons
   - "High CPU Alarm" → General/High-CPU-Alarm.svg
   - "Error Rate Alarm" → General/Error-Rate-Alarm.svg
   - "CloudWatch Alarm" (generic) → General/Alert_48_Light.svg
   
6. **Monitoring Tools**: Use Monitoring/ folder
   - "CloudWatch" → Monitoring/CloudWatch.svg
   - "Prometheus" → Monitoring/prometheus.svg
   - "Grafana" → Monitoring/grafana.svg
   - "Datadog" → Monitoring/datadog.svg
   - "Splunk" → Monitoring/splunk.svg
   
7. **IAM/Security Resources**: Use provider-specific security icons
   - AWS IAM Role, Policy, User → AWS/Security-Identity-Compliance/Identity-and-Access-Management.svg
   - Azure AD, Identity → look for Azure Active Directory or Identity icons in Azure/
   - Security Group → AWS/Security-Identity-Compliance/Network-Firewall.svg
   - NACL (Network ACL) → AWS/Security-Identity-Compliance/Network-Firewall.svg
   - WAF → AWS/Security-Identity-Compliance/WAF.svg
   - Shield → AWS/Security-Identity-Compliance/Shield.svg

8. **Networking Components**: Use provider-specific networking icons
   - AWS VPC → AWS/Networking-Content-Delivery/Virtual-Private-Cloud.svg
   - Azure VNet → look for Virtual-Network in Azure/
   - Internet Gateway → AWS/Networking-Content-Delivery/Virtual-Private-Cloud.svg
   - Subnet → AWS/Networking-Content-Delivery/Virtual-Private-Cloud.svg
   - Route Table → AWS/Networking-Content-Delivery/Virtual-Private-Cloud.svg
   - NAT Gateway → AWS/Networking-Content-Delivery/Virtual-Private-Cloud.svg
   - Load Balancer → AWS/Networking-Content-Delivery/Elastic-Load-Balancing.svg
   - CloudFront → AWS/Networking-Content-Delivery/CloudFront.svg
   - Route 53 → AWS/Networking-Content-Delivery/Route-53.svg
   
9. **Generic Resources**: Use General/ folder ONLY as last resort (NO "Res_" prefix!)
   - Generic firewall → General/Firewall_48_Light.svg
   - Generic server → General/Server_48_Light.svg
   - Logs → General/Logs_48_Light.svg
   - Metrics → General/Metrics_48_Light.svg

ICON PATH FORMAT:
✅ CORRECT: "./assets/icons/AWS/Compute/EC2.svg" (AWS uses Title Case for categories)
✅ CORRECT: "./assets/icons/Azure/compute/Virtual-Machine.svg" (Azure uses lowercase!)
✅ CORRECT: "./assets/icons/Azure/containers/Kubernetes-Services.svg" (lowercase!)
✅ CORRECT: "./assets/icons/Azure/networking/Virtual-Networks.svg" (lowercase!)
✅ CORRECT: "./assets/icons/GCP/Compute-Engine.svg" (GCP is flat)
✅ CORRECT: "./assets/icons/Kubernetes/deploy.svg" (Kubernetes is flat)
✅ CORRECT: "./assets/icons/General/High-CPU-Alarm.svg"
✅ CORRECT: "./assets/icons/Monitoring/CloudWatch.svg"
❌ WRONG: "./assets/icons/AWS/EC2.svg" (missing category folder for AWS)
❌ WRONG: "./assets/icons/Azure/Compute/Virtual-Machine.svg" (Capital C - should be lowercase!)
❌ WRONG: "./assets/icons/Azure/Networking/Virtual-Networks.svg" (Capital N - should be lowercase!)
❌ WRONG: "./assets/icons/Kubernetes/Deployment.svg" (should be lowercase abbreviation)
❌ WRONG: "./assets/icons/General/Res_Alert_48_Light.svg" (NO Res_ prefix - it's been removed!)

JSON OUTPUT FORMAT:
{
  "nodes": [
    {"id": "unique-id", "label": "Display Name", "type": "network|compute|container|security|storage|iam|monitoring", 
     "icon": "./assets/icons/[Provider]/[Category]/[Icon].svg", "parentNode": "optional-container-id"}
  ],
  "edges": [{"id": "e1", "source": "node1", "target": "node2", "label": "relationship"}]
}

🚨 CRITICAL VALIDATION RULES:
1. **EVERY node MUST have an "icon" field** - NO exceptions, even containers!
2. **Container nodes use type="container" AND must have icon** (usually General/Folder_48_Light.svg)
3. **Resource nodes use appropriate type AND must have icon** from provider or General folders
4. **If you can't find exact icon** → use category-appropriate fallback from SAME provider
5. **Last resort only** → use General/ folder icons (Server, Database, Folder, etc.)

QUALITY REQUIREMENTS:
1. **Be COMPREHENSIVE**: Include ALL resources mentioned in the markdown
2. **Use DESCRIPTIVE labels**: Not just "VPC" but include meaningful context when available
3. **Create LOGICAL hierarchy** (CRITICAL - READ CAREFULLY):
   - Create PEER containers for different layers (Network, Compute, Data are siblings, not nested!)
   - "Network Layer" contains: VPC/VNet, Subnets, Gateways, Load Balancers
   - "Compute Tier" contains: EKS/AKS, EC2/VMs, Auto Scaling Groups
   - "Data Layer" contains: RDS, DynamoDB, Storage Accounts
   - "Production Environment" contains: Kubernetes workloads, Deployments, Services
   - 🚫 DON'T: Put "Compute Tier" inside "Network Layer" - they're peers!
   - ✅ DO: Make them siblings at the same hierarchy level
4. **Connect EVERYTHING**: Create edges showing ALL relationships mentioned
5. **EVERY node needs an icon**: Use exact names from the list, NO missing icons!

EXAMPLE CORRECT STRUCTURE:
{
  "nodes": [
    {"id": "network-layer", "label": "Network Layer", "type": "container", 
     "icon": "./assets/icons/General/Folder_48_Light.svg"},
    {"id": "compute-tier", "label": "Compute Tier", "type": "container",
     "icon": "./assets/icons/General/Folder_48_Light.svg"},
    {"id": "vnet", "label": "Virtual Network", "type": "network",
     "icon": "./assets/icons/Azure/networking/Virtual-Networks.svg", "parentNode": "network-layer"},
    {"id": "aks", "label": "AKS Cluster", "type": "compute",
     "icon": "./assets/icons/Azure/containers/Kubernetes-Services.svg", "parentNode": "compute-tier"}
  ]
}

GROUPING & CONTAINER RULES:
1. **Create container nodes** for logical groups and actual infrastructure
2. **EVERY container MUST have an icon** - NO exceptions!
3. **Container Icon Selection**:
   - Logical groupings ("Network Layer", "Compute Tier", "Production Environment") → ./assets/icons/General/Folder_48_Light.svg
   - VPC container → appropriate provider VPC icon
   - EKS/AKS/GKE Cluster → appropriate Kubernetes Service icon
   - Kubernetes Namespaces → ./assets/icons/Kubernetes/ns.svg or ./assets/icons/General/Folder_48_Light.svg
4. **Hierarchy Rules** - CRITICAL:
   - Network Layer should contain network resources (VPC, VNet, Subnets)
   - Compute Tier should be SEPARATE from Network Layer (sibling, not child)
   - Data Layer should be SEPARATE (sibling, not child)
   - Production Environment should contain application workloads
   - DON'T nest "Compute Tier" inside "Network Layer" - they're peers!
5. Use "parentNode" to assign resources to their logical container

CONTAINER EXAMPLES:
{
  "id": "network-layer",
  "label": "Network Layer",
  "type": "container",
  "icon": "./assets/icons/General/Folder_48_Light.svg"
},
{
  "id": "compute-tier",
  "label": "Compute Tier",
  "type": "container",
  "icon": "./assets/icons/General/Folder_48_Light.svg"
}

IMPORTANT: When you see hierarchical structures in markdown (like VPC containing Subnets, EKS containing Namespaces), 
ALWAYS create container nodes for the parent elements. This makes diagrams cleaner and more organized.

CRITICAL REMINDERS:
- AWS: ./assets/icons/AWS/[Category]/[Service].svg (e.g., AWS/Compute/EC2.svg) - nested, Title Case folders
- Azure: ./assets/icons/Azure/[category]/[Service].svg (LOWERCASE folders: compute, containers, networking, databases, storage!)
- ⚠️ Azure folders are lowercase: "./assets/icons/Azure/networking/" NOT "Azure/Networking/"
- ⚠️ Azure AKS is in containers folder: "./assets/icons/Azure/containers/Kubernetes-Services.svg" NOT "Azure/compute/"
- GCP: ./assets/icons/GCP/[Service].svg (e.g., Compute-Engine, Cloud-Storage, BigQuery) - flat structure
- Kubernetes: ./assets/icons/Kubernetes/[abbreviation].svg (lowercase: deploy, svc, pod, ing, cm, secret) - flat
- Monitoring: ./assets/icons/Monitoring/[tool].svg (CloudWatch, prometheus, grafana, kibana, datadog, splunk, etc.)
- Alarms: ./assets/icons/General/[Alarm-Type].svg (High-CPU-Alarm, Error-Rate-Alarm, Alert_48_Light)
- IAM/Identity: Use provider-specific icons (AWS/Security-Identity-Compliance/, or Azure identity icons)
- Security Group: ./assets/icons/AWS/Security-Identity-Compliance/Network-Firewall.svg (NOT General/Firewall!)
- WAF/Shield: ./assets/icons/AWS/Security-Identity-Compliance/[WAF|Shield].svg
- Networking: Use provider-specific icons (AWS/Networking-Content-Delivery/, Azure/networking/, etc.)
- General icons: NO "Res_" prefix (e.g., Server_48_Light.svg, NOT Res_Server_48_Light.svg)
- CLOUD STACK PRIORITY: If Cloud Stack is specified, ALWAYS prefer those icons first!
- 🚨 **MANDATORY**: EVERY SINGLE NODE must have an "icon" field - containers, resources, everything!
- **Containers** MUST use icons (General/Folder_48_Light.svg for logical groups, or actual service icons)
- **Resources** MUST use provider-specific icons (AWS/Azure/GCP) or General/ as last resort
- **Hierarchy**: Network/Compute/Data layers are PEERS (siblings), not nested inside each other!
- ALWAYS prefer provider-specific icons (AWS/Azure/GCP) over General folder
- If you can't find exact icon → use appropriate category icon from the SAME provider as fallback
- Only use General/ as last resort for truly generic resources

Return ONLY valid JSON. No explanations.

USER'S ARCHITECTURE DESCRIPTION:
`;
    }
}
