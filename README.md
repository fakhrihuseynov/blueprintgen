# Blueprint Diagram Generator 🎨

A simple, elegant web application for generating cloud architecture diagrams from JSON files, **now with AI-powered JSON generation using Ollama!**

## Features ✨

- 📤 **Upload JSON files** - Drop your architecture definitions and see them visualized instantly
- 🤖 **AI JSON Generator** - Upload markdown descriptions and let AI generate the JSON structure
- 🖱️ **Drag & Drop Nodes** - Manually reposition any node by dragging it (grab cursor)
- 🎯 **Smart Layout** - Automatically positions and connects components with hierarchical organization
- 🏗️ **Hierarchical Support** - Handles nested containers (like Kubernetes namespaces)
- 🔗 **Relationship Mapping** - Displays connections between services with labels
- 🎨 **Beautiful UI** - Modern, clean interface with smooth animations
- 📦 **Compact Nodes** - Small, professional frames (100x70px) with external labels
- 🔲 **Smart Grouping** - Dotted-border containers for related resources
- 📱 **Responsive** - Works on desktop and mobile devices
- 🖼️ **Multiple Export Formats**:
  - **PNG** - High-quality raster images
  - **SVG** - Scalable vector graphics
  - **Draw.io** - Professional diagrams with proper AWS/Azure/K8s icons 🆕

## Quick Start 🚀

### 1. Prerequisites

