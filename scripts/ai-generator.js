// AI Generator Module for Blueprint Generator
// Integrates with Ollama (qwen2.5-coder:7) to generate architecture JSON from markdown

class AIGenerator {
    constructor() {
        this.ollamaUrl = 'http://localhost:11434/api/generate';
        this.model = 'qwen2.5-coder:7b';  // Corrected model name
        this.availableIcons = [];
        this.markdownFiles = [];  // Store multiple markdown files
        this.generatedJSON = null;
        
        this.init();
    }

    async init() {
        await this.loadAvailableIcons();
        this.setupEventListeners();
    }

    async loadAvailableIcons() {
        try {
            const allIcons = [];
            
            // Load AWS icons from nested categories
            const awsCategories = ['Compute', 'Containers', 'Database', 'Networking-Content-Delivery', 
                                   'Storage', 'Security-Identity-Compliance', 'Analytics', 'Machine-Learning',
                                   'Management-Governance', 'Developer-Tools'];
            
            for (const category of awsCategories) {
                try {
                    const response = await fetch(`./assets/icons/AWS/${category}/`);
                    const text = await response.text();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(text, 'text/html');
                    const links = doc.querySelectorAll('a');
                    
                    const icons = Array.from(links)
                        .map(link => link.getAttribute('href'))
                        .filter(href => href && href.endsWith('.svg'))
                        .map(filename => ({
                            name: filename.replace('.svg', ''),
                            path: `./assets/icons/AWS/${category}/${filename}`,
                            extension: 'svg',
                            category: 'AWS',
                            subcategory: category
                        }));
                    
                    allIcons.push(...icons);
                } catch (error) {
                    console.warn(`Could not load AWS/${category}:`, error);
                }
            }
            
            // Load Kubernetes, Monitoring, General (flat structure, all SVG)
            const flatFolders = ['Kubernetes', 'Monitoring', 'General'];
            for (const folder of flatFolders) {
                try {
                    const response = await fetch(`./assets/icons/${folder}/`);
                    const text = await response.text();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(text, 'text/html');
                    const links = doc.querySelectorAll('a');
                    
                    const icons = Array.from(links)
                        .map(link => link.getAttribute('href'))
                        .filter(href => href && href.endsWith('.svg'))
                        .map(filename => ({
                            name: filename.replace('.svg', ''),
                            path: `./assets/icons/${folder}/${filename}`,
                            extension: 'svg',
                            category: folder
                        }));
                    
                    allIcons.push(...icons);
                } catch (error) {
                    console.warn(`Could not load ${folder}:`, error);
                }
            }
            
            this.availableIcons = allIcons;
            console.log(`Loaded ${this.availableIcons.length} available icons (all SVG format)`);
            this.displayAvailableIcons();
        } catch (error) {
            console.error('Error loading icons:', error);
            this.availableIcons = this.getKnownIcons();
            this.displayAvailableIcons();
        }
    }

    getKnownIcons() {
        // Fallback list with categorized icons (all SVG now)
        const awsIcons = [
            {cat: 'Containers', icons: ['Elastic-Kubernetes-Service', 'Elastic-Container-Service', 'Elastic-Container-Registry', 'Fargate']},
            {cat: 'Compute', icons: ['EC2', 'Lambda', 'Elastic-Beanstalk', 'Lightsail']},
            {cat: 'Database', icons: ['RDS', 'DynamoDB', 'ElastiCache', 'Aurora']},
            {cat: 'Networking-Content-Delivery', icons: ['Virtual-Private-Cloud', 'CloudFront', 'Route-53', 'Elastic-Load-Balancing']},
            {cat: 'Storage', icons: ['Simple-Storage-Service', 'Elastic-Block-Store', 'Elastic-File-System', 'Glacier']}
        ];
        
        const allIcons = [];
        
        // AWS icons with nested structure
        awsIcons.forEach(({cat, icons}) => {
            icons.forEach(name => {
                allIcons.push({
                    name: name,
                    path: `./assets/icons/AWS/${cat}/${name}.svg`,
                    extension: 'svg',
                    category: 'AWS',
                    subcategory: cat
                });
            });
        });
        
        // Kubernetes icons
        ['deploy', 'svc', 'pod', 'ns', 'ing', 'cm', 'secret'].forEach(name => {
            allIcons.push({
                name: name,
                path: `./assets/icons/Kubernetes/${name}.svg`,
                extension: 'svg',
                category: 'Kubernetes'
            });
        });
        
        // Monitoring icons
        ['grafana', 'prometheus', 'fluentbit'].forEach(name => {
            allIcons.push({
                name: name,
                path: `./assets/icons/Monitoring/${name}.svg`,
                extension: 'svg',
                category: 'Monitoring'
            });
        });
        
        // General icons
        ['Res_User', 'Res_Database', 'Res_Server', 'Res_Git-Repository'].forEach(name => {
            allIcons.push({
                name: name,
                path: `./assets/icons/General/${name}_48_Light.svg`,
                extension: 'svg',
                category: 'General'
            });
        });
        
        return allIcons;
    }

