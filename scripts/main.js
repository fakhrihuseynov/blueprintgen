// main.js - App initialization and main entry point

// Global diagram instance
let diagram;
// Global Visio exporter instance (deprecated - using Draw.io export instead)
// let visioExporter;


// Load diagram from JSON data
function loadDiagram(jsonData) {
    console.log('loadDiagram called with data:', jsonData);
    
    try {
        // Show diagram container
        const welcomeScreen = document.getElementById('welcome-screen');
        const diagramContainer = document.getElementById('diagram-container');
        const downloadBtn = document.getElementById('download-diagram');
        const exportSvgBtn = document.getElementById('export-svg');
        const exportDrawioBtn = document.getElementById('export-drawio');
        
        if (welcomeScreen) welcomeScreen.style.display = 'none';
        if (diagramContainer) {
            diagramContainer.style.display = 'block';
            console.log('Diagram container is now visible');
        }
        if (downloadBtn) downloadBtn.style.display = 'flex';
        if (exportSvgBtn) exportSvgBtn.style.display = 'flex';
        
        // Wait for DOM update
        requestAnimationFrame(() => {
            setTimeout(() => {
                try {
                    const svgElement = document.getElementById('diagram-svg');
                    const groupElement = document.getElementById('diagram-group');
                    
                    console.log('SVG element:', svgElement);
                    console.log('Group element:', groupElement);
                    
                    if (!svgElement || !groupElement) {
                        throw new Error('SVG elements not found in DOM');
                    }
                    
                    if (!diagram) {
                        console.log('Creating new diagram instance');
                        diagram = new DiagramGenerator();
                    } else {
                        console.log('Updating existing diagram instance');
                    }
                    
                    // Force update the elements
                    diagram.svg = svgElement;
                    diagram.group = groupElement;
                    
                    console.log('Elements assigned to diagram:', diagram.svg, diagram.group);
                    
                    // Setup event listeners
                    diagram.setupEventListeners();
                    
                    // Clear and load new content
                    diagram.clear();
                    diagram.nodes = jsonData.nodes;
                    diagram.edges = jsonData.edges;
                    
                    console.log(`Loading ${diagram.nodes.length} nodes and ${diagram.edges.length} edges`);
                    
                    // Calculate layout
                    const layout = diagram.calculateLayout(diagram.nodes, diagram.edges);
                    
                    // Draw edges first (behind nodes)
                    diagram.drawEdges(layout);
                    
                    // Draw nodes
                    diagram.drawNodes(layout);
                    
                    // Update info panel
                    diagram.updateInfo(jsonData);
                    
                    // Fit view
                    setTimeout(() => diagram.fitView(), 100);
                    
                    showToast('success', 'Diagram loaded successfully!');
                    console.log('Diagram loaded successfully');
                } catch (error) {
                    console.error('Error in delayed loadDiagram:', error);
                    showToast('error', 'Failed to load diagram: ' + error.message);
                }
            }, 100);
        });
        
    } catch (error) {
        console.error('Error in loadDiagram:', error);
        showToast('error', 'Failed to load diagram: ' + error.message);
    }
}

