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

    // Resource to icon category mapping
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

    buildSystemPrompt() {
        // Organize icons by provider and category
        const iconsByProvider = {
            AWS: {},
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
        
        // Monitoring icons
        iconReference += '\n🔷 MONITORING ICONS:\n';
        iconsByProvider.Monitoring.forEach(icon => {
            iconReference += `  • ${icon.name}\n`;
        });

        return `You are an expert cloud architecture diagram generator. Generate JSON definitions from markdown descriptions.

PROVIDER-AWARE ICON SELECTION:
- When you see AWS resources → use icons from AWS/ folder
- When you see Kubernetes resources → use icons from Kubernetes/ folder  
- When you see monitoring tools → use icons from Monitoring/ folder
- Unknown resources → use General/ folder

AVAILABLE ICONS:
${iconReference}

SMART ICON RULES:
1. **AWS Resources**: Match service name to icon name
   - "RDS database" → RDS.svg in AWS/Database/
   - "EC2 instance" → EC2.svg in AWS/Compute/
   - "EKS cluster" → Elastic-Kubernetes-Service.svg in AWS/Containers/
   
2. **Kubernetes Resources**: Use lowercase abbreviations
   - "Deployment" → deploy.svg
   - "Service" → svc.svg
   - "Pod" → pod.svg
   - "Ingress" → ing.svg
   
3. **IAM/Security**: ALL use Identity-and-Access-Management.svg
   - IAM Role, Policy, User → AWS/Security-Identity-Compliance/Identity-and-Access-Management.svg

4. **Networking without specific icons**: Use Virtual-Private-Cloud.svg
   - Internet Gateway, Subnet, Route Table → AWS/Networking-Content-Delivery/Virtual-Private-Cloud.svg
   
5. **Generic Resources**: Use General/ folder
   - Security Group → General/Res_Firewall_48_Light.svg
   - Generic server → General/Res_Server_48_Light.svg

ICON PATH FORMAT:
✅ CORRECT: "./assets/icons/AWS/Compute/EC2.svg"
✅ CORRECT: "./assets/icons/Kubernetes/deploy.svg"
❌ WRONG: "./assets/icons/AWS/EC2.svg" (missing category folder)
❌ WRONG: "./assets/icons/Kubernetes/Deployment.svg" (should be lowercase abbreviation)

JSON OUTPUT FORMAT:
{
  "nodes": [
    {"id": "unique-id", "label": "Display Name", "type": "network|compute|container|security|storage|iam", 
     "icon": "./assets/icons/[Provider]/[Category]/[Icon].svg", "parentNode": "optional-container-id"}
  ],
  "edges": [{"id": "e1", "source": "node1", "target": "node2", "label": "relationship"}]
}

GROUPING: Create container nodes (type="container", NO icon) for logical groups. Use "parentNode" to assign resources.

CRITICAL REMINDERS:
- AWS: ./assets/icons/AWS/[Category]/[Service].svg
- Kubernetes: ./assets/icons/Kubernetes/[abbreviation].svg (lowercase: deploy, svc, pod, ing, cm, secret)
- IAM/Identity: ALL use ./assets/icons/AWS/Security-Identity-Compliance/Identity-and-Access-Management.svg
- Networking (IGW, Subnet, Route Table): Use ./assets/icons/AWS/Networking-Content-Delivery/Virtual-Private-Cloud.svg
- Security Group: ./assets/icons/General/Res_Firewall_48_Light.svg
- Unknown resources: omit icon field or use General/Res_*_48_Light.svg

Return ONLY valid JSON. No explanations.

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
            
            // Validate and auto-fix icon paths
            this.generatedJSON = this.validateAndFixIcons(this.generatedJSON);
            
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

    // Smart fallback icon finder
    findFallbackIcon(node) {
        const label = (node.label || '').toLowerCase();
        const type = node.type || '';
        
        // IAM/Security/Identity
        if (/role|policy|iam|identity|access|user|permission/i.test(label)) {
            return './assets/icons/AWS/Security-Identity-Compliance/Identity-and-Access-Management.svg';
        }
        
        // Networking
        if (/vpc|subnet|route|gateway|network|internet/i.test(label)) {
            return './assets/icons/AWS/Networking-Content-Delivery/Virtual-Private-Cloud.svg';
        }
        
        // Security Group / Firewall
        if (/security.group|firewall|sg|acl|nacl/i.test(label)) {
            const firewall = this.availableIcons.find(i => i.name.includes('Firewall'));
            return firewall ? firewall.path : './assets/icons/General/Res_Firewall_48_Light.svg';
        }
        
        // Kubernetes resources
        if (/deployment/i.test(label)) return './assets/icons/Kubernetes/deploy.svg';
        if (/\bservice\b/i.test(label) && !/^aws/i.test(label)) return './assets/icons/Kubernetes/svc.svg';
        if (/\bpod\b/i.test(label)) return './assets/icons/Kubernetes/pod.svg';
        if (/ingress/i.test(label)) return './assets/icons/Kubernetes/ing.svg';
        if (/configmap/i.test(label)) return './assets/icons/Kubernetes/cm.svg';
        if (/secret/i.test(label)) return './assets/icons/Kubernetes/secret.svg';
        
        // Generic by type
        if (type === 'compute') return './assets/icons/General/Res_Server_48_Light.svg';
        if (type === 'database' || type === 'storage') return './assets/icons/General/Res_Database_48_Light.svg';
        if (type === 'network') return './assets/icons/General/Res_Internet_48_Light.svg';
        
        return null;
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
