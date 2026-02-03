// drawio-exporter.js - Export diagrams to Draw.io format with proper cloud icons

class DrawioExporter {
    constructor() {
        this.cellIdCounter = 0;
        this.iconShapeMap = this.buildIconShapeMap();
    }

    // Map icon paths to draw.io shapes and styles
    buildIconShapeMap() {
        return {
            // AWS Compute
            'EC2': { shape: 'mxgraph.aws4.ec2', category: 'aws4', fillColor: '#ED7100' },
            'Lambda': { shape: 'mxgraph.aws4.lambda_function', category: 'aws4', fillColor: '#ED7100' },
            'Elastic-Kubernetes-Service': { shape: 'mxgraph.aws4.eks_cloud', category: 'aws4', fillColor: '#ED7100' },
            'Elastic-Container-Service': { shape: 'mxgraph.aws4.ecs', category: 'aws4', fillColor: '#ED7100' },
            'Elastic-Container-Registry': { shape: 'mxgraph.aws4.ecr', category: 'aws4', fillColor: '#ED7100' },
            
            // AWS Networking
            'VPC': { shape: 'mxgraph.aws4.vpc', category: 'aws4', fillColor: '#8C4FFF' },
            'Virtual-Private-Cloud': { shape: 'mxgraph.aws4.vpc', category: 'aws4', fillColor: '#8C4FFF' },
            'Internet-Gateway': { shape: 'mxgraph.aws4.internet_gateway', category: 'aws4', fillColor: '#8C4FFF' },
            'NAT-Gateway': { shape: 'mxgraph.aws4.nat_gateway', category: 'aws4', fillColor: '#8C4FFF' },
            'Elastic-Load-Balancing': { shape: 'mxgraph.aws4.elastic_load_balancing', category: 'aws4', fillColor: '#8C4FFF' },
            'Application-Load-Balancer': { shape: 'mxgraph.aws4.application_load_balancer', category: 'aws4', fillColor: '#8C4FFF' },
            'Network-Load-Balancer': { shape: 'mxgraph.aws4.network_load_balancer', category: 'aws4', fillColor: '#8C4FFF' },
            'Route-53': { shape: 'mxgraph.aws4.route_53', category: 'aws4', fillColor: '#8C4FFF' },
            'CloudFront': { shape: 'mxgraph.aws4.cloudfront', category: 'aws4', fillColor: '#8C4FFF' },
            'API-Gateway': { shape: 'mxgraph.aws4.api_gateway', category: 'aws4', fillColor: '#8C4FFF' },
            
            // AWS Database
            'RDS': { shape: 'mxgraph.aws4.rds', category: 'aws4', fillColor: '#3334B9' },
            'DynamoDB': { shape: 'mxgraph.aws4.dynamodb', category: 'aws4', fillColor: '#3334B9' },
            'ElastiCache': { shape: 'mxgraph.aws4.elasticache', category: 'aws4', fillColor: '#3334B9' },
            'Aurora': { shape: 'mxgraph.aws4.aurora', category: 'aws4', fillColor: '#3334B9' },
            
            // AWS Storage
            'Simple-Storage-Service': { shape: 'mxgraph.aws4.s3', category: 'aws4', fillColor: '#7AA116' },
            'S3': { shape: 'mxgraph.aws4.s3', category: 'aws4', fillColor: '#7AA116' },
            'Elastic-Block-Store': { shape: 'mxgraph.aws4.ebs', category: 'aws4', fillColor: '#7AA116' },
            'Elastic-File-System': { shape: 'mxgraph.aws4.efs', category: 'aws4', fillColor: '#7AA116' },
            
            // AWS Security
            'Identity-and-Access-Management': { shape: 'mxgraph.aws4.iam', category: 'aws4', fillColor: '#DD344C' },
            'IAM': { shape: 'mxgraph.aws4.iam', category: 'aws4', fillColor: '#DD344C' },
            'Key-Management-Service': { shape: 'mxgraph.aws4.kms', category: 'aws4', fillColor: '#DD344C' },
            'Secrets-Manager': { shape: 'mxgraph.aws4.secrets_manager', category: 'aws4', fillColor: '#DD344C' },
            'Certificate-Manager': { shape: 'mxgraph.aws4.certificate_manager', category: 'aws4', fillColor: '#DD344C' },
            'Security-Group': { shape: 'mxgraph.aws4.security_group', category: 'aws4', fillColor: '#DD344C' },
            
            // AWS Management
            'CloudWatch': { shape: 'mxgraph.aws4.cloudwatch', category: 'aws4', fillColor: '#E7157B' },
            'CloudFormation': { shape: 'mxgraph.aws4.cloudformation', category: 'aws4', fillColor: '#E7157B' },
            'Systems-Manager': { shape: 'mxgraph.aws4.systems_manager', category: 'aws4', fillColor: '#E7157B' },
            
            // Azure Icons
            'Virtual-Machine': { shape: 'mxgraph.azure.compute.Virtual-Machine', category: 'azure', fillColor: '#0089D6' },
            'Kubernetes-Service': { shape: 'mxgraph.azure.compute.Kubernetes-Service', category: 'azure', fillColor: '#0089D6' },
            'Virtual-Network': { shape: 'mxgraph.azure.networking.Virtual-Network', category: 'azure', fillColor: '#0089D6' },
            'Storage-Account': { shape: 'mxgraph.azure.storage.Storage-Account', category: 'azure', fillColor: '#0089D6' },
            
            // Kubernetes Resources - use custom colors/shapes
            'deploy': { shape: 'ellipse', category: 'k8s', fillColor: '#326CE5', strokeColor: '#326CE5' },
            'svc': { shape: 'rhombus', category: 'k8s', fillColor: '#326CE5', strokeColor: '#326CE5' },
            'pod': { shape: 'ellipse', category: 'k8s', fillColor: '#326CE5', strokeColor: '#326CE5' },
            'ing': { shape: 'trapezoid', category: 'k8s', fillColor: '#326CE5', strokeColor: '#326CE5' },
            'cm': { shape: 'rectangle', category: 'k8s', fillColor: '#326CE5', strokeColor: '#326CE5' },
            'secret': { shape: 'rectangle', category: 'k8s', fillColor: '#F7A81B', strokeColor: '#F7A81B' },
            'ns': { shape: 'swimlane', category: 'k8s', fillColor: '#E8F5E9', strokeColor: '#326CE5' },
            
            // Generic fallback
            'default': { shape: 'rectangle', category: 'generic', fillColor: '#E0E0E0', strokeColor: '#757575' }
        };
    }

