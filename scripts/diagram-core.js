// diagram-core.js - Core DiagramGenerator class with rendering and transforms

class DiagramGenerator {
    constructor() {
        this.svg = document.getElementById('diagram-svg');
        this.group = document.getElementById('diagram-group');
        this.transform = { x: 0, y: 0, scale: 1 };
        this.nodes = [];
        this.edges = [];
        this.layout = {};
        
        // Dragging state
        this.isDragging = false;
        this.isDraggingNode = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.draggedNode = null;
        
        // Instantiate sub-modules
        this.layoutEngine = new LayoutEngine();
        this.eventHandlers = new EventHandlers(this);
    }

    setupEventListeners() {
        this.eventHandlers.setupEventListeners(this.svg);
    }

    // Update SVG transform for pan and zoom (alias to applyTransform)
    updateTransform() {
        this.applyTransform();
    }

    // Layout calculation (delegates to LayoutEngine)
    calculateLayout(nodes, edges) {
        this.layout = this.layoutEngine.calculateLayout(nodes, edges);
        return this.layout;
    }

    // Drawing methods
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
        rect.setAttribute('stroke-dasharray', '8,4');
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
        g.style.cursor = 'grab';
        
        // Add transparent interaction layer
        const interactionRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        interactionRect.setAttribute('x', pos.x - 10);
        interactionRect.setAttribute('y', pos.y - 10);
        interactionRect.setAttribute('width', pos.width + 20);
        interactionRect.setAttribute('height', pos.height + 50);
        interactionRect.setAttribute('fill', 'transparent');
        interactionRect.setAttribute('class', 'node-interaction-layer');
        g.appendChild(interactionRect);
        
        // Node rectangle (compact)
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', pos.x);
        rect.setAttribute('y', pos.y);
        rect.setAttribute('width', pos.width);
        rect.setAttribute('height', pos.height);
        rect.setAttribute('rx', 8);
        rect.setAttribute('class', 'node-rect');
        rect.style.pointerEvents = 'none';
        g.appendChild(rect);
        
        // Icon (centered in square frame) - 48px
        if (node.icon) {
            const iconSize = 48;
            const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            image.setAttribute('x', pos.x + (pos.width - iconSize) / 2);
            image.setAttribute('y', pos.y + (pos.height - iconSize) / 2);
            image.setAttribute('width', iconSize);
            image.setAttribute('height', iconSize);
            image.setAttribute('href', node.icon);
            image.setAttribute('class', 'node-icon');
            image.style.pointerEvents = 'none';
            g.appendChild(image);
        }
        
        // Label BELOW the box
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', pos.x + pos.width / 2);
        text.setAttribute('y', pos.y + pos.height + 18);
        text.setAttribute('class', 'node-label');
        text.setAttribute('text-anchor', 'middle');
        text.style.pointerEvents = 'none';
        text.textContent = node.label;
        g.appendChild(text);
        
