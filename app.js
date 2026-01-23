// Blueprint Diagram Generator
// Vanilla JavaScript implementation with SVG rendering

class DiagramGenerator {
    constructor() {
        this.svg = document.getElementById('diagram-svg');
        this.group = document.getElementById('diagram-group');
        this.nodes = [];
        this.edges = [];
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add null checks for all elements
        if (!this.svg) {
            console.warn('SVG element not found, skipping event listeners');
            return;
        }
        
        // Mouse events for panning
        this.svg.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.svg.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.svg.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.svg.addEventListener('mouseleave', this.onMouseUp.bind(this));
        
        // Mouse wheel for zooming
        this.svg.addEventListener('wheel', this.onWheel.bind(this));
        
        // Touch events for mobile
        this.svg.addEventListener('touchstart', this.onTouchStart.bind(this));
        this.svg.addEventListener('touchmove', this.onTouchMove.bind(this));
        this.svg.addEventListener('touchend', this.onTouchEnd.bind(this));
    }

    onMouseDown(e) {
        if (e.target === this.svg || e.target === this.group) {
            this.isDragging = true;
            this.dragStartX = e.clientX - this.translateX;
            this.dragStartY = e.clientY - this.translateY;
            this.svg.style.cursor = 'grabbing';
        }
    }

    onMouseMove(e) {
        if (this.isDragging) {
            this.translateX = e.clientX - this.dragStartX;
            this.translateY = e.clientY - this.dragStartY;
            this.updateTransform();
        }
    }

    onMouseUp() {
        this.isDragging = false;
        this.svg.style.cursor = 'default';
    }

    onWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = this.scale * delta;
        