    displayAvailableIcons() {
        const iconGrid = document.getElementById('icon-grid');
        const iconCount = document.getElementById('icon-count');
        
        if (!iconGrid) return;
        
        // Get unique icon names
        const uniqueIcons = [...new Set(this.availableIcons.map(i => i.name))];
        iconCount.textContent = uniqueIcons.length;
        
        iconGrid.innerHTML = '';
        uniqueIcons.slice(0, 50).forEach(iconName => {
            const icon = this.availableIcons.find(i => i.name === iconName);
            const iconEl = document.createElement('div');
            iconEl.className = 'icon-item';
            iconEl.title = icon.name;
            iconEl.innerHTML = `
                <img src="${icon.path}" alt="${icon.name}" onerror="this.style.display='none'">
                <span>${icon.name}</span>
            `;
            iconGrid.appendChild(iconEl);
        });
    }

    setupEventListeners() {
        // AI Generator button
        const aiGeneratorBtn = document.getElementById('ai-generator-btn');
        if (aiGeneratorBtn) {
            aiGeneratorBtn.addEventListener('click', () => this.showAIGenerator());
        }

        // Close button
        const closeBtn = document.getElementById('close-ai-generator');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideAIGenerator());
        }

        // Markdown file upload
        const mdFileUpload = document.getElementById('md-file-upload');
        if (mdFileUpload) {
            // Ensure multiple attribute is set
            mdFileUpload.setAttribute('multiple', 'multiple');
            mdFileUpload.addEventListener('change', (e) => this.handleMarkdownUpload(e));
            console.log('✅ Multiple file upload configured:', mdFileUpload.hasAttribute('multiple'));
        } else {
            console.error('❌ File input #md-file-upload not found!');
        }

        // Clear markdown
        const clearMdBtn = document.getElementById('clear-md');
        if (clearMdBtn) {
            clearMdBtn.addEventListener('click', () => this.clearMarkdown());
        }

        // Generate JSON button
        const generateBtn = document.getElementById('generate-json-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateJSON());
        }

        // Copy JSON
        const copyJsonBtn = document.getElementById('copy-json-btn');
        if (copyJsonBtn) {
            copyJsonBtn.addEventListener('click', () => this.copyJSON());
        }

        // Download JSON
        const downloadJsonBtn = document.getElementById('download-json-btn');
        if (downloadJsonBtn) {
            downloadJsonBtn.addEventListener('click', () => this.downloadJSON());
        }

        // Visualize JSON
        const visualizeBtn = document.getElementById('visualize-json-btn');
        if (visualizeBtn) {
            visualizeBtn.addEventListener('click', () => this.visualizeJSON());
        }
    }

    showAIGenerator() {
        document.getElementById('welcome-screen')?.style.setProperty('display', 'none');
        document.getElementById('diagram-container')?.style.setProperty('display', 'none');
        document.getElementById('ai-generator-screen')?.style.setProperty('display', 'flex');
    }

    hideAIGenerator() {
        document.getElementById('ai-generator-screen')?.style.setProperty('display', 'none');
        document.getElementById('welcome-screen')?.style.setProperty('display', 'flex');
    }

    handleMarkdownUpload(event) {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        // Read all uploaded files
        const readPromises = Array.from(files).map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve({ name: file.name, content: e.target.result });
                reader.onerror = reject;
                reader.readAsText(file);
            });
        });

        Promise.all(readPromises).then(fileContents => {
            // ACCUMULATE files instead of replacing
            this.markdownFiles = [...this.markdownFiles, ...fileContents];
            this.displayMarkdown(this.markdownFiles);
            document.getElementById('generate-json-btn').disabled = false;
            
            // Show count of uploaded files
            showToast('success', `Added ${fileContents.length} file(s). Total: ${this.markdownFiles.length} file(s)`);
        }).catch(error => {
            console.error('Error reading files:', error);
            showToast('error', 'Failed to read markdown files: ' + error.message);
        });
        
        event.target.value = '';
    }

    displayMarkdown(fileContents) {
        const mdPreview = document.getElementById('md-preview');
        const mdContent = document.getElementById('md-content');
        const fileCountBadge = document.getElementById('file-count-badge');
        
        if (mdPreview && mdContent) {
            // Display all files with headers
            let displayText = '';
            fileContents.forEach((file, index) => {
                displayText += `\n═══════════════════════════════════════\n`;
                displayText += `📄 File ${index + 1}: ${file.name}\n`;
                displayText += `═══════════════════════════════════════\n\n`;
                displayText += file.content;
                displayText += '\n\n';
            });
            
            mdContent.textContent = displayText;
            mdPreview.style.display = 'block';
            
            // Update file count badge
            if (fileCountBadge) {
                fileCountBadge.textContent = `${fileContents.length} file${fileContents.length !== 1 ? 's' : ''} loaded`;
            }
        }
    }

    clearMarkdown() {
        this.markdownFiles = [];
        const mdPreview = document.getElementById('md-preview');
        const mdContent = document.getElementById('md-content');
        const fileCountBadge = document.getElementById('file-count-badge');
        const generateBtn = document.getElementById('generate-json-btn');
        
        if (mdPreview) mdPreview.style.display = 'none';
        if (mdContent) mdContent.textContent = '';
        if (fileCountBadge) fileCountBadge.textContent = '0 files loaded';
        if (generateBtn) generateBtn.disabled = true;
        
        showToast('success', 'Cleared all markdown files');
    }

    buildSystemPrompt() {
        // Group icons by category with their full paths
        const iconsByCategory = {};
        this.availableIcons.forEach(icon => {
            const category = icon.category || 'Other';
            if (!iconsByCategory[category]) {
                iconsByCategory[category] = [];
            }
            iconsByCategory[category].push(icon);
        });

        // Build organized icon list with full paths - show MORE icons
        let iconList = '';
        Object.keys(iconsByCategory).sort().forEach(category => {
            iconList += `\n${category}:\n`;
            const icons = iconsByCategory[category]
                .filter((icon, index, self) => 
                    index === self.findIndex(i => i.path === icon.path))
                .slice(0, 50); // Increased from 30 to 50 per category
            icons.forEach(icon => {
                iconList += `  ${icon.name} → ${icon.path}\n`;
            });
            if (iconsByCategory[category].length > 50) {
                iconList += `  ... and ${iconsByCategory[category].length - 50} more\n`;
            }
        });

        return `You are an expert in generating architecture diagram definitions in JSON format.

⚠️ CRITICAL RULES - READ CAREFULLY:
1. You MUST ONLY use paths that appear in the "AVAILABLE ICONS WITH PATHS" list below
2. DO NOT create or guess icon paths - if you see "svc → ./assets/icons/Kubernetes/svc.svg", use EXACTLY that path
3. DO NOT capitalize icon names (WRONG: Service.svg, CORRECT: svc.svg)
4. DO NOT add words to paths (WRONG: Amazon-RDS.svg, CORRECT: RDS.svg)
5. If an icon doesn't exist in the list, use the closest match or omit the icon field

AVAILABLE ICONS WITH PATHS:
${iconList}

⚠️ IMPORTANT KUBERNETES NAMING:
- Deployment = deploy.svg (NOT Deployment.svg)
- Service = svc.svg (NOT Service.svg)
- Pod = pod.svg (NOT Pod.svg)
- Ingress = ing.svg (NOT Ingress.svg)
- ConfigMap = cm.svg (NOT ConfigMap.svg)
- All Kubernetes icons use lowercase abbreviations!

⚠️ IMPORTANT AWS NAMING:
- RDS database = RDS.svg (NOT Amazon-RDS.svg)
- VPC = Virtual-Private-Cloud.svg (NOT VPC.svg)
- S3 = Simple-Storage-Service.svg (NOT S3.svg)
- Use EXACT names from the list above!

⚠️ MONITORING:
- Prometheus = ./assets/icons/Monitoring/prometheus.svg (NOT Kubernetes/Prometheus.svg)
- Grafana = ./assets/icons/Monitoring/grafana.svg
- FluentBit = ./assets/icons/Monitoring/fluentbit.svg

🚫 ICONS THAT DO NOT EXIST - DO NOT USE THESE:
- Internet-Gateway.svg ❌ DOES NOT EXIST
- Subnet.svg ❌ DOES NOT EXIST
- Route-Table.svg ❌ DOES NOT EXIST
- NAT-Gateway.svg ❌ DOES NOT EXIST
- Security-Group.svg ❌ DOES NOT EXIST

FOR NETWORKING COMPONENTS WITHOUT ICONS:
- Internet Gateway → Use VPC icon OR omit "icon" field entirely
- Subnet → Use VPC icon OR omit "icon" field entirely
- Route Table → Omit "icon" field entirely
- NAT Gateway → Omit "icon" field entirely
- Security Group → Use General/Res_Firewall_48_Light.svg OR omit "icon"

ICON FOLDER STRUCTURE:
AWS icons are organized by service category:
- AWS/Compute/ - EC2, Lambda, Fargate, Batch, etc.
- AWS/Containers/ - Elastic-Kubernetes-Service, Elastic-Container-Service, Elastic-Container-Registry, etc.
- AWS/Database/ - RDS, DynamoDB, Aurora, ElastiCache, etc.
- AWS/Networking-Content-Delivery/ - VPC, CloudFront, Route-53, Elastic-Load-Balancing, API-Gateway, etc.
- AWS/Storage/ - Simple-Storage-Service, Elastic-Block-Store, Elastic-File-System, etc.
- AWS/Security-Identity-Compliance/ - Identity-and-Access-Management, Key-Management-Service, Secrets-Manager, etc.
- AWS/Analytics/ - Kinesis, Athena, Glue, EMR, etc.
- AWS/Machine-Learning/ - SageMaker, Bedrock, etc.
- AWS/Management-Governance/ - CloudWatch, CloudFormation, Systems-Manager, etc.
- AWS/Developer-Tools/ - CodePipeline, CodeBuild, CodeDeploy, etc.

Kubernetes icons (flat structure with abbreviations):
- deploy = Deployment, svc = Service, pod = Pod, ing = Ingress
- cm = ConfigMap, secret = Secret, pv = PersistentVolume, pvc = PersistentVolumeClaim
- hpa = HorizontalPodAutoscaler, sts = StatefulSet, ds = DaemonSet
- job = Job, cronjob = CronJob, sa = ServiceAccount, role = Role, rb = RoleBinding
- crb = ClusterRoleBinding, ns = Namespace, node = Node, rs = ReplicaSet
- netpol = NetworkPolicy, sc = StorageClass, ep = Endpoints, vol = Volume
- api = API Server, etcd = etcd, sched = Scheduler, kubelet = Kubelet
- control-plane = Control Plane, c-m = Controller Manager, k-proxy = Kube Proxy

Monitoring icons (flat): prometheus, grafana, fluentbit

General icons (flat, for generic resources):
- Res_Server, Res_Database, Res_Generic-Application, Res_Client, Res_User, Res_Users
- Res_Globe, Res_Internet, Res_Firewall, Res_Shield, Res_SSL-padlock
- Res_Data-Stream, Res_Data-Table, Res_Logs, Res_Metrics, Res_Alert
- Res_Document, Res_Documents, Res_Folder, Res_Folders, Res_Git-Repository
- Res_Source-Code, Res_JSON-Script, Res_Programming-Language, Res_SDK
- Res_Email, Res_Chat, Res_Forums, Res_Credentials, Res_SAML-token
- And more generic AWS architecture resource icons

ICON SELECTION GUIDE (USE THESE EXACT PATHS):

⚠️ COPY THESE PATHS EXACTLY - DO NOT MODIFY THEM!

AWS Services (EXACT paths):
  EKS → "./assets/icons/AWS/Containers/Elastic-Kubernetes-Service.svg"
  EC2 → "./assets/icons/AWS/Compute/EC2.svg"
  RDS → "./assets/icons/AWS/Database/RDS.svg"
  DynamoDB → "./assets/icons/AWS/Database/DynamoDB.svg"
  VPC → "./assets/icons/AWS/Networking-Content-Delivery/Virtual-Private-Cloud.svg"
  S3 → "./assets/icons/AWS/Storage/Simple-Storage-Service.svg"
  Lambda → "./assets/icons/AWS/Compute/Lambda.svg"
  Load Balancer → "./assets/icons/AWS/Networking-Content-Delivery/Elastic-Load-Balancing.svg"

Kubernetes (EXACT paths - note lowercase):
  Deployment → "./assets/icons/Kubernetes/deploy.svg"
  Service → "./assets/icons/Kubernetes/svc.svg"
  Pod → "./assets/icons/Kubernetes/pod.svg"
  Ingress → "./assets/icons/Kubernetes/ing.svg"
  ConfigMap → "./assets/icons/Kubernetes/cm.svg"
  Secret → "./assets/icons/Kubernetes/secret.svg"
  Namespace → "./assets/icons/Kubernetes/ns.svg"

Monitoring (EXACT paths):
  Prometheus → "./assets/icons/Monitoring/prometheus.svg"
  Grafana → "./assets/icons/Monitoring/grafana.svg"
  Fluent Bit → "./assets/icons/Monitoring/fluentbit.svg"

Generic (when nothing matches):
  Server → "./assets/icons/General/Res_Server_48_Light.svg"
  Database → "./assets/icons/General/Res_Database_48_Light.svg"
  Internet → "./assets/icons/General/Res_Internet_48_Light.svg"

⚠️ COMMON MISTAKES TO AVOID:
❌ "./assets/icons/Kubernetes/Service.svg" → ✅ "./assets/icons/Kubernetes/svc.svg"
❌ "./assets/icons/Kubernetes/Ingress.svg" → ✅ "./assets/icons/Kubernetes/ing.svg"
❌ "./assets/icons/AWS/Database/Amazon-RDS.svg" → ✅ "./assets/icons/AWS/Database/RDS.svg"
❌ "./assets/icons/Kubernetes/Prometheus.svg" → ✅ "./assets/icons/Monitoring/prometheus.svg"
❌ "./assets/icons/AWS/Networking-Content-Delivery/Internet-Gateway.svg" → Use VPC icon or omit
❌ "./assets/icons/AWS/Networking-Content-Delivery/Subnet.svg" → Use VPC icon or omit
  * User, person → "./assets/icons/General/Res_User.svg"
  * Internet, web → "./assets/icons/General/Res_Internet.svg"
  * Firewall, security → "./assets/icons/General/Res_Firewall.svg"
  * Logs → "./assets/icons/General/Res_Logs.svg"
  * Metrics → "./assets/icons/General/Res_Metrics.svg"

JSON STRUCTURE:
The JSON must have this exact structure:
{
  "nodes": [
    {
      "id": "unique-identifier",
      "label": "Display Name",
      "subtitle": "module.name or description",
      "type": "network|compute|container|security|storage|iam",
      "icon": "./assets/icons/AWS/[Category]/[Service].svg",
      "parentNode": "optional-container-id"  // Use this to group related resources
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "source-node-id",
      "target": "target-node-id",
      "label": "relationship description"
    }
  ]
}

GROUPING RELATED RESOURCES:
- **Create container nodes** for logical groupings (VPC, Kubernetes namespaces, modules)
- Container nodes should have type="container" and NO icon
- Related resources should reference the container via "parentNode"
- Common containers: VPC, Availability Zones, Namespaces, Security Groups

EXAMPLE WITH GROUPING:
{
  "nodes": [
    {"id": "vpc-container", "label": "VPC", "subtitle": "Production Environment", "type": "container"},
    {"id": "vpc", "label": "VPC", "subtitle": "module.vpc", "type": "network", "icon": "./assets/icons/AWS/Networking-Content-Delivery/Virtual-Private-Cloud.svg", "parentNode": "vpc-container"},
    {"id": "subnet-public", "label": "Public Subnet", "subtitle": "module.vpc", "type": "network", "icon": "./assets/icons/AWS/Networking-Content-Delivery/Virtual-Private-Cloud.svg", "parentNode": "vpc-container"},
    {"id": "eks-container", "label": "EKS Cluster", "subtitle": "Kubernetes", "type": "container"},
    {"id": "eks", "label": "EKS Control Plane", "subtitle": "module.eks", "type": "container", "icon": "./assets/icons/AWS/Containers/Elastic-Kubernetes-Service.svg", "parentNode": "eks-container"},
    {"id": "nodegroup", "label": "Node Group", "subtitle": "module.eks", "type": "compute", "icon": "./assets/icons/AWS/Compute/EC2.svg", "parentNode": "eks-container"}
  ],
  "edges": [
    {"id": "e1", "source": "vpc", "target": "subnet-public", "label": "contains"},
    {"id": "e2", "source": "vpc-container", "target": "eks-container", "label": "contains"}
  ]
}

INSTRUCTIONS:
1. **FIRST**: Check "AVAILABLE ICONS WITH PATHS" list above for exact icon paths
2. **ONLY** use icon paths that exist in that list - DO NOT create new paths
3. Read the markdown description carefully
4. **Identify logical groups** (VPC resources, EKS components, IAM policies, etc.)
5. **Create container nodes** for each group with dotted borders
4. Assign resources to containers using "parentNode"
5. **CRITICAL**: Use EXACT icon paths from the "AVAILABLE ICONS WITH PATHS" list above
6. **NEVER use .png extensions** - ALL icons MUST end with .svg
7. **NEVER create paths like "./assets/icons/vpc.png"** - Use full folder structure like "./assets/icons/AWS/Networking-Content-Delivery/VPC.svg"
8. Create meaningful IDs (lowercase, hyphenated)
9. Use types: network, compute, container, security, storage, iam
10. Define edges showing relationships
11. Return ONLY valid JSON, no explanations

⚠️ REAL EXAMPLES FROM ACTUAL ERRORS:

WRONG (DO NOT DO THIS):
❌ "icon": "./assets/icons/Kubernetes/Service.svg"
❌ "icon": "./assets/icons/Kubernetes/Ingress.svg"
❌ "icon": "./assets/icons/Kubernetes/Prometheus.svg"
❌ "icon": "./assets/icons/AWS/Database/Amazon-RDS.svg"
❌ "icon": "./assets/icons/AWS/Networking-Content-Delivery/Internet-Gateway.svg" (DOES NOT EXIST!)
❌ "icon": "./assets/icons/AWS/Networking-Content-Delivery/Subnet.svg" (DOES NOT EXIST!)
❌ "icon": "./assets/icons/AWS/Networking-Content-Delivery/Route-Table.svg" (DOES NOT EXIST!)

CORRECT (DO THIS INSTEAD):
✅ "icon": "./assets/icons/Kubernetes/svc.svg"
✅ "icon": "./assets/icons/Kubernetes/ing.svg"
✅ "icon": "./assets/icons/Monitoring/prometheus.svg"
✅ "icon": "./assets/icons/AWS/Database/RDS.svg"
✅ For Internet Gateway: {"id": "igw", "label": "Internet Gateway", "type": "network"} (NO icon field!)
✅ For Subnet: {"id": "subnet", "label": "Subnet", "icon": "./assets/icons/AWS/Networking-Content-Delivery/Virtual-Private-Cloud.svg"}
✅ For Route Table: {"id": "rt", "label": "Route Table", "type": "network"} (NO icon field!)

🔴 CRITICAL: If an icon doesn't exist in "AVAILABLE ICONS WITH PATHS", OMIT the "icon" field completely!

REMEMBER: Check the "AVAILABLE ICONS WITH PATHS" list at the top. Only use paths that appear in that list!

USER'S ARCHITECTURE DESCRIPTION:
`;
    }

    async generateJSON() {
        if (!this.markdownFiles || this.markdownFiles.length === 0) {
            showToast('error', 'Please upload markdown file(s) first');
            return;
        }

        const loadingIndicator = document.getElementById('loading-indicator');
        const jsonResult = document.getElementById('json-result');
        const generateBtn = document.getElementById('generate-json-btn');

        // Show loading
        loadingIndicator.style.display = 'flex';
        jsonResult.style.display = 'none';
        generateBtn.disabled = true;

        try {
            // Combine all markdown files into one prompt
            let combinedMarkdown = '';
            this.markdownFiles.forEach((file, index) => {
                combinedMarkdown += `\n\n### Source File ${index + 1}: ${file.name}\n\n`;
                combinedMarkdown += file.content;
            });
            
            const prompt = this.buildSystemPrompt() + '\n\n' + combinedMarkdown;
            
            console.log('Sending request to Ollama via proxy...');
            
            const response = await fetch('/api/ollama', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.model,
                    prompt: prompt,
                    stream: false,
                    options: {
                        temperature: 0.1,
                        top_p: 0.9
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Ollama API error: ${response.status}`);
            }

            const data = await response.json();
            console.log('Ollama response:', data);
            
            // Extract JSON from response
            let jsonText = data.response;
            
            // Try to extract JSON if wrapped in markdown code blocks
            const jsonMatch = jsonText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
            if (jsonMatch) {
                jsonText = jsonMatch[1];
            }
            
            // Parse and validate JSON
            this.generatedJSON = JSON.parse(jsonText);
            
            // Display the result
            this.displayGeneratedJSON(this.generatedJSON);
            
            showToast('success', 'JSON generated successfully!');
        } catch (error) {
            console.error('Error generating JSON:', error);
            showToast('error', 'Failed to generate JSON: ' + error.message);
            loadingIndicator.style.display = 'none';
        } finally {
            generateBtn.disabled = false;
        }
    }

    displayGeneratedJSON(json) {
        const jsonResult = document.getElementById('json-result');
        const jsonOutput = document.getElementById('json-output');
        const loadingIndicator = document.getElementById('loading-indicator');

        if (jsonOutput && jsonResult) {
            jsonOutput.textContent = JSON.stringify(json, null, 2);
            jsonResult.style.display = 'block';
            loadingIndicator.style.display = 'none';
        }
    }

    copyJSON() {
        if (!this.generatedJSON) return;

        const jsonText = JSON.stringify(this.generatedJSON, null, 2);
        navigator.clipboard.writeText(jsonText).then(() => {
            showToast('success', 'JSON copied to clipboard!');
        }).catch(err => {
            showToast('error', 'Failed to copy JSON');
            console.error('Copy error:', err);
        });
    }

    downloadJSON() {
        if (!this.generatedJSON) return;

        const jsonText = JSON.stringify(this.generatedJSON, null, 2);
        const blob = new Blob([jsonText], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'architecture-diagram.json';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        
        showToast('success', 'JSON file downloaded!');
    }

    visualizeJSON() {
        if (!this.generatedJSON) return;

        // Hide AI generator and load the diagram
        this.hideAIGenerator();
        loadDiagram(this.generatedJSON);
    }
}

// Initialize AI Generator when DOM is ready
let aiGenerator;
document.addEventListener('DOMContentLoaded', () => {
    aiGenerator = new AIGenerator();
});
