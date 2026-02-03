# Draw.io Export Feature 🎨

## Overview

The Blueprint Generator now includes a powerful **Draw.io export** feature that generates `.drawio` files with **proper cloud provider icons** and **correct visual structure**. The exported files can be opened in [draw.io (diagrams.net)](https://app.diagrams.net) and will display professional AWS/Azure/Kubernetes icons instead of basic shapes.

## Features ✨

- **AWS Cloud Icons**: Uses proper `mxgraph.aws4.*` shapes for AWS services
- **Azure Icons**: Supports Azure service shapes with `mxgraph.azure.*`
- **Kubernetes Resources**: Custom shapes and colors for K8s resources
- **Container Grouping**: Swimlanes for logical grouping (VPCs, namespaces, etc.)
- **Orthogonal Routing**: Professional edge routing with right angles
- **Hierarchical Layout**: Automatic positioning with nested containers
- **Full Compatibility**: Works perfectly with draw.io web and desktop apps

## How to Use 📋

### 1. Load Your Diagram

First, load your architecture diagram in the Blueprint Generator:
- Upload a JSON file, or
- Use the AI Generator to create one, or
- Load the example diagram

### 2. Export to Draw.io

Once your diagram is displayed:
1. Click the **"Export Draw.io"** button in the header
2. The `.drawio` file will be downloaded automatically
3. Open the file in [draw.io](https://app.diagrams.net)

### 3. View in Draw.io

Open the exported file:
- **Web**: Go to https://app.diagrams.net → File → Open → Select your `.drawio` file
- **Desktop**: Open with draw.io desktop app

You'll see:
- ✅ Proper AWS service icons (EC2, VPC, RDS, Lambda, etc.)
- ✅ Container groupings with swimlanes
- ✅ Professional edge routing
- ✅ Editable nodes and connections

## Supported Cloud Services 🔧

### AWS Services (mxgraph.aws4.*)

The exporter automatically maps AWS services to their proper draw.io shapes:

#### Compute
- **EC2** → `mxgraph.aws4.ec2` (Orange, #ED7100)
- **Lambda** → `mxgraph.aws4.lambda_function`
- **EKS** → `mxgraph.aws4.eks_cloud`
- **ECS** → `mxgraph.aws4.ecs`
- **ECR** → `mxgraph.aws4.ecr`

#### Networking
- **VPC** → `mxgraph.aws4.vpc` (Purple, #8C4FFF)
- **Internet Gateway** → `mxgraph.aws4.internet_gateway`
- **NAT Gateway** → `mxgraph.aws4.nat_gateway`
- **Load Balancer** → `mxgraph.aws4.elastic_load_balancing`
- **ALB** → `mxgraph.aws4.application_load_balancer`
- **NLB** → `mxgraph.aws4.network_load_balancer`
- **Route 53** → `mxgraph.aws4.route_53`
- **CloudFront** → `mxgraph.aws4.cloudfront`
- **API Gateway** → `mxgraph.aws4.api_gateway`

#### Database
- **RDS** → `mxgraph.aws4.rds` (Blue, #3334B9)
- **DynamoDB** → `mxgraph.aws4.dynamodb`
- **ElastiCache** → `mxgraph.aws4.elasticache`
- **Aurora** → `mxgraph.aws4.aurora`

#### Storage
- **S3** → `mxgraph.aws4.s3` (Green, #7AA116)
- **EBS** → `mxgraph.aws4.ebs`
- **EFS** → `mxgraph.aws4.efs`

#### Security & Identity
- **IAM** → `mxgraph.aws4.iam` (Red, #DD344C)
- **KMS** → `mxgraph.aws4.kms`
- **Secrets Manager** → `mxgraph.aws4.secrets_manager`
- **Certificate Manager** → `mxgraph.aws4.certificate_manager`
- **Security Group** → `mxgraph.aws4.security_group`

#### Management & Monitoring
- **CloudWatch** → `mxgraph.aws4.cloudwatch` (Pink, #E7157B)
- **CloudFormation** → `mxgraph.aws4.cloudformation`
- **Systems Manager** → `mxgraph.aws4.systems_manager`

### Azure Services (mxgraph.azure.*)

- **Virtual Machine** → `mxgraph.azure.compute.Virtual-Machine`
- **Kubernetes Service** → `mxgraph.azure.compute.Kubernetes-Service`
- **Virtual Network** → `mxgraph.azure.networking.Virtual-Network`
- **Storage Account** → `mxgraph.azure.storage.Storage-Account`

### Kubernetes Resources

Custom shapes with K8s blue (#326CE5):
- **Deployment** → Ellipse
- **Service** → Rhombus
- **Pod** → Ellipse
- **Ingress** → Trapezoid
- **ConfigMap** → Rectangle
- **Secret** → Rectangle (Orange)
- **Namespace** → Swimlane (Container)

## Technical Details 🔍

### Draw.io File Format

The exporter generates valid **mxGraph XML** format:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" ...>
  <diagram name="Architecture" ...>
    <mxGraphModel ...>
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <!-- Nodes and edges here -->
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

### Shape Styles

#### AWS Resources
```
shape=mxgraph.aws4.ec2;
grIcon=1;
verticalLabelPosition=bottom;
verticalAlign=top;
aspect=fixed;
fillColor=#ED7100;
gradientColor=none;
strokeColor=none;
```

#### Containers (Swimlanes)
```
swimlane;
fontStyle=1;
childLayout=stackLayout;
fillColor=#E3F2FD;
strokeColor=#4F46E5;
strokeWidth=2;
rounded=1;
```

#### Edges (Connections)
```
edgeStyle=orthogonalEdgeStyle;
rounded=1;
strokeColor=#4F46E5;
strokeWidth=2;
endArrow=classic;
```

### Layout Algorithm

The exporter uses a hierarchical layout:
1. **Container nodes** are positioned first (left-to-right)
2. **Child nodes** are placed inside containers in a grid
3. **Nested containers** are supported
4. **Orphan nodes** (no parent) are positioned separately

## Comparison: Before vs After 📊

### Before (Old Export)
```xml
<mxCell value="EC2 Instance" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#4F46E5;" .../>
```
- ❌ Basic rectangle shape
- ❌ No cloud provider icon
- ❌ Generic appearance

### After (New Export)
```xml
<mxCell value="EC2 Instance" style="shape=mxgraph.aws4.ec2;grIcon=1;fillColor=#ED7100;" .../>
```
- ✅ Proper AWS EC2 icon
- ✅ Official AWS orange color
- ✅ Professional appearance

## Implementation Files 📁

### `/scripts/drawio-exporter.js`
Main exporter class with:
- Icon shape mapping for AWS/Azure/K8s
- mxGraph XML generation
- Layout calculation
- Style creation

### `/scripts/main.js`
Integration with main app:
- Export button handler
- Diagram data access
- Download functionality

### `/index.html`
UI elements:
- "Export Draw.io" button in header
- SVG icon for button

## Extending the Exporter 🔧

To add support for more cloud services:

1. **Update Icon Map** in `drawio-exporter.js`:
```javascript
'New-Service': { 
    shape: 'mxgraph.aws4.new_service', 
    category: 'aws4', 
    fillColor: '#COLOR' 
}
```

2. **Test with Sample JSON**:
```json
{
  "nodes": [{
    "id": "test",
    "label": "New Service",
    "icon": "./assets/icons/AWS/Category/New-Service.svg"
  }]
}
```

3. **Export and Verify** in draw.io

## Troubleshooting 🔧

### Icons Don't Show in Draw.io

**Cause**: Shape name doesn't match draw.io's library

**Solution**: Check the [draw.io shape library](https://github.com/jgraph/drawio/tree/dev/src/main/webapp/shapes) for correct shape names

### Layout Issues

**Cause**: Container size calculation

**Solution**: Adjust container sizing in `calculatePositions()` method

### Missing Connections

**Cause**: Edge references non-existent node

**Solution**: Verify all `source` and `target` IDs exist in nodes array

## Future Enhancements 🚀

Planned improvements:
- [ ] GCP icon support
- [ ] Custom icon upload/embedding
- [ ] Style customization (colors, sizes)
- [ ] Advanced layout options (hierarchical, circular)
- [ ] Multi-page diagrams
- [ ] Annotations and notes

## Resources 📚

- [draw.io](https://app.diagrams.net) - Web app
- [draw.io GitHub](https://github.com/jgraph/drawio) - Source code
- [mxGraph Docs](https://jgraph.github.io/mxgraph/) - API documentation
- [AWS Architecture Icons](https://aws.amazon.com/architecture/icons/) - Official icons

## License 📄

The draw.io export feature is part of Blueprint Generator and follows the same MIT License.

---

**Made with ❤️ for cloud architects who need professional diagrams in multiple formats**
