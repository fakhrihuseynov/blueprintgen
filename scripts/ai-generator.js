// AI Generator Module for Blueprint Generator
// Integrates with Ollama (qwen2.5-coder:7) to generate architecture JSON from markdown

class AIGenerator {
    constructor() {
        this.ollamaUrl = 'http://localhost:11434/api/generate';
        this.model = 'qwen2.5-coder:7b';
        this.availableIcons = [];
        this.markdownFiles = [];
        this.generatedJSON = null;
        
        // Modules (initialized after icons loaded)
        this.promptBuilder = null;
        this.iconValidator = null;
        
        this.init();
    }

    async init() {
        await this.loadAvailableIcons();
        
        // Initialize modules with loaded icons
        this.promptBuilder = new AIPromptBuilder(this.availableIcons);
        this.iconValidator = new IconValidator(this.availableIcons);
        
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
            
            // Load Kubernetes, Monitoring, General, GCP (flat structure, all SVG)
            const flatFolders = ['Kubernetes', 'Monitoring', 'General', 'GCP'];
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
            // Combine all markdown files
            let combinedMarkdown = '';
            this.markdownFiles.forEach((file, index) => {
                combinedMarkdown += `\n\n### Source File ${index + 1}: ${file.name}\n\n`;
                combinedMarkdown += file.content;
            });
            
            // Build prompt using AIPromptBuilder module
            const prompt = this.promptBuilder.buildSystemPrompt() + '\n\n' + combinedMarkdown;
            
            console.log('Generating JSON with Ollama...');
            console.log(`📝 Markdown size: ${combinedMarkdown.length} characters`);
            console.log('⏳ This may take 1-5 minutes for complex architectures...');
            
            // Create abort controller for timeout (5 minutes)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 300000);
            
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
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

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
            
            // Validate and auto-fix icon paths using IconValidator module
            this.generatedJSON = this.iconValidator.validateAndFixIcons(this.generatedJSON);
            
            // Display the result
            this.displayGeneratedJSON(this.generatedJSON);
            
            showToast('success', 'JSON generated successfully!');
        } catch (error) {
            console.error('Error generating JSON:', error);
            
            if (error.name === 'AbortError') {
                showToast('error', 'Generation timed out (5 min limit). Try a simpler architecture.');
            } else if (error.message.includes('timed out')) {
                showToast('error', 'Ollama timed out. The architecture may be too complex. Try breaking it into smaller parts.');
            } else {
                showToast('error', 'Failed to generate JSON: ' + error.message);
            }
            
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