// Load example diagram with inline data
function loadExampleDiagram() {
    console.log('Loading example diagram...');
    showToast('success', 'Loading example...');
    
    const exampleData = {
        "nodes": [
            {"id": "eks-cluster", "label": "EKS Cluster", "subtitle": "innovate-prod", "icon": "./assets/icons/AWS/Containers/Elastic-Kubernetes-Service.svg", "type": "container"},
            {"id": "ns-prod", "label": "Production Namespace", "subtitle": "innovate-prod", "type": "container", "parentNode": "eks-cluster", "layout": "row"},
            {"id": "ns-monitoring", "label": "Monitoring Namespace", "subtitle": "monitoring", "type": "container", "parentNode": "eks-cluster", "layout": "row"},
            {"id": "ns-system", "label": "System Namespace", "subtitle": "kube-system", "type": "container", "parentNode": "eks-cluster", "layout": "row"},
            {"id": "ingress", "label": "AWS Load Balancer Controller", "subtitle": "Ingress Controller", "icon": "./assets/icons/Kubernetes/ing.svg", "parentNode": "ns-system"},
            {"id": "backend-deploy", "label": "Backend Deployment", "subtitle": "Flask API", "icon": "./assets/icons/Kubernetes/deploy.svg", "parentNode": "ns-prod"},
            {"id": "frontend-deploy", "label": "Frontend Deployment", "subtitle": "React SPA", "icon": "./assets/icons/Kubernetes/deploy.svg", "parentNode": "ns-prod"},
            {"id": "worker-deploy", "label": "Worker Deployment", "subtitle": "Background Jobs", "icon": "./assets/icons/Kubernetes/deploy.svg", "parentNode": "ns-prod"},
            {"id": "backend-svc", "label": "Backend Service", "subtitle": "ClusterIP", "icon": "./assets/icons/Kubernetes/svc.svg", "parentNode": "ns-prod"},
            {"id": "frontend-svc", "label": "Frontend Service", "subtitle": "ClusterIP", "icon": "./assets/icons/Kubernetes/svc.svg", "parentNode": "ns-prod"},
            {"id": "redis-svc", "label": "Redis Service", "subtitle": "External Service", "icon": "./assets/icons/General/Database_48_Light.svg", "parentNode": "ns-prod"},
            {"id": "db-secret", "label": "Database Secret", "subtitle": "RDS Credentials", "icon": "./assets/icons/Kubernetes/secret.svg", "parentNode": "ns-prod"},
            {"id": "app-config", "label": "App ConfigMap", "subtitle": "Environment Config", "icon": "./assets/icons/Kubernetes/cm.svg", "parentNode": "ns-prod"},
            {"id": "prometheus", "label": "Prometheus", "subtitle": "Metrics Collection", "icon": "./assets/icons/Monitoring/prometheus.svg", "parentNode": "ns-monitoring"},
            {"id": "grafana", "label": "Grafana", "subtitle": "Dashboards", "icon": "./assets/icons/Monitoring/grafana.svg", "parentNode": "ns-monitoring"},
            {"id": "fluentbit", "label": "Fluent Bit", "subtitle": "Log Collection", "icon": "./assets/icons/Monitoring/fluentbit.svg", "parentNode": "ns-monitoring"},
            {"id": "cluster-autoscaler", "label": "Cluster Autoscaler", "subtitle": "Node Scaling", "icon": "./assets/icons/Kubernetes/hpa.svg", "parentNode": "ns-system"},
            {"id": "external-dns", "label": "External DNS", "subtitle": "DNS Management", "icon": "./assets/icons/General/Internet_48_Light.svg", "parentNode": "ns-system"}
        ],
        "edges": [
            {"id": "e1", "source": "ingress", "target": "frontend-svc", "label": "routes traffic"},
            {"id": "e2", "source": "ingress", "target": "backend-svc", "label": "routes API calls"},
            {"id": "e3", "source": "frontend-svc", "target": "frontend-deploy", "label": "load balances"},
            {"id": "e4", "source": "backend-svc", "target": "backend-deploy", "label": "load balances"},
            {"id": "e5", "source": "backend-deploy", "target": "db-secret", "label": "uses credentials"},
            {"id": "e6", "source": "backend-deploy", "target": "app-config", "label": "reads config"},
            {"id": "e7", "source": "frontend-deploy", "target": "app-config", "label": "reads config"},
            {"id": "e8", "source": "worker-deploy", "target": "redis-svc", "label": "processes jobs"},
            {"id": "e9", "source": "backend-deploy", "target": "redis-svc", "label": "queues jobs"},
            {"id": "e10", "source": "prometheus", "target": "backend-deploy", "label": "scrapes metrics"},
            {"id": "e11", "source": "prometheus", "target": "frontend-deploy", "label": "scrapes metrics"},
            {"id": "e12", "source": "grafana", "target": "prometheus", "label": "queries data"},
            {"id": "e13", "source": "fluentbit", "target": "backend-deploy", "label": "collects logs"},
            {"id": "e14", "source": "cluster-autoscaler", "target": "backend-deploy", "label": "scales nodes for"}
        ]
    };
    
    console.log('Loading inline example data');
    loadDiagram(exampleData);
}

