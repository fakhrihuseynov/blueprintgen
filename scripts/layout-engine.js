// Layout Engine for Diagram Positioning
// Hierarchical and container-based layout algorithms

class LayoutEngine {
    calculateLayout(nodes, edges) {
        // Check if we have containers (like VPC, K8s namespaces)
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
            
            // Dynamic sizing based on child count
            const childCount = children.length;
            const rowLayout = node.layout === 'row'; // Use row layout if specified
            
            let containerWidth, containerHeight, cols, rows;
            
            if (rowLayout || childCount <= 5) {
                // Single row layout for small containers
                cols = childCount;
                rows = 1;
                containerWidth = Math.max(300, cols * 150 + 100);
                containerHeight = 180;
            } else {
                // Grid layout for larger containers
                cols = Math.min(4, Math.ceil(Math.sqrt(childCount)));
                rows = Math.ceil(childCount / cols);
                containerWidth = cols * 150 + 100;
                containerHeight = rows * 140 + 80;
            }
            
            layout[node.id] = {
                x: 50,
                y: containerY,
                width: containerWidth,
                height: containerHeight,
                type: 'container'
            };
            
            // Layout children within container
            children.forEach((child, childIndex) => {
                const col = childIndex % cols;
                const row = Math.floor(childIndex / cols);
                layout[child.id] = {
                    x: layout[node.id].x + 50 + col * 150,
                    y: layout[node.id].y + 50 + row * 130,
                    width: 70,
                    height: 70,
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
                width: 70,
                height: 70,
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
        
        const queue = startNodes.map(n => ({ id: n.id, layer: 0 }));
        startNodes.forEach(n => visited.add(n.id));
        
        while (queue.length > 0) {
            const { id, layer } = queue.shift();
            
            if (!layers[layer]) layers[layer] = [];
            layers[layer].push(id);
            nodeLayer[id] = layer;
            
            // Add children to next layer
            if (outgoing[id]) {
                outgoing[id].forEach(targetId => {
                    if (!visited.has(targetId)) {
                        visited.add(targetId);
                        queue.push({ id: targetId, layer: layer + 1 });
                    }
                });
            }
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
        
        // Group nodes by module/subtitle in the same layer
        layers.forEach((layer, layerIdx) => {
            const byModule = {};
            layer.forEach(nodeId => {
                const node = nodes.find(n => n.id === nodeId);
                const module = node?.subtitle || 'default';
                if (!byModule[module]) byModule[module] = [];
                byModule[module].push(nodeId);
            });
            
            // Flatten back to array, keeping modules together
            layers[layerIdx] = [];
            Object.values(byModule).forEach(moduleNodes => {
                layers[layerIdx].push(...moduleNodes);
            });
        });
        
        // Calculate positions
        const layerGap = 200;
        const nodeGap = 280;
        
        layers.forEach((layer, layerIdx) => {
            const layerWidth = layer.length * nodeGap;
            const startX = 100;
            const y = 100 + layerIdx * layerGap;
            
            layer.forEach((nodeId, nodeIdx) => {
                layout[nodeId] = {
                    x: startX + nodeIdx * nodeGap,
                    y: y,
                    width: 70,
                    height: 70,
                    type: 'node'
                };
            });
        });
        
        return layout;
    }
}