        // Subtitle BELOW the label
        if (node.subtitle) {
            const subtitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            subtitle.setAttribute('x', pos.x + pos.width / 2);
            subtitle.setAttribute('y', pos.y + pos.height + 32);
            subtitle.setAttribute('class', 'node-subtitle');
            subtitle.setAttribute('text-anchor', 'middle');
            subtitle.style.pointerEvents = 'none';
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
            
            // Calculate optimal connection points
            let x1, y1, x2, y2;
            
            const spacing = 15;
            const labelSpacing = 25;
            
            // Determine relative positions
            const isTargetBelow = targetPos.y > sourcePos.y + sourcePos.height + labelSpacing;
            const isTargetAbove = targetPos.y + targetPos.height + labelSpacing < sourcePos.y;
            const isTargetRight = targetPos.x > sourcePos.x + sourcePos.width;
            const isTargetLeft = targetPos.x + targetPos.width < sourcePos.x;
            
            // Choose connection points
            if (isTargetBelow) {
                x1 = sourcePos.x + sourcePos.width / 2;
                y1 = sourcePos.y + sourcePos.height + labelSpacing + spacing;
                x2 = targetPos.x + targetPos.width / 2;
                y2 = targetPos.y - spacing;
            } else if (isTargetAbove) {
                x1 = sourcePos.x + sourcePos.width / 2;
                y1 = sourcePos.y - spacing;
                x2 = targetPos.x + targetPos.width / 2;
                y2 = targetPos.y + targetPos.height + labelSpacing + spacing;
            } else if (isTargetRight) {
                x1 = sourcePos.x + sourcePos.width + spacing;
                y1 = sourcePos.y + sourcePos.height / 2;
                x2 = targetPos.x - spacing;
                y2 = targetPos.y + targetPos.height / 2;
            } else if (isTargetLeft) {
                x1 = sourcePos.x - spacing;
                y1 = sourcePos.y + sourcePos.height / 2;
                x2 = targetPos.x + targetPos.width + spacing;
                y2 = targetPos.y + targetPos.height / 2;
            } else {
                x1 = sourcePos.x + sourcePos.width + spacing;
                y1 = sourcePos.y + sourcePos.height / 2;
                x2 = targetPos.x - spacing;
                y2 = targetPos.y + targetPos.height / 2;
            }
            
            // Create orthogonal path with curved corners
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let d;
            const curveRadius = 15; // Add rounded corners to reduce harsh angles
            
            if (isTargetBelow || isTargetAbove) {
                const midY = (y1 + y2) / 2;
                if (Math.abs(x2 - x1) < 10) {
                    d = `M ${x1} ${y1} L ${x2} ${y2}`;
                } else {
                    // Add curves using quadratic bezier
                    const offsetX = x2 - x1;
                    const curveOffset = Math.min(Math.abs(offsetX) / 4, curveRadius);
                    d = `M ${x1} ${y1} 
                         L ${x1} ${midY - curveOffset}
                         Q ${x1} ${midY} ${x1 + Math.sign(offsetX) * curveOffset} ${midY}
                         L ${x2 - Math.sign(offsetX) * curveOffset} ${midY}
                         Q ${x2} ${midY} ${x2} ${midY + curveOffset}
                         L ${x2} ${y2}`;
                }
            } else {
                const midX = (x1 + x2) / 2;
                if (Math.abs(y2 - y1) < 10) {
                    d = `M ${x1} ${y1} L ${x2} ${y2}`;
                } else {
                    // Add curves using quadratic bezier
                    const offsetY = y2 - y1;
                    const curveOffset = Math.min(Math.abs(offsetY) / 4, curveRadius);
                    d = `M ${x1} ${y1}
                         L ${midX - curveOffset} ${y1}
                         Q ${midX} ${y1} ${midX} ${y1 + Math.sign(offsetY) * curveOffset}
                         L ${midX} ${y2 - Math.sign(offsetY) * curveOffset}
                         Q ${midX} ${y2} ${midX + curveOffset} ${y2}
                         L ${x2} ${y2}`;
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

    // Transform methods
    applyTransform() {
        this.group.setAttribute('transform', 
            `translate(${this.transform.x}, ${this.transform.y}) scale(${this.transform.scale})`);
    }

    zoomIn() {
        this.transform.scale = Math.min(this.transform.scale * 1.2, 3);
        this.applyTransform();
    }

    zoomOut() {
        this.transform.scale = Math.max(this.transform.scale / 1.2, 0.3);
        this.applyTransform();
    }

    fitView() {
        if (!this.group.getBBox) return;
        
        const bbox = this.group.getBBox();
        const svgRect = this.svg.getBoundingClientRect();
        
        const scaleX = svgRect.width / (bbox.width + 200);
        const scaleY = svgRect.height / (bbox.height + 200);
        const scale = Math.min(scaleX, scaleY, 1);
        
        this.transform.scale = scale;
        this.transform.x = (svgRect.width - bbox.width * scale) / 2 - bbox.x * scale;
        this.transform.y = (svgRect.height - bbox.height * scale) / 2 - bbox.y * scale;
        
        this.applyTransform();
    }

    reset() {
        this.transform = { x: 0, y: 0, scale: 1 };
        this.applyTransform();
    }

    // Update info panel
    updateInfo(jsonData) {
        document.getElementById('node-count').textContent = jsonData.nodes.length;
        document.getElementById('edge-count').textContent = jsonData.edges.length;
        const containerCount = jsonData.nodes.filter(n => n.type === 'container').length;
        document.getElementById('container-count').textContent = containerCount;
    }

    redrawDiagram() {
        this.group.innerHTML = '';
        this.drawEdges(this.layout);
        this.drawNodes(this.layout);
    }

    clear() {
        while (this.group.firstChild) {
            this.group.removeChild(this.group.firstChild);
        }
        this.nodes = [];
        this.edges = [];
        this.layout = {};
    }
}