// Download diagram as PNG
async function downloadDiagram() {
    try {
        const svgElement = document.getElementById('diagram-svg');
        if (!svgElement) {
            showToast('error', 'Diagram not found');
            return;
        }
        
        showToast('info', 'Preparing export... This may take a moment.');
        
        // Clone SVG
        const svgClone = svgElement.cloneNode(true);
        
        // Convert all image elements to data URIs (embed icons)
        const images = svgClone.querySelectorAll('image');
        const imagePromises = Array.from(images).map(async (img) => {
            const href = img.getAttribute('href');
            if (!href) return;
            
            try {
                // Fetch the SVG file
                const response = await fetch(href);
                const svgText = await response.text();
                
                // Convert to base64 data URI
                const base64 = btoa(unescape(encodeURIComponent(svgText)));
                img.setAttribute('href', `data:image/svg+xml;base64,${base64}`);
            } catch (error) {
                console.warn(`Failed to embed image: ${href}`, error);
            }
        });
        
        // Wait for all images to be embedded
        await Promise.all(imagePromises);
        
        // Embed styles
        const styles = document.createElement('style');
        styles.textContent = `
            .node-rect { fill: #ffffff; stroke: #e5e7eb; stroke-width: 2; }
            .node-label { font-family: system-ui, -apple-system, sans-serif; font-size: 13px; font-weight: 600; fill: #1f2937; }
            .node-subtitle { font-family: system-ui, -apple-system, sans-serif; font-size: 11px; font-weight: 400; fill: #6b7280; }
            .edge-path { fill: none; stroke: #6366f1; stroke-width: 2; opacity: 0.6; }
            .edge-label { font-family: system-ui, -apple-system, sans-serif; font-size: 12px; font-weight: 500; fill: #6b7280; }
            .edge-label-bg { fill: white; opacity: 0.95; }
            .container-rect { fill: rgba(99, 102, 241, 0.04); stroke: rgba(79, 70, 229, 0.5); stroke-width: 2; stroke-dasharray: 8, 4; }
            .container-label { font-family: system-ui, -apple-system, sans-serif; font-size: 16px; font-weight: 700; fill: #1f2937; }
            .container-subtitle { font-family: system-ui, -apple-system, sans-serif; font-size: 12px; font-weight: 500; fill: #6b7280; }
        `;
        
        const defs = svgClone.querySelector('defs') || svgClone.insertBefore(document.createElementNS('http://www.w3.org/2000/svg', 'defs'), svgClone.firstChild);
        defs.appendChild(styles);
        
        // Get bounding box
        const bbox = svgElement.querySelector('#diagram-group').getBBox();
        
        // Set viewBox with padding
        const padding = 50;
        svgClone.setAttribute('viewBox', `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`);
        svgClone.setAttribute('width', bbox.width + padding * 2);
        svgClone.setAttribute('height', bbox.height + padding * 2);
        
        // Remove transforms from clone for export
        const groupClone = svgClone.querySelector('#diagram-group');
        if (groupClone) {
            groupClone.removeAttribute('transform');
        }
        
        // Serialize SVG
        const svgData = new XMLSerializer().serializeToString(svgClone);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        // Create image and canvas
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Use higher resolution for better quality
            const scale = 2;
            canvas.width = (bbox.width + padding * 2) * scale;
            canvas.height = (bbox.height + padding * 2) * scale;
            
            // Scale context
            ctx.scale(scale, scale);
            
            // White background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw image
            ctx.drawImage(img, 0, 0, bbox.width + padding * 2, bbox.height + padding * 2);
            
            // Export as PNG
            canvas.toBlob(blob => {
                const pngUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = 'architecture-diagram.png';
                link.href = pngUrl;
                link.click();
                URL.revokeObjectURL(pngUrl);
                URL.revokeObjectURL(url);
                showToast('success', 'Diagram exported successfully!');
            });
        };
        
        img.onerror = () => {
            showToast('error', 'Failed to render diagram');
            URL.revokeObjectURL(url);
        };
        
        img.src = url;
        
    } catch (error) {
        showToast('error', 'Failed to export diagram: ' + error.message);
        console.error('Export error:', error);
    }
}

