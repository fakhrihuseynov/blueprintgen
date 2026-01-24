// Event Handlers for Diagram Interaction
// Mouse and touch event handling for panning, zooming, and node dragging

class EventHandlers {
    constructor(diagramCore) {
        this.core = diagramCore;
    }

    setupEventListeners() {
        if (!this.core.svg) {
            console.warn('SVG element not found, skipping event listeners');
            return;
        }
        
        // Mouse events for panning and node dragging
        this.core.svg.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.core.svg.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.core.svg.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.core.svg.addEventListener('mouseleave', this.onMouseUp.bind(this));
        
        // Mouse wheel for zooming (with passive: false for preventDefault)
        this.core.svg.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
        
        // Touch events for mobile (with passive: false for preventDefault)
        this.core.svg.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
        this.core.svg.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
        this.core.svg.addEventListener('touchend', this.onTouchEnd.bind(this));
    }

    onMouseDown(e) {
        // Try to find container group or node group using closest()
        const containerGroup = e.target.closest('.container-group');
        const nodeGroup = e.target.closest('.node-group');
        
        // Handle container dragging
        if (containerGroup && !nodeGroup) {
            e.preventDefault();
            e.stopPropagation();
            
            this.core.isDraggingNode = true;
            this.core.draggedNode = containerGroup;
            const containerId = containerGroup.getAttribute('data-container-id');
            const pos = this.core.layout[containerId];
            
            if (!pos) return;
            
            // Store child offsets relative to container before dragging
            this.core.nodes.filter(n => n.parentNode === containerId).forEach(child => {
                if (this.core.layout[child.id]) {
                    const childPos = this.core.layout[child.id];
                    childPos.offsetX = childPos.x - pos.x;
                    childPos.offsetY = childPos.y - pos.y;
                }
            });
            
            // Get click position in SVG coordinates
            const pt = this.core.svg.createSVGPoint();
            pt.x = e.clientX;
            pt.y = e.clientY;
            const svgPt = pt.matrixTransform(this.core.svg.getScreenCTM().inverse());
            
            this.core.nodeDragStart = {
                x: svgPt.x - pos.x,
                y: svgPt.y - pos.y
            };
            
            containerGroup.style.cursor = 'grabbing';
            return;
        }
        
        // Handle node dragging
        if (nodeGroup) {
            e.preventDefault();
            e.stopPropagation();
            
            this.core.isDraggingNode = true;
            this.core.draggedNode = nodeGroup;
            const nodeId = nodeGroup.getAttribute('data-node-id');
            const pos = this.core.layout[nodeId];
            
            if (!pos) return;
            
            // Get click position in SVG coordinates
            const pt = this.core.svg.createSVGPoint();
            pt.x = e.clientX;
            pt.y = e.clientY;
            const svgPt = pt.matrixTransform(this.core.svg.getScreenCTM().inverse());
            
            this.core.nodeDragStart = {
                x: svgPt.x - pos.x,
                y: svgPt.y - pos.y
            };
            
            nodeGroup.style.cursor = 'grabbing';
            return;
        }
        
        // Canvas panning - allow panning on any non-node click
        this.core.isDragging = true;
        this.core.dragStartX = e.clientX - this.core.transform.x;
        this.core.dragStartY = e.clientY - this.core.transform.y;
        this.core.svg.style.cursor = 'grabbing';
    }

    onMouseMove(e) {
        // Handle node/container dragging
        if (this.core.isDraggingNode && this.core.draggedNode) {
            e.preventDefault();
            e.stopPropagation();
            
            const pt = this.core.svg.createSVGPoint();
            pt.x = e.clientX;
            pt.y = e.clientY;
            const svgPt = pt.matrixTransform(this.core.svg.getScreenCTM().inverse());
            
            // Get ID from either data-node-id or data-container-id
            const nodeId = this.core.draggedNode.getAttribute('data-node-id') || 
                          this.core.draggedNode.getAttribute('data-container-id');
            if (!this.core.layout[nodeId]) return;
            
            const newX = svgPt.x - this.core.nodeDragStart.x;
            const newY = svgPt.y - this.core.nodeDragStart.y;
            
            // Update layout
            this.core.layout[nodeId].x = newX;
            this.core.layout[nodeId].y = newY;
            
            // If dragging container, update child positions using stored offsets
            if (this.core.draggedNode.classList.contains('container-group')) {
                this.core.nodes.filter(n => n.parentNode === nodeId).forEach(child => {
                    if (this.core.layout[child.id]) {
                        const childLayout = this.core.layout[child.id];
                        // Maintain child position relative to container using pre-stored offsets
                        if (childLayout.offsetX !== undefined && childLayout.offsetY !== undefined) {
                            childLayout.x = newX + childLayout.offsetX;
                            childLayout.y = newY + childLayout.offsetY;
                        }
                    }
                });
            }
            
            // Redraw diagram
            this.core.redrawDiagram();
            return;
        }
        
        // Handle canvas panning
        if (this.core.isDragging) {
            this.core.transform.x = e.clientX - this.core.dragStartX;
            this.core.transform.y = e.clientY - this.core.dragStartY;
            this.core.updateTransform();
        }
    }

    onMouseUp() {
        if (this.core.isDraggingNode) {
            this.core.isDraggingNode = false;
            if (this.core.draggedNode) {
                this.core.draggedNode.style.cursor = 'grab';
                this.core.draggedNode = null;
            }
        }
        
        if (this.core.isDragging) {
            this.core.isDragging = false;
            this.core.svg.style.cursor = 'default';
        }
    }

    onWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = this.core.transform.scale * delta;
        
        if (newScale >= 0.1 && newScale <= 3) {
            const rect = this.core.svg.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.core.transform.x = x - (x - this.core.transform.x) * delta;
            this.core.transform.y = y - (y - this.core.transform.y) * delta;
            this.core.transform.scale = newScale;
            
            this.core.updateTransform();
        }
    }

    onTouchStart(e) {
        if (e.touches.length === 1) {
            this.core.isDragging = true;
            this.core.dragStartX = e.touches[0].clientX - this.core.transform.x;
            this.core.dragStartY = e.touches[0].clientY - this.core.transform.y;
        }
    }

    onTouchMove(e) {
        if (this.core.isDragging && e.touches.length === 1) {
            e.preventDefault();
            this.core.transform.x = e.touches[0].clientX - this.core.dragStartX;
            this.core.transform.y = e.touches[0].clientY - this.core.dragStartY;
            this.core.updateTransform();
        }
    }

    onTouchEnd() {
        this.core.isDragging = false;
    }
}
