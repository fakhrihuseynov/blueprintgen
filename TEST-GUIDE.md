# Quick Test Guide - Draw.io Export

## How to Test the Implementation

### 1. Start the Application

```bash
cd blueprintgen
python3 server.py
```

Open browser to: http://localhost:8080

### 2. Load Example Diagram

- Click "Load Example" button
- Wait for diagram to render
- You should see an EKS cluster with namespaces and pods

### 3. Export to Draw.io

- Click the "Export Draw.io" button in the header
- File `architecture-diagram.drawio` will be downloaded

### 4. Open in Draw.io

1. Go to https://app.diagrams.net
2. Click "Open Existing Diagram"
3. Select the downloaded `.drawio` file
4. **Verify:**
   - ✅ AWS icons appear (not basic rectangles)
   - ✅ EKS cloud icon is visible
   - ✅ Containers have proper swimlane borders
   - ✅ Connections use orthogonal routing
   - ✅ Colors match AWS palette (orange for compute, purple for network, etc.)

### 5. Test with Custom JSON

Create a test file `test.json`:

```json
{
  "nodes": [
    {
      "id": "vpc",
      "label": "My VPC",
      "type": "container"
    },
    {
      "id": "ec2",
      "label": "Web Server",
      "icon": "./assets/icons/AWS/Compute/EC2.svg",
      "parentNode": "vpc"
    },
    {
      "id": "rds",
      "label": "Database",
      "icon": "./assets/icons/AWS/Database/RDS.svg",
      "parentNode": "vpc"
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "ec2",
      "target": "rds",
      "label": "connects to"
    }
  ]
}
```

- Upload this JSON file
- Export to draw.io
- Verify EC2 and RDS icons appear correctly

## Expected Results

### In Draw.io, you should see:

1. **EC2 Icon**: Orange rectangle with server/computer graphic
2. **RDS Icon**: Blue cylinder (database icon)
3. **VPC Container**: Light blue swimlane with dotted border
4. **Connection**: Arrow from EC2 to RDS with label "connects to"

### Visual Appearance:

```
┌─────────────────────────────────────────┐
│  My VPC (Container/Swimlane)            │
│                                          │
│   ┌────────┐         ┌────────┐        │
│   │  EC2   │────────▶│  RDS   │        │
│   │ (icon) │ connects│ (icon) │        │
│   └────────┘    to   └────────┘        │
│                                          │
└─────────────────────────────────────────┘
```

## Troubleshooting

### Icons appear as basic shapes
- Check icon path in JSON matches actual file location
- Verify `mxgraph.aws4.*` appears in exported XML
- Try opening file in draw.io desktop app

### File won't open
- Verify XML syntax is valid
- Check file isn't empty
- Try re-exporting

### Wrong shapes
- Check icon filename mapping in `drawio-exporter.js`
- Service name should match icon map keys

## Success Criteria

✅ File exports without errors
✅ File opens in draw.io web/desktop
✅ AWS icons display correctly (not rectangles)
✅ Containers show as swimlanes
✅ Edges are properly routed
✅ Labels and subtitles are visible
✅ Colors match AWS palette

## Performance Expectations

- Export time: < 1 second for typical diagrams
- File size: ~1-5KB for small diagrams, ~10-50KB for large ones
- Draw.io load time: < 2 seconds

## Next Steps After Testing

If all tests pass:
1. ✅ Mark feature as complete
2. ✅ Share with team
3. ✅ Document any issues found
4. ✅ Consider enhancements (GCP icons, custom styles, etc.)

If tests fail:
1. Check browser console for errors
2. Verify file contents with text editor
3. Test with minimal JSON first
4. Review implementation logs

---

**Need Help?**
- Check `DRAWIO-EXPORT.md` for full documentation
- Review `IMPLEMENTATION-SUMMARY.md` for technical details
- Open an issue with test results and error messages