// Export diagram as SVG with embedded icons
async function exportToSVG() {
    if (!diagram || !diagram.nodes || !diagram.edges) {
        showToast('error', 'No diagram to export');
        return;
    }
    
    try {
        showToast('info', 'Preparing SVG export...');
        
        // Get the SVG element
        const svgElement = diagram.svg || document.getElementById('diagram-svg');
        if (!svgElement) {
            throw new Error('SVG element not found');
        }
        
        // Get all groups (nodes and edges)
        const allNodes = svgElement.querySelectorAll('g[data-node-id]');
        const allEdges = svgElement.querySelectorAll('g[data-edge-id]');
        
        if (allNodes.length === 0) {
            throw new Error('No diagram content found');
        }
        
        // Calculate bounds of all node elements
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        allNodes.forEach(node => {
            const bbox = node.getBBox();
            minX = Math.min(minX, bbox.x);
            minY = Math.min(minY, bbox.y);
            maxX = Math.max(maxX, bbox.x + bbox.width);
            maxY = Math.max(maxY, bbox.y + bbox.height);
        });
        
        const padding = 40;
        const width = maxX - minX + padding * 2;
        const height = maxY - minY + padding * 2;
        
        // Create a new clean SVG
        const newSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        newSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        newSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
        newSvg.setAttribute('width', width);
        newSvg.setAttribute('height', height);
        newSvg.setAttribute('viewBox', `${minX - padding} ${minY - padding} ${width} ${height}`);
        newSvg.style.background = 'white';
        
        // Add defs for arrow markers
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `
            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="#4F46E5"/>
            </marker>`;
        newSvg.appendChild(defs);
        
        // First, add all edges (so they appear behind nodes)
        for (const edge of allEdges) {
            const edgeClone = edge.cloneNode(true);
            newSvg.appendChild(edgeClone);
        }
        
        // Then, add all nodes with embedded images
        for (const node of allNodes) {
            const nodeClone = node.cloneNode(true);
            
            // Ensure borders are visible
            const rects = nodeClone.querySelectorAll('rect');
            rects.forEach(rect => {
                if (!rect.getAttribute('stroke') || rect.getAttribute('stroke') === 'none') {
                    rect.setAttribute('stroke', '#9CA3AF');
                    rect.setAttribute('stroke-width', '2');
                }
            });
            
            // Embed images as data URIs
            const images = nodeClone.querySelectorAll('image');
            for (const img of images) {
                const href = img.getAttribute('href') || img.getAttribute('xlink:href');
                if (href && !href.startsWith('data:')) {
                    try {
                        const response = await fetch(href);
                        const blob = await response.blob();
                        const dataUrl = await new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.readAsDataURL(blob);
                        });
                        img.setAttribute('href', dataUrl);
                    } catch (error) {
                        console.warn('Failed to embed image:', href);
                    }
                }
            }
            
            newSvg.appendChild(nodeClone);
        }
        
        const svgData = new XMLSerializer().serializeToString(newSvg);
        const styledSvg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n${svgData}`;
        
        const svgBlob = new Blob([styledSvg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        const link = document.createElement('a');
        link.download = 'architecture-diagram.svg';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        
        showToast('success', 'Diagram exported as SVG!');
    } catch (error) {
        showToast('error', 'Failed to export SVG: ' + error.message);
        console.error('SVG export error:', error);
    }
}

function escapeXml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// Go to home/welcome screen
function goToHome() {
    const welcomeScreen = document.getElementById('welcome-screen');
    const diagramContainer = document.getElementById('diagram-container');
    const aiGeneratorScreen = document.getElementById('ai-generator-screen');
    const downloadBtn = document.getElementById('download-diagram');
    const exportSvgBtn = document.getElementById('export-svg');
    
    if (welcomeScreen) welcomeScreen.style.display = 'flex';
    if (diagramContainer) diagramContainer.style.display = 'none';
    if (aiGeneratorScreen) aiGeneratorScreen.style.display = 'none';
    if (downloadBtn) downloadBtn.style.display = 'none';
    if (exportSvgBtn) exportSvgBtn.style.display = 'none';
}


// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    
    // Initialize diagram
    diagram = new DiagramGenerator();
    
    // Note: Visio exporter deprecated in favor of Draw.io export
    // Initialize Visio exporter
    // visioExporter = new VisioExporter();
    
    // Initialize icon picker
    window.iconPicker = new IconPicker(diagram);

    
    // File upload listeners
    const fileUpload = document.getElementById('file-upload');
    const fileUploadWelcome = document.getElementById('file-upload-welcome');
    
    if (fileUpload) fileUpload.addEventListener('change', handleFileUpload);
    if (fileUploadWelcome) fileUploadWelcome.addEventListener('change', handleFileUpload);
    
    // Example button listeners
    const loadExampleBtn = document.getElementById('load-example');
    const loadExampleWelcomeBtn = document.getElementById('load-example-welcome');
    
    if (loadExampleBtn) {
        loadExampleBtn.addEventListener('click', (e) => {
            console.log('Load example clicked (header)');
            e.preventDefault();
            loadExampleDiagram();
        });
    }
    
    if (loadExampleWelcomeBtn) {
        loadExampleWelcomeBtn.addEventListener('click', (e) => {
            console.log('Load example clicked (welcome)');
            e.preventDefault();
            loadExampleDiagram();
        });
    }

    // Control button listeners
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const fitViewBtn = document.getElementById('fit-view');
    const resetLayoutBtn = document.getElementById('reset-layout');
    const closeInfoBtn = document.getElementById('close-info');
    const downloadBtn = document.getElementById('download-diagram');
    const exportSvgBtn = document.getElementById('export-svg');
    const appTitle = document.getElementById('app-title');
    
    if (zoomInBtn) zoomInBtn.addEventListener('click', () => diagram && diagram.zoomIn());
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => diagram && diagram.zoomOut());
    if (fitViewBtn) fitViewBtn.addEventListener('click', () => diagram && diagram.fitView());
    if (resetLayoutBtn) resetLayoutBtn.addEventListener('click', () => diagram && diagram.reset());
    if (closeInfoBtn) {
        closeInfoBtn.addEventListener('click', () => {
            const infoPanel = document.getElementById('info-panel');
            infoPanel.classList.toggle('collapsed');
            closeInfoBtn.textContent = infoPanel.classList.contains('collapsed') ? '+' : '×';
        });
    }
    if (downloadBtn) downloadBtn.addEventListener('click', downloadDiagram);
    if (exportSvgBtn) exportSvgBtn.addEventListener('click', exportToSVG);
    if (appTitle) appTitle.addEventListener('click', goToHome);

    
    console.log('App initialized successfully');
});