    // Get draw.io shape info from icon path
    getShapeInfo(iconPath) {
        if (!iconPath) {
            return this.iconShapeMap.default;
        }

        // Extract service name from path
        const parts = iconPath.split('/');
        const filename = parts[parts.length - 1];
        const serviceName = filename.replace('.svg', '').replace('.png', '');

        // Try exact match first
        if (this.iconShapeMap[serviceName]) {
            return this.iconShapeMap[serviceName];
        }

        // Try partial matches (case insensitive)
        const lowerService = serviceName.toLowerCase();
        for (const [key, value] of Object.entries(this.iconShapeMap)) {
            const lowerKey = key.toLowerCase();
            if (lowerService.includes(lowerKey) || lowerKey.includes(lowerService)) {
                return value;
            }
        }

        // Return default
        return this.iconShapeMap.default;
    }

    // Generate unique cell ID
    getCellId() {
        return (++this.cellIdCounter).toString();
    }

    // Create mxCell XML element
    createMxCell(id, value, style, geometry, parent = "1", vertex = true, edge = false) {
        const cell = {
            id,
            value: this.escapeXml(value || ''),
            style: style || '',
            parent,
            vertex: vertex ? "1" : undefined,
            edge: edge ? "1" : undefined
        };

        let xml = `<mxCell`;
        for (const [key, val] of Object.entries(cell)) {
            if (val !== undefined) {
                xml += ` ${key}="${val}"`;
            }
        }
        
        if (geometry) {
            xml += `>\n          ${geometry}\n        </mxCell>`;
        } else {
            xml += `/>`;
        }

        return xml;
    }

