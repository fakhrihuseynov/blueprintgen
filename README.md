# Blueprint Diagram Generator 🎨

A simple, elegant web application for generating cloud architecture diagrams from JSON files.

## Features ✨

- 📤 **Upload JSON files** - Drop your architecture definitions and see them visualized instantly
- 🎯 **Smart Layout** - Automatically positions and connects components
- 🏗️ **Hierarchical Support** - Handles nested containers (like Kubernetes namespaces)
- 🔗 **Relationship Mapping** - Displays connections between services with labels
- 🎨 **Beautiful UI** - Modern, clean interface with smooth animations
- 📱 **Responsive** - Works on desktop and mobile devices
- 🖼️ **Export** - Download diagrams as PNG images (requires html2canvas)

## Quick Start 🚀

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd blueprintgen
   ```

2. **Open in browser**
   Simply open `index.html` in any modern web browser. No build process required!

3. **Load a diagram**
   - Click "Try Example" to load the included EKS architecture
   - Or click "Upload JSON" to use your own architecture file

## JSON Structure 📋

Your JSON file should follow this structure:

```json
{
  "nodes": [
    {
      "id": "unique-id",
      "label": "Component Name",
      "subtitle": "Description",
      "icon": "/assets/icons/icon-name.png",
      "type": "container",  // Optional: "container" for grouping
      "parentNode": "parent-id",  // Optional: for nested components
      "layout": "row"  // Optional: layout direction
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

- **id** (required): Unique identifier for the node
- **label** (required): Display name of the component
- **subtitle** (optional): Additional description text
- **icon** (optional): Path to icon image (PNG/SVG)
- **type** (optional): Set to "container" to create a grouping container
- **parentNode** (optional): ID of parent container for nested components
- **layout** (optional): Layout direction within containers

### Edge Properties

- **id** (required): Unique identifier for the connection
- **source** (required): ID of the source node
- **target** (required): ID of the target node
- **label** (optional): Description of the relationship

## Adding Icons 🖼️

Place your icon files in the `assets/icons/` directory. Supported formats:
- PNG (recommended for cloud service logos)
- SVG (recommended for custom icons)

Reference them in your JSON:
```json
"icon": "/assets/icons/your-icon.png"
```

## Example Use Cases 💡

- **Kubernetes Architecture** - Visualize clusters, namespaces, deployments
- **AWS Infrastructure** - Map VPCs, subnets, services
- **Microservices** - Show service dependencies and data flow
- **CI/CD Pipelines** - Display build and deployment workflows
- **Database Schemas** - Represent tables and relationships

## Technologies Used 🛠️

- **React** - UI framework
- **React Flow** - Diagram rendering library
- **Vanilla JS** - No build tools needed
- **Modern CSS** - Clean, responsive design

## Browser Support 🌐

Works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Tips for Best Results 📝

1. **Use clear, concise labels** - Keep node names short
2. **Organize hierarchically** - Use containers for logical grouping
3. **Add meaningful connections** - Label edges to show relationships
4. **Choose appropriate icons** - Visual consistency improves readability
5. **Test with example first** - Understand the structure before creating your own

## Project Structure 📁

```
blueprintgen/
├── index.html                          # Main HTML file
├── app.js                              # Application logic
├── styles.css                          # Styling
├── innovate-eks-architecture.json      # Example diagram
├── assets/
│   └── icons/                          # Icon files
└── README.md                           # This file
```

## Future Enhancements 🔮

- Drag-and-drop JSON file upload
- Auto-layout algorithms (hierarchical, force-directed)
- Custom color themes
- Export to multiple formats (SVG, PDF)
- Collaborative editing
- Real-time preview while editing JSON

## Contributing 🤝

Feel free to submit issues and enhancement requests!

## License 📄

MIT License - feel free to use this in your projects!

---

**Made with ❤️ for infrastructure engineers who love clean diagrams**