- Python 3.x (for local server)
- [Ollama](https://ollama.ai) with qwen2.5-coder:7b model (for AI features)

### 2. Start Ollama

```bash
# Pull the model if you haven't already
ollama pull qwen2.5-coder:7b

# Ollama should be running (usually starts automatically)
ollama list  # Verify the model is available
```

### 3. Start the Application

```bash
cd blueprintgen
python3 server.py
```

**Important:** Use `server.py` instead of `python3 -m http.server` because it includes a built-in proxy to avoid CORS issues with Ollama.

Open your browser to: **http://localhost:8080**

## How to Use 🎯

### Option 1: Traditional JSON Upload

1. Click **"Upload JSON"** button
2. Select your architecture JSON file
3. View and interact with the generated diagram
4. **Drag nodes** to manually adjust positions (grab and move!)
5. Pan and zoom to explore your architecture
6. **Export**:
   - **PNG**: High-quality image for presentations
   - **SVG**: Vector format for editing
   - **Draw.io**: Professional diagrams with proper AWS/Azure icons 🆕

### Option 2: AI-Powered Generation (NEW! 🤖)

1. Click the **"AI Generator"** button in the header
2. **Upload Markdown File**: Click the upload box and select a `.md` file describing your architecture
3. **Review Content**: Check the markdown preview on the left panel
4. **Generate JSON**: Click "Generate JSON with AI" button
5. **Wait**: The AI (qwen2.5-coder:7b) will analyze your description and generate proper JSON
6. **Review & Use**: 
   - Copy the generated JSON
   - Download it as a file
   - Or click "Visualize" to see the diagram immediately!

### Creating Your Markdown Description

Write a simple markdown file describing your infrastructure. Example:

```markdown
# My Web Application Architecture

## Infrastructure Components

### Network Layer
- **VPC**: Main virtual private cloud
- **Internet Gateway**: Provides internet connectivity
- **Public Subnets**: Two subnets in different availability zones

### Compute Layer
- **EKS Cluster**: Kubernetes cluster for containers
- **Node Groups**: EC2 instances for worker nodes

### Application
- **Backend API**: Flask application
- **Frontend**: React SPA
- **Database**: PostgreSQL RDS instance

## Relationships
1. VPC contains Internet Gateway
2. EKS Cluster runs in VPC
3. Backend connects to Database
4. Frontend calls Backend API
```

The AI will understand your description and generate proper JSON with:
- Appropriate node IDs and labels
- Correct icon selections from available assets
- Proper relationship connections
- Module grouping (like module.vpc, module.eks)

## JSON Structure 📋

Your JSON file should follow this structure:

```json
{
  "nodes": [
    {
      "id": "unique-id",
      "label": "Component Name",
      "subtitle": "module.name or description",
      "type": "network|compute|container|security|storage|iam",
      "icon": "./assets/icons/AWS/Category/Service-Name.svg"
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "source-node-id",
      "target": "target-node-id",
      "label": "Connection description"
    }
  ]
}
```

### Node Properties

- **id** (required): Unique identifier
- **label** (required): Display name (shown below the icon)
- **subtitle** (optional): Additional description (shown below label)
- **type** (optional): network, compute, container, security, storage, iam
- **icon** (optional): Path to icon (./assets/icons/AWS/Category/Service.svg or ./assets/icons/Kubernetes/resource.svg)
- **parentNode** (optional): ID of parent container for grouping related resources

### Edge Properties

- **id** (required): Unique identifier
- **source** (required): Source node ID
- **target** (required): Target node ID  
- **label** (optional): Relationship description

### Grouping Related Resources

Create **container nodes** to group related resources with dotted borders:

```json
{
  "nodes": [
    {
      "id": "vpc-group",
      "label": "VPC Environment",
      "subtitle": "Production",
      "type": "container"
    },
    {
      "id": "vpc",
      "label": "VPC",
      "subtitle": "module.vpc",
      "type": "network",
      "icon": "./assets/icons/AWS/Networking-Content-Delivery/VPC.svg",
      "parentNode": "vpc-group"
    },
    {
      "id": "igw",
      "label": "Internet Gateway",
      "subtitle": "module.vpc",
      "type": "network",
      "icon": "./assets/icons/AWS/Networking-Content-Delivery/Internet-Gateway.svg",
      "parentNode": "vpc-group"
    }
  ]
}
```

Container nodes:
- Have `type: "container"`
- NO icon property
- Render with **dotted borders** and transparent background
- Visually group related resources (VPC components, EKS resources, etc.)

## Available Icons 🖼️

Icons are organized by provider and service category:

### AWS Icons
Located in `assets/icons/AWS/[Category]/[Service].svg`:

**Service Categories:**
- **Compute/** - EC2, Lambda, Fargate, Batch, Lightsail, etc.
- **Containers/** - Elastic-Kubernetes-Service, Elastic-Container-Service, Elastic-Container-Registry, App-Runner, etc.
- **Database/** - RDS, DynamoDB, Aurora, ElastiCache, DocumentDB, Neptune, etc.
- **Networking-Content-Delivery/** - VPC, CloudFront, Route-53, Elastic-Load-Balancing, API-Gateway, Direct-Connect, etc.
- **Storage/** - Simple-Storage-Service, Elastic-Block-Store, Elastic-File-System, FSx, Storage-Gateway, etc.
- **Security-Identity-Compliance/** - Identity-and-Access-Management, Key-Management-Service, Secrets-Manager, Certificate-Manager, etc.
- **Analytics/** - Kinesis, Athena, Glue, EMR, QuickSight, Data-Pipeline, etc.
- **Machine-Learning/** - SageMaker, Bedrock, Comprehend, Rekognition, etc.
- **Management-Governance/** - CloudWatch, CloudFormation, Systems-Manager, Config, Organizations, etc.
- **Developer-Tools/** - CodePipeline, CodeBuild, CodeDeploy, CodeCommit, etc.
- And 15+ more categories (App-Integration, Migration, IoT, Media-Services, etc.)

**Icon Path Format:** `./assets/icons/AWS/[Category]/[Service-Name].svg`

**Examples:**
- EKS: `./assets/icons/AWS/Containers/Elastic-Kubernetes-Service.svg`
- EC2: `./assets/icons/AWS/Compute/EC2.svg`
- RDS: `./assets/icons/AWS/Database/RDS.svg`
- VPC: `./assets/icons/AWS/Networking-Content-Delivery/VPC.svg`
- S3: `./assets/icons/AWS/Storage/Simple-Storage-Service.svg`
- Lambda: `./assets/icons/AWS/Compute/Lambda.svg`
- IAM: `./assets/icons/AWS/Security-Identity-Compliance/Identity-and-Access-Management.svg`

### Kubernetes Icons
Located in `assets/icons/Kubernetes/[resource].svg` (flat structure):
- **Resources**: deploy, svc, pod, ing, cm, secret, pv, pvc, hpa, sts, ds, job, cron, sa, role, rb, etc.

**Icon Path Format:** `./assets/icons/Kubernetes/[resource].svg`

### Monitoring Icons  
Located in `assets/icons/Monitoring/[tool].svg` (flat structure):
- **Tools**: prometheus, grafana, fluentbit

**Icon Path Format:** `./assets/icons/Monitoring/[tool].svg`

### General Icons
Located in `assets/icons/General/[name].svg` (flat structure):
- **Generic Resources**: 46 general-purpose resource icons with `Res_*_48_Light.svg` naming pattern

**Icon Path Format:** `./assets/icons/General/[name].svg`

**Important Notes:**
- All icons are in **SVG format** (not PNG)
- AWS service names use **full names with hyphens** (e.g., `Elastic-Kubernetes-Service.svg` not `eks.svg`)
- The AI generator automatically selects the correct category and icon based on your description

## Draw.io Export 🎨 NEW!

The Blueprint Generator now supports exporting to **Draw.io format** with proper cloud provider icons!

### Why Draw.io Export?

- ✅ **Professional Icons**: Exports AWS/Azure/Kubernetes resources with proper `mxgraph.aws4.*` shapes
- ✅ **Editable**: Open in [draw.io](https://app.diagrams.net) and continue editing
- ✅ **Standard Format**: Industry-standard `.drawio` files
- ✅ **No Conversion Needed**: Direct export with correct shapes and styles

### How to Export

1. Load your diagram (JSON upload or AI generation)
2. Click the **"Export Draw.io"** button in the header
3. Open the downloaded `.drawio` file in [draw.io](https://app.diagrams.net)
4. See your architecture with proper AWS EC2, VPC, RDS, Lambda, EKS icons! 🎉

### Supported Services

**AWS** (with proper mxGraph shapes):
- Compute: EC2, Lambda, EKS, ECS, ECR
- Networking: VPC, Internet Gateway, NAT Gateway, Load Balancers, Route 53
- Database: RDS, DynamoDB, ElastiCache, Aurora
- Storage: S3, EBS, EFS
- Security: IAM, KMS, Secrets Manager, Security Groups
- Management: CloudWatch, CloudFormation, Systems Manager

**Azure**: Virtual Machines, AKS, Virtual Networks, Storage Accounts

**Kubernetes**: Deployments, Services, Pods, Ingress, ConfigMaps, Secrets, Namespaces

See [DRAWIO-EXPORT.md](./DRAWIO-EXPORT.md) for complete documentation.

## AI Integration Details 🤖

The AI generator:
- **Knows your folder structure**: Aware of all available icons
- **Understands JSON format**: Generates properly structured JSON
- **Smart icon matching**: Automatically selects appropriate icons
- **Relationship detection**: Identifies connections from your description
- **Module grouping**: Organizes resources by logical modules

### System Prompt Context

The AI is given:
1. Complete list of available icons
2. JSON structure examples  
3. Node type categories
4. Best practices for IDs and labels

## Example Use Cases 💡

- **Kubernetes Architecture** - EKS clusters, namespaces, deployments
- **AWS Infrastructure** - VPCs, subnets, compute resources
- **Microservices** - Service dependencies and data flow
- **Multi-tier Applications** - Frontend, backend, database layers
- **CI/CD Pipelines** - Build and deployment workflows

## Technologies Used 🛠️

- **Vanilla JavaScript** - No frameworks, no build tools
- **SVG** - Native diagram rendering
- **Drag & Drop API** - Manual node repositioning
- **Ollama** - Local AI model integration (qwen2.5-coder:7b)
- **Python HTTP Server** - Simple local hosting with CORS proxy

## Tips for Best Results 📝

### For JSON Files
1. Use clear, concise labels (shown below nodes)
2. Organize hierarchically with containers
3. Add meaningful connection labels
4. Choose appropriate icons
5. **Group related resources** using container nodes with `parentNode`

### For Manual Positioning
1. **Drag nodes** by clicking and moving them
2. Pan the canvas by dragging on empty space
3. Zoom with mouse wheel or controls
4. Positions are temporary - refresh will reset to auto-layout

### For AI Generation
1. **Be specific** - Describe components clearly
2. **List relationships** - Mention how things connect
3. **Use sections** - Organize by layer (network, compute, application)
4. **Name resources** - Use standard AWS/K8s terminology when applicable
5. **Include context** - Mention module names if relevant

## Browser Support 🌐

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Project Structure 📁

```
blueprintgen/
├── index.html                          # Main HTML
├── styles.css                          # Styling
├── server.py                           # HTTP server with Ollama proxy
├── innovate-eks-architecture.json      # Example diagram
├── deployable_resources.json           # Example diagram
├── assets/
│   ├── favicon.svg                     # App icon
│   └── icons/                          # Infrastructure icons (PNG/SVG)
├── scripts/
│   ├── app.js                          # Diagram rendering & drag functionality
│   └── ai-generator.js                 # AI integration
├── markdowns/
│   └── sample-architecture.md          # Example markdown for AI
├── FIXES.md                            # Change history
└── README.md                           # This file
```

## Troubleshooting 🔧

### Ollama Connection Issues
- Ensure Ollama is running: `ollama list`
- Default URL: `http://localhost:11434`
- Check model is pulled: `ollama pull qwen2.5-coder:7b`
- The built-in proxy in `server.py` handles CORS automatically

### Server Issues
- **Port already in use**: Kill the old process with `lsof -i :8080` then `kill <PID>`
- Always use `python3 server.py` (not `python3 -m http.server`) for Ollama proxy support

### CORS Errors
- Make sure you're using `server.py` which includes CORS headers
- Don't use `file://` protocol - always use the HTTP server

### AI Generation Takes Long
- First generation may take 30-60 seconds
- Subsequent generations are faster
- Complex architectures need more time

## Future Enhancements 🔮

- Streaming AI responses for faster feedback
- Multiple AI model support (Claude, GPT-4, etc.)
- Custom icon upload and management
- Collaborative editing with real-time sync
- Export to PDF format
- Auto-save and version control for generated JSON
- Enhanced draw.io export with GCP icons
- Multi-page architecture diagrams

## Contributing 🤝

Feel free to submit issues and enhancement requests!

## License 📄

MIT License - free to use in your projects!

---

**Made with ❤️ for infrastructure engineers who love clean diagrams and AI-powered automation**