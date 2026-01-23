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
            // Fetch the assets/icons directory listing
            const response = await fetch('./assets/icons/');
            const text = await response.text();
            
            // Parse HTML to extract icon filenames
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const links = doc.querySelectorAll('a');
            
            this.availableIcons = Array.from(links)
                .map(link => link.getAttribute('href'))
                .filter(href => href && (href.endsWith('.png') || href.endsWith('.svg')))
                .map(filename => ({
                    name: filename.replace(/\.(png|svg)$/, ''),
                    path: `./assets/icons/${filename}`,
                    extension: filename.endsWith('.png') ? 'png' : 'svg'
                }));
            
            console.log(`Loaded ${this.availableIcons.length} available icons`);
            this.displayAvailableIcons();
        } catch (error) {
            console.error('Error loading icons:', error);
            // Fallback: use known icons from your files
            this.availableIcons = this.getKnownIcons();
            this.displayAvailableIcons();
        }
    }

    getKnownIcons() {
        // Fallback list based on your actual files
        const iconNames = [
            'alb', 'app-config', 'argocd', 'backend-deploy', 'backend-svc',
            'cloudfront-cdn', 'cloudwatch-logs', 'cloudwatch', 'cluster-autoscaler',
            'codebuild', 'codepipeline', 'db-secret', 'developer', 'ecr-registry',
            'eks-cluster', 'eks-node', 'eks-target', 'eks', 'elasticache',
            'external-dns', 'flask-api', 'fluentbit', 'frontend-deploy', 'frontend-svc',
            'git-repo', 'grafana', 'helm-charts', 'helm', 'igw', 'ingress',
            'nat', 'postgres-db', 'prometheus', 'rds-primary', 'rds-replica',
            'rds-standby', 'rds', 'react-frontend', 'redis-cache', 'redis-svc',
            'route-53-hosted-zone', 's3-storage', 'secrets', 'users-client',
            'users', 'vpc', 'waf', 'worker-deploy', 'iam-role', 'iam-policy',
            'security-group', 'subnet', 'route-table', 'route-table-association'
        ];
        
        return iconNames.flatMap(name => [
            { name: name, path: `./assets/icons/${name}.png`, extension: 'png' },
            { name: name, path: `./assets/icons/${name}.svg`, extension: 'svg' }
        ]);
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
            alert('Failed to read markdown files');
        });
        
        event.target.value = '';
    }

    displayMarkdown(fileContents) {
        const mdPreview = document.getElementById('md-preview');
        const mdContent = document.getElementById('md-content');
        
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
        }
    }

    clearMarkdown() {
        this.markdownFiles = [];
        document.getElementById('md-preview').style.display = 'none';
        document.getElementById('md-content').textContent = '';
        document.getElementById('generate-json-btn').disabled = true;
    }

    buildSystemPrompt() {
        const iconList = this.availableIcons
            .filter((icon, index, self) => 
                index === self.findIndex(i => i.name === icon.name))
            .map(icon => icon.name)
            .join(', ');

        return `You are an expert in generating architecture diagram definitions in JSON format.

AVAILABLE ICONS:
${iconList}

JSON STRUCTURE:
The JSON must have this exact structure:
{
  "nodes": [
    {
      "id": "unique-identifier",
      "label": "Display Name",
      "subtitle": "module.name or description",
      "type": "network|compute|container|security|storage|iam",
      "icon": "./assets/icons/icon-name.png",
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
    {"id": "vpc", "label": "VPC", "subtitle": "module.vpc", "type": "network", "icon": "./assets/icons/vpc.png", "parentNode": "vpc-container"},
    {"id": "igw", "label": "Internet Gateway", "subtitle": "module.vpc", "type": "network", "icon": "./assets/icons/igw.png", "parentNode": "vpc-container"},
    {"id": "subnet-0", "label": "Public Subnet 0", "subtitle": "module.vpc", "type": "network", "icon": "./assets/icons/pub-1a.png", "parentNode": "vpc-container"},
    {"id": "subnet-1", "label": "Public Subnet 1", "subtitle": "module.vpc", "type": "network", "icon": "./assets/icons/pub-1b.png", "parentNode": "vpc-container"},
    {"id": "eks-container", "label": "EKS Cluster", "subtitle": "Kubernetes", "type": "container"},
    {"id": "eks", "label": "EKS Control Plane", "subtitle": "module.eks", "type": "container", "icon": "./assets/icons/eks-cluster.png", "parentNode": "eks-container"},
    {"id": "nodegroup", "label": "Node Group", "subtitle": "module.eks", "type": "compute", "icon": "./assets/icons/eks-node-group.png", "parentNode": "eks-container"}
  ],
  "edges": [
    {"id": "e1", "source": "vpc", "target": "igw", "label": "attached"},
    {"id": "e2", "source": "igw", "target": "subnet-0", "label": "routes to"},
    {"id": "e3", "source": "vpc-container", "target": "eks-container", "label": "contains"}
  ]
}

INSTRUCTIONS:
1. Read the markdown description carefully
2. **Identify logical groups** (VPC resources, EKS components, IAM policies, etc.)
3. **Create container nodes** for each group with dotted borders
4. Assign resources to containers using "parentNode"
5. Choose appropriate icons from the available list
6. Create meaningful IDs (lowercase, hyphenated)
7. Use types: network, compute, container, security, storage, iam
8. Define edges showing relationships
9. Return ONLY valid JSON, no explanations

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