    // Create geometry XML
    createGeometry(x, y, width, height) {
        return `<mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry"/>`;
    }

    // Create container (swimlane) style
    createContainerStyle(node) {
        const styles = [
            'swimlane',
            'fontStyle=1',
            'childLayout=stackLayout',
            'horizontal=1',
            'startSize=60',
            'fillColor=#E3F2FD',
            'strokeColor=#4F46E5',
            'strokeWidth=2',
            'rounded=1',
            'whiteSpace=wrap',
            'html=1',
            'fontSize=14',
            'fontColor=#1E3A8A',
            'swimlaneFillColor=#F8FAFC'
        ];
        return styles.join(';');
    }

    // Create node style with proper cloud icon
    createNodeStyle(node) {
        const shapeInfo = this.getShapeInfo(node.icon);
        
        const styles = [];
        
        if (shapeInfo.category === 'aws4') {
            // AWS icon with proper shape
            styles.push(`shape=${shapeInfo.shape}`);
            styles.push('grIcon=1'); // Enable grIcon for AWS
            styles.push('verticalLabelPosition=bottom');
            styles.push('verticalAlign=top');
            styles.push('aspect=fixed');
            styles.push(`fillColor=${shapeInfo.fillColor}`);
            styles.push('gradientColor=none');
            styles.push('strokeColor=none');
        } else if (shapeInfo.category === 'azure') {
            // Azure icon with proper shape
            styles.push(`shape=${shapeInfo.shape}`);
            styles.push('verticalLabelPosition=bottom');
            styles.push('verticalAlign=top');
            styles.push('aspect=fixed');
            styles.push(`fillColor=${shapeInfo.fillColor}`);
        } else if (shapeInfo.category === 'k8s') {
            // Kubernetes custom shape
            styles.push(`shape=${shapeInfo.shape}`);
            styles.push(`fillColor=${shapeInfo.fillColor}`);
            styles.push(`strokeColor=${shapeInfo.strokeColor}`);
            styles.push('strokeWidth=2');
            styles.push('rounded=1');
            styles.push('whiteSpace=wrap');
            styles.push('html=1');
            styles.push('verticalLabelPosition=bottom');
            styles.push('verticalAlign=top');
            styles.push('fontColor=#000000');
        } else {
            // Generic shape
            styles.push('shape=rectangle');
            styles.push(`fillColor=${shapeInfo.fillColor}`);
            styles.push(`strokeColor=${shapeInfo.strokeColor}`);
            styles.push('strokeWidth=2');
            styles.push('rounded=1');
            styles.push('whiteSpace=wrap');
            styles.push('html=1');
        }

        styles.push('fontFamily=Helvetica');
        styles.push('fontSize=12');
        
        return styles.join(';');
    }

    // Create edge style
    createEdgeStyle(edge) {
        const styles = [
            'edgeStyle=orthogonalEdgeStyle',
            'rounded=1',
            'orthogonalLoop=1',
            'jettySize=auto',
            'html=1',
            'strokeColor=#4F46E5',
            'strokeWidth=2',
            'endArrow=classic',
            'endFill=1',
            'fontColor=#4B5563',
            'fontSize=11',
            'labelBackgroundColor=#FFFFFF'
        ];
        return styles.join(';');
    }