        if (newScale >= 0.1 && newScale <= 3) {
            const rect = this.svg.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.translateX = x - (x - this.translateX) * delta;
            this.translateY = y - (y - this.translateY) * delta;
            this.scale = newScale;
            
            this.updateTransform();
        }
    }

    onTouchStart(e) {
        if (e.touches.length === 1) {
            this.isDragging = true;
            this.dragStartX = e.touches[0].clientX - this.translateX;
            this.dragStartY = e.touches[0].clientY - this.translateY;
        }
    }

    onTouchMove(e) {
        if (this.isDragging && e.touches.length === 1) {
            e.preventDefault();
            this.translateX = e.touches[0].clientX - this.dragStartX;
            this.translateY = e.touches[0].clientY - this.dragStartY;
            this.updateTransform();
        }
    }

    onTouchEnd() {
        this.isDragging = false;
    }

    updateTransform() {
        this.group.setAttribute('transform', 
            `translate(${this.translateX}, ${this.translateY}) scale(${this.scale})`);
    }

    zoomIn() {
        if (this.scale < 3) {
            this.scale *= 1.2;
            this.updateTransform();
        }
    }

    zoomOut() {
        if (this.scale > 0.1) {
            this.scale *= 0.8;
            this.updateTransform();
        }
    }

    fitView() {
        if (this.nodes.length === 0) return;

        const bbox = this.group.getBBox();
        const svgRect = this.svg.getBoundingClientRect();
        
        const scaleX = svgRect.width / (bbox.width + 100);
        const scaleY = svgRect.height / (bbox.height + 100);
        this.scale = Math.min(scaleX, scaleY, 1);
        
        this.translateX = (svgRect.width - bbox.width * this.scale) / 2 - bbox.x * this.scale;
        this.translateY = (svgRect.height - bbox.height * this.scale) / 2 - bbox.y * this.scale;
        
        this.updateTransform();
    }

    reset() {
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.updateTransform();
    }

    loadDiagram(jsonData) {
        // Elements should already be initialized by loadDiagram() function
        // Just do the actual drawing work here
        if (!this.svg || !this.group) {
            console.error('SVG elements not available in loadDiagram');
            throw new Error('Diagram canvas not initialized');
        }
        
        this.nodes = jsonData.nodes;
        this.edges = jsonData.edges;
        
        console.log(`Drawing ${this.nodes.length} nodes and ${this.edges.length} edges`);
    }
    
    draw(jsonData) {
        // This method does the actual drawing
        this.nodes = jsonData.nodes;
        this.edges = jsonData.edges;
        
        console.log(`Loading ${this.nodes.length} nodes and ${this.edges.length} edges`);
        
        // Calculate layout
        const layout = this.calculateLayout(this.nodes, this.edges);
        
        // Draw edges first (so they appear behind nodes)
        this.drawEdges(layout);
        
        // Draw nodes
        this.drawNodes(layout);
        
        // Update info
        this.updateInfo(jsonData);
        
        // Fit view
        setTimeout(() => this.fitView(), 100);
    }

    calculateLayout(nodes, edges) {
        const layout = {};
        
        // Separate containers from regular nodes
        const containers = nodes.filter(n => n.type === 'container');
        const regularNodes = nodes.filter(n => n.type !== 'container');
        
        if (containers.length > 0) {
            // Handle container-based layout (like K8s namespaces)
            return this.calculateContainerLayout(nodes, edges);
        }
        
        // For flat architectures, use hierarchical layered layout
        return this.calculateHierarchicalLayout(regularNodes, edges);
    }
    
    calculateContainerLayout(nodes, edges) {
        const layout = {};
        const containers = nodes.filter(n => n.type === 'container');
        const regular = nodes.filter(n => n.type !== 'container');
        
        // Layout containers vertically
        let containerY = 50;
        containers.forEach((node) => {
            const children = nodes.filter(n => n.parentNode === node.id);
            const containerWidth = Math.max(800, children.length * 200 + 100);
            const containerHeight = Math.ceil(children.length / 4) * 150 + 100;
            
            layout[node.id] = {
                x: 50,
                y: containerY,
                width: containerWidth,
                height: containerHeight,
                type: 'container'
            };
            
            // Layout children within container in a grid
            children.forEach((child, childIndex) => {
                const col = childIndex % 4;
                const row = Math.floor(childIndex / 4);
                layout[child.id] = {
                    x: layout[node.id].x + 50 + col * 220,
                    y: layout[node.id].y + 60 + row * 140,
                    width: 140,
                    height: 80,
                    type: 'node'
                };
            });
            
            containerY += containerHeight + 50;
        });
        
        // Layout orphan nodes
        const orphans = regular.filter(n => !n.parentNode);
        orphans.forEach((node, index) => {
            const col = index % 5;
            const row = Math.floor(index / 5);
            layout[node.id] = {
                x: 50 + col * 280,
                y: containerY + row * 160,
                width: 140,
                height: 80,
                type: 'node'
            };
        });
        
        return layout;
    }
    
    calculateHierarchicalLayout(nodes, edges) {
        const layout = {};
        
        // Build adjacency graph
        const outgoing = {};
        const incoming = {};
        nodes.forEach(n => {
            outgoing[n.id] = [];
            incoming[n.id] = [];
        });
        edges.forEach(e => {
            if (outgoing[e.source]) outgoing[e.source].push(e.target);
            if (incoming[e.target]) incoming[e.target].push(e.source);
        });
        
        // Find root nodes (no incoming edges)
        const roots = nodes.filter(n => incoming[n.id].length === 0);
        
        // If no clear roots, pick nodes with most outgoing edges
        const startNodes = roots.length > 0 ? roots : 
            nodes.slice().sort((a, b) => outgoing[b.id].length - outgoing[a.id].length).slice(0, 3);
        
        // Assign nodes to layers using BFS
        const layers = [];
        const visited = new Set();
        const nodeLayer = {};
        
        // BFS to assign layers
        const queue = startNodes.map(n => ({ id: n.id, layer: 0 }));
        startNodes.forEach(n => visited.add(n.id));
        
        while (queue.length > 0) {
            const { id, layer } = queue.shift();
            
            if (!layers[layer]) layers[layer] = [];
            layers[layer].push(id);
            nodeLayer[id] = layer;
            
            // Add children to next layer
            outgoing[id].forEach(targetId => {
                if (!visited.has(targetId)) {
                    visited.add(targetId);
                    queue.push({ id: targetId, layer: layer + 1 });
                }
            });
        }
        
        // Add any remaining unvisited nodes to the last layer
        nodes.forEach(n => {
            if (!visited.has(n.id)) {
                const lastLayer = layers.length;
                if (!layers[lastLayer]) layers[lastLayer] = [];
                layers[lastLayer].push(n.id);
                nodeLayer[n.id] = lastLayer;
            }
        });
        
        // Group nodes by subtitle (module/category) within each layer
        const groupedLayers = layers.map(layer => {
            const groups = {};
            layer.forEach(nodeId => {
                const node = nodes.find(n => n.id === nodeId);
                const group = node.subtitle || 'default';
                if (!groups[group]) groups[group] = [];
                groups[group].push(nodeId);
            });
            return groups;
        });
        
        // Calculate positions with better organization
        const layerSpacing = 280;  // Vertical space between layers
        const nodeSpacing = 300;   // Horizontal space between nodes (increased)
        const nodeVerticalSpacing = 160; // Vertical space within same layer (increased)
        let currentY = 80;
        
        groupedLayers.forEach((groups, layerIndex) => {
            const groupKeys = Object.keys(groups);
            
            // Calculate total width needed for this layer
            const totalNodes = groupKeys.reduce((sum, key) => sum + groups[key].length, 0);
            
            // Position nodes horizontally across the layer
            let currentX = 100;
            let maxNodesInGroup = 0;
            
            groupKeys.forEach((groupKey, groupIndex) => {
                const groupNodes = groups[groupKey];
                maxNodesInGroup = Math.max(maxNodesInGroup, groupNodes.length);
                
                // Position nodes in this group horizontally
                groupNodes.forEach((nodeId, nodeIndex) => {
                    const node = nodes.find(n => n.id === nodeId);
                    
                    layout[nodeId] = {
                        x: currentX,
                        y: currentY + nodeIndex * nodeVerticalSpacing,
                        width: 140,  // More compact
                        height: 80,  // More compact
                        type: 'node',
                        layer: layerIndex,
                        group: groupKey
                    };
                });
                
                currentX += nodeSpacing;
            });
            
            // Move to next layer
            currentY += (maxNodesInGroup * nodeVerticalSpacing) + layerSpacing;
        });
        
        return layout;
    }

    drawNodes(layout) {
        this.nodes.forEach(node => {
            const pos = layout[node.id];
            if (!pos) return;
            
            if (pos.type === 'container') {
                this.drawContainer(node, pos);
            } else {
                this.drawNode(node, pos);
            }
        });
    }

    drawContainer(node, pos) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'container-group');
        
        // Container rectangle with dotted border
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', pos.x);
        rect.setAttribute('y', pos.y);
        rect.setAttribute('width', pos.width);
        rect.setAttribute('height', pos.height);
        rect.setAttribute('rx', 16);
        rect.setAttribute('class', 'container-rect');
        rect.setAttribute('stroke-dasharray', '8,4');  // Dotted border
        g.appendChild(rect);
        
        // Label at top-left
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', pos.x + 20);
        text.setAttribute('y', pos.y + 28);
        text.setAttribute('class', 'container-label');
        text.textContent = node.label;
        g.appendChild(text);
        
        // Subtitle below label
        if (node.subtitle) {
            const subtitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            subtitle.setAttribute('x', pos.x + 20);
            subtitle.setAttribute('y', pos.y + 44);
            subtitle.setAttribute('class', 'container-subtitle');
            subtitle.textContent = node.subtitle;
            g.appendChild(subtitle);
        }
        
        this.group.appendChild(g);
    }

    drawNode(node, pos) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'node-group');
        g.setAttribute('data-node-id', node.id);
        
        // Node rectangle (compact)
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', pos.x);
        rect.setAttribute('y', pos.y);
        rect.setAttribute('width', pos.width);
        rect.setAttribute('height', pos.height);
        rect.setAttribute('rx', 8);
        rect.setAttribute('class', 'node-rect');
        g.appendChild(rect);
        
        // Icon (centered in compact box)
        if (node.icon) {
            const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            image.setAttribute('x', pos.x + pos.width / 2 - 20);
            image.setAttribute('y', pos.y + pos.height / 2 - 20);
            image.setAttribute('width', 40);
            image.setAttribute('height', 40);
            image.setAttribute('href', node.icon);
            image.setAttribute('class', 'node-icon');
            g.appendChild(image);
        }
        
        // Label BELOW the box to avoid overlap
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', pos.x + pos.width / 2);
        text.setAttribute('y', pos.y + pos.height + 18);
        text.setAttribute('class', 'node-label');
        text.setAttribute('text-anchor', 'middle');
        text.textContent = node.label;
        g.appendChild(text);
        
        // Subtitle BELOW the label
        if (node.subtitle) {
            const subtitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            subtitle.setAttribute('x', pos.x + pos.width / 2);
            subtitle.setAttribute('y', pos.y + pos.height + 32);
            subtitle.setAttribute('class', 'node-subtitle');
            subtitle.setAttribute('text-anchor', 'middle');
            subtitle.textContent = node.subtitle;
            g.appendChild(subtitle);
        }
        
        this.group.appendChild(g);
    }

    drawEdges(layout) {
        this.edges.forEach(edge => {
            const sourcePos = layout[edge.source];
            const targetPos = layout[edge.target];
            
            if (!sourcePos || !targetPos) return;
            
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('class', 'edge-group');
            
            // Calculate optimal connection points based on positions
            let x1, y1, x2, y2;
            
            // Determine relative positions
            const isTargetBelow = targetPos.y > sourcePos.y + sourcePos.height;
            const isTargetAbove = targetPos.y + targetPos.height < sourcePos.y;
            const isTargetRight = targetPos.x > sourcePos.x + sourcePos.width;
            const isTargetLeft = targetPos.x + targetPos.width < sourcePos.x;
            
            // Choose connection points to minimize overlaps
            if (isTargetBelow) {
                // Connect bottom to top
                x1 = sourcePos.x + sourcePos.width / 2;
                y1 = sourcePos.y + sourcePos.height;
                x2 = targetPos.x + targetPos.width / 2;
                y2 = targetPos.y;
            } else if (isTargetAbove) {
                // Connect top to bottom
                x1 = sourcePos.x + sourcePos.width / 2;
                y1 = sourcePos.y;
                x2 = targetPos.x + targetPos.width / 2;
                y2 = targetPos.y + targetPos.height;
            } else if (isTargetRight) {
                // Connect right to left
                x1 = sourcePos.x + sourcePos.width;
                y1 = sourcePos.y + sourcePos.height / 2;
                x2 = targetPos.x;
                y2 = targetPos.y + targetPos.height / 2;
            } else if (isTargetLeft) {
                // Connect left to right
                x1 = sourcePos.x;
                y1 = sourcePos.y + sourcePos.height / 2;
                x2 = targetPos.x + targetPos.width;
                y2 = targetPos.y + targetPos.height / 2;
            } else {
                // Overlapping or side-by-side, use right to left
                x1 = sourcePos.x + sourcePos.width;
                y1 = sourcePos.y + sourcePos.height / 2;
                x2 = targetPos.x;
                y2 = targetPos.y + targetPos.height / 2;
            }
            
            // Create orthogonal (right-angle) path for clean blueprint look
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let d;
            
            // Calculate routing with right angles
            if (isTargetBelow || isTargetAbove) {
                // Vertical flow - straight down/up with optional horizontal offset
                const midY = (y1 + y2) / 2;
                if (Math.abs(x2 - x1) < 10) {
                    // Nearly aligned - straight line
                    d = `M ${x1} ${y1} L ${x2} ${y2}`;
                } else {
                    // Offset - use right angles
                    d = `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
                }
            } else {
                // Horizontal flow - straight right/left with optional vertical offset
                const midX = (x1 + x2) / 2;
                if (Math.abs(y2 - y1) < 10) {
                    // Nearly aligned - straight line
                    d = `M ${x1} ${y1} L ${x2} ${y2}`;
                } else {
                    // Offset - use right angles
                    d = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
                }
            }
            
            path.setAttribute('d', d);
            path.setAttribute('class', 'edge-path');
            path.setAttribute('marker-end', 'url(#arrowhead)');
            g.appendChild(path);
            
            // Add label at midpoint
            if (edge.label) {
                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2;
                
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', midX);
                text.setAttribute('y', midY - 5);
                text.setAttribute('class', 'edge-label');
                text.setAttribute('text-anchor', 'middle');
                text.textContent = edge.label;
                
                // Background rect for label
                const tempText = text.cloneNode(true);
                this.group.appendChild(tempText);
                const bbox = tempText.getBBox();
                this.group.removeChild(tempText);
                
                const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                bg.setAttribute('x', bbox.x - 5);
                bg.setAttribute('y', bbox.y - 2);
                bg.setAttribute('width', bbox.width + 10);
                bg.setAttribute('height', bbox.height + 4);
                bg.setAttribute('class', 'edge-label-bg');
                bg.setAttribute('rx', 4);
                
                g.appendChild(bg);
                g.appendChild(text);
            }
            
            this.group.insertBefore(g, this.group.firstChild);
        });
    }

    updateInfo(jsonData) {
        document.getElementById('node-count').textContent = jsonData.nodes.length;
        document.getElementById('edge-count').textContent = jsonData.edges.length;
        const containerCount = jsonData.nodes.filter(n => n.type === 'container').length;
        document.getElementById('container-count').textContent = containerCount;
    }

    clear() {
        while (this.group.firstChild) {
            this.group.removeChild(this.group.firstChild);
        }
        this.nodes = [];
        this.edges = [];
    }
}

// Global diagram instance
let diagram;

// Toast notification
function showToast(type, message) {
    const toastId = type === 'error' ? 'error-toast' : 'success-toast';
    const messageId = type === 'error' ? 'error-message' : 'success-message';
    
    const toast = document.getElementById(toastId);
    const messageEl = document.getElementById(messageId);
    
    messageEl.textContent = message;
    toast.style.display = 'flex';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// File upload handler
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const jsonData = JSON.parse(e.target.result);
            loadDiagram(jsonData);
        } catch (error) {
            showToast('error', 'Invalid JSON file: ' + error.message);
            console.error('Error parsing JSON:', error);
        }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
}

// Load diagram
function loadDiagram(jsonData) {
    console.log('loadDiagram called with data:', jsonData);
    
    try {
        // Show diagram container FIRST so elements become accessible
        const welcomeScreen = document.getElementById('welcome-screen');
        const diagramContainer = document.getElementById('diagram-container');
        const downloadBtn = document.getElementById('download-diagram');
        
        if (welcomeScreen) welcomeScreen.style.display = 'none';
        if (diagramContainer) {
            diagramContainer.style.display = 'block';
            console.log('Diagram container is now visible');
        }
        if (downloadBtn) downloadBtn.style.display = 'flex';
        
        // Use requestAnimationFrame to ensure DOM is updated, then wait a bit more
        requestAnimationFrame(() => {
            setTimeout(() => {
                try {
                    // Now initialize/re-initialize the diagram with visible elements
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
                    
                    // Clear any existing content
                    diagram.clear();
                    diagram.nodes = jsonData.nodes;
                    diagram.edges = jsonData.edges;
                    
                    console.log(`Loading ${diagram.nodes.length} nodes and ${diagram.edges.length} edges`);
                    
                    // Calculate layout
                    const layout = diagram.calculateLayout(diagram.nodes, diagram.edges);
                    
                    // Draw edges first (so they appear behind nodes)
                    diagram.drawEdges(layout);
                    
                    // Draw nodes
                    diagram.drawNodes(layout);
                    
                    // Update info
                    diagram.updateInfo(jsonData);
                    
                    // Fit view
                    setTimeout(() => diagram.fitView(), 100);
                    
                    showToast('success', 'Diagram loaded successfully!');
                    console.log('Diagram loaded successfully');
                } catch (error) {
                    console.error('Error in delayed loadDiagram:', error);
                    showToast('error', 'Failed to load diagram: ' + error.message);
                }
            }, 100); // Increased timeout
        });
        
    } catch (error) {
        console.error('Error in loadDiagram:', error);
        showToast('error', 'Failed to load diagram: ' + error.message);
    }
}

// Load example diagram
function loadExampleDiagram() {
    console.log('Loading example diagram...');
    showToast('success', 'Loading example...');
    
    // Inline the example data to avoid CORS issues with file:// protocol
    const exampleData = {
        "nodes": [
            {"id": "eks-cluster", "label": "EKS Cluster", "subtitle": "innovate-prod", "icon": "./assets/icons/eks-cluster.png", "type": "container"},
            {"id": "ns-prod", "label": "Production Namespace", "subtitle": "innovate-prod", "type": "container", "parentNode": "eks-cluster", "layout": "row"},
            {"id": "ns-monitoring", "label": "Monitoring Namespace", "subtitle": "monitoring", "type": "container", "parentNode": "eks-cluster", "layout": "row"},
            {"id": "ns-system", "label": "System Namespace", "subtitle": "kube-system", "type": "container", "parentNode": "eks-cluster", "layout": "row"},
            {"id": "ingress", "label": "AWS Load Balancer Controller", "subtitle": "Ingress Controller", "icon": "./assets/icons/ingress.svg", "parentNode": "ns-system"},
            {"id": "backend-deploy", "label": "Backend Deployment", "subtitle": "Flask API", "icon": "./assets/icons/backend-deploy.png", "parentNode": "ns-prod"},
            {"id": "frontend-deploy", "label": "Frontend Deployment", "subtitle": "React SPA", "icon": "./assets/icons/frontend-deploy.png", "parentNode": "ns-prod"},
            {"id": "worker-deploy", "label": "Worker Deployment", "subtitle": "Background Jobs", "icon": "./assets/icons/worker-deploy.png", "parentNode": "ns-prod"},
            {"id": "backend-svc", "label": "Backend Service", "subtitle": "ClusterIP", "icon": "./assets/icons/backend-svc.png", "parentNode": "ns-prod"},
            {"id": "frontend-svc", "label": "Frontend Service", "subtitle": "ClusterIP", "icon": "./assets/icons/frontend-svc.png", "parentNode": "ns-prod"},
            {"id": "redis-svc", "label": "Redis Service", "subtitle": "External Service", "icon": "./assets/icons/redis-svc.svg", "parentNode": "ns-prod"},
            {"id": "db-secret", "label": "Database Secret", "subtitle": "RDS Credentials", "icon": "./assets/icons/db-secret.png", "parentNode": "ns-prod"},
            {"id": "app-config", "label": "App ConfigMap", "subtitle": "Environment Config", "icon": "./assets/icons/app-config.png", "parentNode": "ns-prod"},
            {"id": "prometheus", "label": "Prometheus", "subtitle": "Metrics Collection", "icon": "./assets/icons/prometheus.png", "parentNode": "ns-monitoring"},
            {"id": "grafana", "label": "Grafana", "subtitle": "Dashboards", "icon": "./assets/icons/grafana.png", "parentNode": "ns-monitoring"},
            {"id": "fluentbit", "label": "Fluent Bit", "subtitle": "Log Collection", "icon": "./assets/icons/fluentbit.svg", "parentNode": "ns-monitoring"},
            {"id": "cluster-autoscaler", "label": "Cluster Autoscaler", "subtitle": "Node Scaling", "icon": "./assets/icons/cluster-autoscaler.svg", "parentNode": "ns-system"},
            {"id": "external-dns", "label": "External DNS", "subtitle": "DNS Management", "icon": "./assets/icons/external-dns.svg", "parentNode": "ns-system"}
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

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    
    // Initialize diagram (will be set up when first used)
    diagram = new DiagramGenerator();
    
    // Event listeners for file upload
    const fileUpload = document.getElementById('file-upload');
    const fileUploadWelcome = document.getElementById('file-upload-welcome');
    
    if (fileUpload) {
        fileUpload.addEventListener('change', handleFileUpload);
    }
    if (fileUploadWelcome) {
        fileUploadWelcome.addEventListener('change', handleFileUpload);
    }
    
    // Event listeners for example buttons
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

    // Control buttons
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const fitViewBtn = document.getElementById('fit-view');
    const resetLayoutBtn = document.getElementById('reset-layout');
    const closeInfoBtn = document.getElementById('close-info');
    const downloadBtn = document.getElementById('download-diagram');
    
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => {
            if (diagram) diagram.zoomIn();
        });
    }
    
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => {
            if (diagram) diagram.zoomOut();
        });
    }
    
    if (fitViewBtn) {
        fitViewBtn.addEventListener('click', () => {
            if (diagram) diagram.fitView();
        });
    }
    
    if (resetLayoutBtn) {
        resetLayoutBtn.addEventListener('click', () => {
            if (diagram) diagram.reset();
        });
    }
    
    if (closeInfoBtn) {
        closeInfoBtn.addEventListener('click', () => {
            document.getElementById('info-panel').style.display = 'none';
        });
    }

    // Download diagram as PNG
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            try {
                const svgElement = document.getElementById('diagram-svg');
                if (!svgElement) {
                    showToast('error', 'Diagram not found');
                    return;
                }
                
                const svgData = new XMLSerializer().serializeToString(svgElement);
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();
                
                canvas.width = svgElement.clientWidth;
                canvas.height = svgElement.clientHeight;
                
                img.onload = () => {
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                    
                    canvas.toBlob(blob => {
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.download = 'architecture-diagram.png';
                        link.href = url;
                        link.click();
                        URL.revokeObjectURL(url);
                        showToast('success', 'Diagram exported successfully!');
                    });
                };
                
                img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
            } catch (error) {
                showToast('error', 'Failed to export diagram: ' + error.message);
                console.error('Export error:', error);
            }
        });
    }
    
    console.log('App initialized successfully');
});

