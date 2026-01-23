# Blueprint Diagram Generator 🎨

A simple, elegant web application for generating cloud architecture diagrams from JSON files, **now with AI-powered JSON generation using Ollama!**

## Features ✨

- 📤 **Upload JSON files** - Drop your architecture definitions and see them visualized instantly
- 🤖 **AI JSON Generator** - Upload markdown descriptions and let AI generate the JSON structure
- 🎯 **Smart Layout** - Automatically positions and connects components with hierarchical organization
- 🏗️ **Hierarchical Support** - Handles nested containers (like Kubernetes namespaces)
- 🔗 **Relationship Mapping** - Displays connections between services with labels
- 🎨 **Beautiful UI** - Modern, clean interface with smooth animations
- 📱 **Responsive** - Works on desktop and mobile devices
- 🖼️ **Export** - Download diagrams as PNG images

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
      "icon": "./assets/icons/icon-name.png"
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
- **icon** (optional): Path to icon (./assets/icons/name.png)
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
      "icon": "./assets/icons/vpc.png",
      "parentNode": "vpc-group"
    },
    {
      "id": "igw",
      "label": "Internet Gateway",
      "subtitle": "module.vpc",
      "type": "network",
      "icon": "./assets/icons/igw.png",
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

The AI knows about all icons in `assets/icons/`:
- AWS services (VPC, EKS, RDS, S3, etc.)
- Kubernetes resources (pods, services, deployments)
- Common tools (Prometheus, Grafana, ArgoCD)
- Custom infrastructure components

Place your icon files in `assets/icons/`. Supported formats:
- PNG (recommended for cloud service logos)
- SVG (recommended for custom icons)

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
- **Ollama** - Local AI model integration
- **Python HTTP Server** - Simple local hosting

## Tips for Best Results 📝

### For JSON Files
1. Use clear, concise labels
2. Organize hierarchically with containers
3. Add meaningful connection labels
4. Choose appropriate icons

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
├── app.js                              # Diagram rendering
├── ai-generator.js                     # AI integration
├── styles.css                          # Styling
├── server.py                           # HTTP server with Ollama proxy (NEW!)
├── favicon.svg                         # App icon
├── sample-architecture.md              # Example markdown
├── innovate-eks-architecture.json      # Example diagram
├── deployable_resources.json           # Example diagram
├── assets/
│   └── icons/                          # Icon files
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

- Streaming AI responses
- Multiple AI model support
- Custom icon upload
- Collaborative editing
- Export to multiple formats (SVG, PDF)
- Auto-save generated JSON files

## Contributing 🤝

Feel free to submit issues and enhancement requests!

## License 📄

MIT License - free to use in your projects!

---

**Made with ❤️ for infrastructure engineers who love clean diagrams and AI-powered automation**