    // Escape XML special characters
    escapeXml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    // Calculate layout positions (simplified hierarchical layout)
    calculatePositions(nodes, edges) {
        const positions = {};
        const containers = nodes.filter(n => n.type === 'container');
        const regularNodes = nodes.filter(n => n.type !== 'container');
        
        let currentX = 50;
        let currentY = 50;
        const spacing = 200;
        const containerPadding = 100;
        
        // Position containers first
        containers.forEach((container, index) => {
            const childNodes = regularNodes.filter(n => n.parentNode === container.id);
            const childCount = childNodes.length;
            
            // Calculate container size based on children
            const cols = Math.ceil(Math.sqrt(childCount)) || 2;
            const rows = Math.ceil(childCount / cols) || 1;
            const containerWidth = cols * 150 + (cols + 1) * 30 + 40;
            const containerHeight = rows * 150 + (rows + 1) * 30 + 100;
            
            positions[container.id] = {
                x: currentX,
                y: currentY,
                width: Math.max(containerWidth, 300),
                height: Math.max(containerHeight, 250),
                type: 'container'
            };
            
            // Position children inside container
            let childX = 30;
            let childY = 90;
            let col = 0;
            
            childNodes.forEach((child, i) => {
                positions[child.id] = {
                    x: childX,
                    y: childY,
                    width: 78,
                    height: 78,
                    type: 'node',
                    parentId: container.id
                };
                
                col++;
                if (col >= cols) {
                    col = 0;
                    childX = 30;
                    childY += 180;
                } else {
                    childX += 150;
                }
            });
            
            currentX += positions[container.id].width + spacing;
            if (currentX > 1200) {
                currentX = 50;
                currentY += positions[container.id].height + spacing;
            }
        });
        
        // Position orphan nodes (no parent)
        const orphanNodes = regularNodes.filter(n => !n.parentNode);
        orphanNodes.forEach((node, index) => {
            positions[node.id] = {
                x: currentX,
                y: currentY,
                width: 78,
                height: 78,
                type: 'node'
            };
            
            currentX += 150;
            if (currentX > 1200) {
                currentX = 50;
                currentY += 200;
            }
        });
        
        return positions;
    }

    // Export diagram to draw.io XML format
    export(nodes, edges) {
        this.cellIdCounter = 2; // Start from 2 (0 and 1 are reserved)
        const positions = this.calculatePositions(nodes, edges);
        
        // Build cells XML
        let cellsXml = '';
        const nodeIdMap = {}; // Map node.id to cell id
        
        // Add containers first
        nodes.filter(n => n.type === 'container').forEach(node => {
            const cellId = this.getCellId();
            nodeIdMap[node.id] = cellId;
            
            const pos = positions[node.id];
            const label = node.subtitle ? `${node.label}\\n${node.subtitle}` : node.label;
            const style = this.createContainerStyle(node);
            const geometry = this.createGeometry(pos.x, pos.y, pos.width, pos.height);
            
            cellsXml += '        ' + this.createMxCell(cellId, label, style, geometry, "1", true, false) + '\n';
        });
        
        // Add regular nodes
        nodes.filter(n => n.type !== 'container').forEach(node => {
            const cellId = this.getCellId();
            nodeIdMap[node.id] = cellId;
            
            const pos = positions[node.id];
            const label = node.subtitle ? `${node.label}\\n${node.subtitle}` : node.label;
            const style = this.createNodeStyle(node);
            
            // If node has parent, use relative positioning
            const parentCellId = node.parentNode ? nodeIdMap[node.parentNode] : "1";
            const geometry = this.createGeometry(pos.x, pos.y, pos.width, pos.height);
            
            cellsXml += '        ' + this.createMxCell(cellId, label, style, geometry, parentCellId, true, false) + '\n';
        });
        
        // Add edges
        edges.forEach(edge => {
            const cellId = this.getCellId();
            const sourceCellId = nodeIdMap[edge.source];
            const targetCellId = nodeIdMap[edge.target];
            
            if (!sourceCellId || !targetCellId) {
                console.warn(`Edge ${edge.id} references non-existent node`);
                return;
            }
            
            const style = this.createEdgeStyle(edge);
            const edgeXml = `<mxCell id="${cellId}" value="${this.escapeXml(edge.label || '')}" style="${style}" parent="1" edge="1" source="${sourceCellId}" target="${targetCellId}">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>`;
            
            cellsXml += '        ' + edgeXml + '\n';
        });
        
        // Build complete draw.io XML
        const drawioXml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="${new Date().toISOString()}" agent="Blueprint Generator" version="21.0.0" etag="${Date.now()}" type="device">
  <diagram name="Architecture" id="architecture-diagram">
    <mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1600" pageHeight="1200" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
${cellsXml}      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
        
        return drawioXml;
    }

    // Download as .drawio file
    download(nodes, edges, filename = 'architecture-diagram.drawio') {
        const xml = this.export(nodes, edges);
        const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DrawioExporter;
}
