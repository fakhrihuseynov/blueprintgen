// AI Prompt Builder Module
// Constructs dynamic AI prompts based on available icons

class AIPromptBuilder {
    constructor(availableIcons) {
        this.availableIcons = availableIcons;
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
    buildSystemPrompt() {
        // Organize icons by provider and category
        const iconsByProvider = {
            AWS: {},
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
        
        // AWS icons by subcategory
        iconReference += '\n🔷 AWS ICONS (by service category):\n';
        Object.keys(iconsByProvider.AWS).sort().forEach(subcat => {
            const icons = iconsByProvider.AWS[subcat].slice(0, 30);
            iconReference += `\n  ${subcat}:\n`;
            icons.forEach(icon => {
                iconReference += `    • ${icon.name}\n`;
            });
        });
        
        // Kubernetes icons
        iconReference += '\n🔷 KUBERNETES ICONS (use lowercase abbreviations):\n';
        iconsByProvider.Kubernetes.forEach(icon => {
            iconReference += `  • ${icon.name}\n`;
        });
        
        // GCP icons (show first 40, grouped logically)
        iconReference += '\n🔷 GCP ICONS (Google Cloud Platform):\n';
        const gcpIcons = iconsByProvider.GCP.slice(0, 40);
        gcpIcons.forEach(icon => {
            iconReference += `  • ${icon.name}\n`;
        });
        if (iconsByProvider.GCP.length > 40) {
            iconReference += `  • (and ${iconsByProvider.GCP.length - 40} more GCP icons)\n`;
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
- When you see AWS resources → use icons from AWS/ folder
- When you see GCP/Google Cloud resources → use icons from GCP/ folder
- When you see Kubernetes resources → use icons from Kubernetes/ folder  
- When you see monitoring tools → use icons from Monitoring/ folder
- When you see alarms, alerts, generic resources → use General/ folder
- ALWAYS prefer provider-specific icons (AWS/GCP) over General folder
- Unknown resources → use General/ folder as last resort

AVAILABLE ICONS:
${iconReference}

SMART ICON RULES:
1. **AWS Resources**: Match service name to icon name
   - "RDS database" → RDS.svg in AWS/Database/
   - "EC2 instance" → EC2.svg in AWS/Compute/
   - "EKS cluster" → Elastic-Kubernetes-Service.svg in AWS/Containers/
   - "VPC" → Virtual-Private-Cloud.svg in AWS/Networking-Content-Delivery/
   
2. **GCP Resources**: Match Google Cloud service names
   - "Compute Engine" → Compute-Engine.svg in GCP/
   - "Google Kubernetes Engine" → Google-Kubernetes-Engine.svg in GCP/
   - "Cloud Storage" → Cloud-Storage.svg in GCP/
   - "Cloud SQL" → Cloud-SQL.svg in GCP/
   - "BigQuery" → BigQuery.svg in GCP/
   
3. **Kubernetes Resources**: Use lowercase abbreviations
   - "Deployment" → deploy.svg
   - "Service" → svc.svg
   - "Pod" → pod.svg
   - "Ingress" → ing.svg
   
4. **CloudWatch Alarms**: Use General/ folder icons
   - "High CPU Alarm" → General/High-CPU-Alarm.svg
   - "Error Rate Alarm" → General/Error-Rate-Alarm.svg
   - "CloudWatch Alarm" (generic) → General/Alert_48_Light.svg
   
5. **Monitoring Tools**: Use Monitoring/ folder
   - "CloudWatch" → Monitoring/CloudWatch.svg
   - "Prometheus" → Monitoring/prometheus.svg
   - "Grafana" → Monitoring/grafana.svg
   - "Datadog" → Monitoring/datadog.svg
   - "Splunk" → Monitoring/splunk.svg
   
6. **IAM/Security Resources**: ALWAYS use AWS Security icons
   - IAM Role, Policy, User → AWS/Security-Identity-Compliance/Identity-and-Access-Management.svg
   - Security Group → AWS/Security-Identity-Compliance/Network-Firewall.svg
   - NACL (Network ACL) → AWS/Security-Identity-Compliance/Network-Firewall.svg
   - WAF → AWS/Security-Identity-Compliance/WAF.svg
   - Shield → AWS/Security-Identity-Compliance/Shield.svg

7. **Networking Components**: Use specific AWS networking icons when possible
   - VPC → AWS/Networking-Content-Delivery/Virtual-Private-Cloud.svg
   - Internet Gateway → AWS/Networking-Content-Delivery/Virtual-Private-Cloud.svg
   - Subnet → AWS/Networking-Content-Delivery/Virtual-Private-Cloud.svg
   - Route Table → AWS/Networking-Content-Delivery/Virtual-Private-Cloud.svg
   - NAT Gateway → AWS/Networking-Content-Delivery/Virtual-Private-Cloud.svg
   - Load Balancer → AWS/Networking-Content-Delivery/Elastic-Load-Balancing.svg
   - CloudFront → AWS/Networking-Content-Delivery/CloudFront.svg
   - Route 53 → AWS/Networking-Content-Delivery/Route-53.svg
   
8. **Generic Resources**: Use General/ folder ONLY as last resort (NO "Res_" prefix!)
   - Generic firewall → General/Firewall_48_Light.svg
   - Generic server → General/Server_48_Light.svg
   - Logs → General/Logs_48_Light.svg
   - Metrics → General/Metrics_48_Light.svg

ICON PATH FORMAT:
✅ CORRECT: "./assets/icons/AWS/Compute/EC2.svg"
✅ CORRECT: "./assets/icons/Kubernetes/deploy.svg"
✅ CORRECT: "./assets/icons/General/High-CPU-Alarm.svg"
✅ CORRECT: "./assets/icons/Monitoring/CloudWatch.svg"
❌ WRONG: "./assets/icons/AWS/EC2.svg" (missing category folder)
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

QUALITY REQUIREMENTS:
1. **Be COMPREHENSIVE**: Include ALL resources mentioned in the markdown
2. **Use DESCRIPTIVE labels**: Not just "VPC" but include meaningful context when available
3. **Create LOGICAL grouping**: Use parentNode to organize resources hierarchically
   - ALWAYS create container nodes for logical boundaries (VPC, EKS Cluster, Namespaces, etc.)
   - Group related resources together (all EC2 in one container, all databases in another)
   - Container examples: "Network Layer", "Compute Tier", "Data Layer", "Production Environment"
4. **Connect EVERYTHING**: Create edges showing relationships between related resources
5. **Match EXACT icon names**: Use the icon names from the list above, don't invent new ones

GROUPING: Create container nodes (type="container", NO icon) for logical groups like "Production Environment", "Network Layer", etc. Use "parentNode" to assign child resources.

IMPORTANT: When you see hierarchical structures in markdown (like VPC containing Subnets, EKS containing Namespaces), 
ALWAYS create container nodes for the parent elements. This makes diagrams cleaner and more organized.

CRITICAL REMINDERS:
- AWS: ./assets/icons/AWS/[Category]/[Service].svg
- GCP: ./assets/icons/GCP/[Service].svg (e.g., Compute-Engine, Cloud-Storage, BigQuery)
- Kubernetes: ./assets/icons/Kubernetes/[abbreviation].svg (lowercase: deploy, svc, pod, ing, cm, secret)
- Monitoring: ./assets/icons/Monitoring/[tool].svg (CloudWatch, prometheus, grafana, kibana, datadog, splunk, etc.)
- Alarms: ./assets/icons/General/[Alarm-Type].svg (High-CPU-Alarm, Error-Rate-Alarm, Alert_48_Light)
- IAM/Identity: ./assets/icons/AWS/Security-Identity-Compliance/Identity-and-Access-Management.svg
- Security Group: ./assets/icons/AWS/Security-Identity-Compliance/Network-Firewall.svg (NOT General/Firewall!)
- WAF/Shield: ./assets/icons/AWS/Security-Identity-Compliance/[WAF|Shield].svg
- Networking (VPC, IGW, Subnet, Route Table, NAT): ./assets/icons/AWS/Networking-Content-Delivery/Virtual-Private-Cloud.svg
- Load Balancer: ./assets/icons/AWS/Networking-Content-Delivery/Elastic-Load-Balancing.svg
- General icons: NO "Res_" prefix (e.g., Server_48_Light.svg, NOT Res_Server_48_Light.svg)
- ALWAYS prefer provider-specific icons (AWS/GCP) over General folder
- If you can't find exact AWS icon → use appropriate AWS category icon as fallback
- Only use General/ as last resort for truly generic resources

Return ONLY valid JSON. No explanations.

USER'S ARCHITECTURE DESCRIPTION:
`;
    }
}
