/**
 * Visio Export Module
 * Exports diagrams to Microsoft Visio (.vsdx) format
 * Using minimal valid VSDX structure for Visio Online compatibility
 */

class VisioExporter {
    constructor() {
        this.pageWidth = 11;  // inches
        this.pageHeight = 8.5; // inches
        this.dpi = 96; // pixels per inch
    }

    async exportToVisio(nodes, edges, layout) {
        try {
            // Load JSZip library dynamically if needed
            if (typeof JSZip === 'undefined') {
                await this.loadJSZip();
            }

            const zip = new JSZip();
            
            // Create minimal valid VSDX structure
            this.createContentTypes(zip);
            this.createRels(zip);
            this.createDocProps(zip);
            this.createDocument(zip);
            this.createDocumentRels(zip);
            this.createWindows(zip);
            this.createPage(zip, nodes, edges, layout);
            this.createPageRels(zip);
            
            // Generate and download
            const blob = await zip.generateAsync({ 
                type: 'blob',
                compression: 'DEFLATE'
            });
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = 'architecture-diagram.vsdx';
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Visio export error:', error);
            throw error;
        }
    }

    async loadJSZip() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load JSZip'));
            document.head.appendChild(script);
        });
    }

    createContentTypes(zip) {
        const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/visio/document.xml" ContentType="application/vnd.ms-visio.drawing.main+xml"/>
  <Override PartName="/visio/pages/pages.xml" ContentType="application/vnd.ms-visio.pages+xml"/>
  <Override PartName="/visio/pages/page1.xml" ContentType="application/vnd.ms-visio.page+xml"/>
  <Override PartName="/visio/windows.xml" ContentType="application/vnd.ms-visio.windows+xml"/>
</Types>`;
        zip.file('[Content_Types].xml', xml);
    }

    createRels(zip) {
        const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.microsoft.com/visio/2010/relationships/document" Target="visio/document.xml"/>
</Relationships>`;
        zip.file('_rels/.rels', xml);
    }

    createDocProps(zip) {
        const now = new Date().toISOString();
        
        const app = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
  <Application>Microsoft Visio</Application>
  <AppVersion>16.0000</AppVersion>
</Properties>`;
        zip.file('docProps/app.xml', app);
        
        const core = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:creator>Blueprint Generator</dc:creator>
  <dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified>
</cp:coreProperties>`;
        zip.file('docProps/core.xml', core);
    }

    createDocument(zip) {
        const xml = `<?xml version="1.0" encoding="utf-8"?>
<VisioDocument xmlns="http://schemas.microsoft.com/office/visio/2012/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <DocumentSettings/>
  <Colors>
    <ColorEntry IX="0" RGB="#000000"/>
    <ColorEntry IX="1" RGB="#FFFFFF"/>
    <ColorEntry IX="2" RGB="#4F46E5"/>
    <ColorEntry IX="3" RGB="#6B7280"/>
    <ColorEntry IX="4" RGB="#F3F4F6"/>
  </Colors>
  <FaceNames>
    <FaceName ID="0" Name="Calibri"/>
  </FaceNames>
</VisioDocument>`;
        zip.file('visio/document.xml', xml);
    }

    createDocumentRels(zip) {
        const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.microsoft.com/visio/2010/relationships/pages" Target="pages/pages.xml"/>
  <Relationship Id="rId2" Type="http://schemas.microsoft.com/visio/2010/relationships/windows" Target="windows.xml"/>
</Relationships>`;
        zip.file('visio/_rels/document.xml.rels', xml);
    }

    createWindows(zip) {
        const xml = `<?xml version="1.0" encoding="utf-8"?>
<Windows xmlns="http://schemas.microsoft.com/office/visio/2012/main">
  <Window ID="0" WindowType="Drawing" WindowState="1073741824">
    <StencilGroup/>
    <StencilGroupPos/>
  </Window>
</Windows>`;
        zip.file('visio/windows.xml', xml);
    }

    createPage(zip, nodes, edges, layout) {
        // Calculate diagram bounds
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        nodes.forEach(node => {
            const pos = layout[node.id];
            if (!pos) return;
            minX = Math.min(minX, pos.x);
            minY = Math.min(minY, pos.y);
            maxX = Math.max(maxX, pos.x + pos.width);
            maxY = Math.max(maxY, pos.y + pos.height);
        });

        const diagramWidth = (maxX - minX) / this.dpi;
        const diagramHeight = (maxY - minY) / this.dpi;
        
        // Set page size to fit diagram with margins
        const margin = 0.5; // 0.5 inch margin
        const pageWidth = diagramWidth + 2 * margin;
        const pageHeight = diagramHeight + 2 * margin;
        
        // Store offset for shape positioning
        this.offsetX = minX;
        this.offsetY = minY;
        this.margin = margin;
        
        // Pages index
        const pagesXml = `<?xml version="1.0" encoding="utf-8"?>
<Pages xmlns="http://schemas.microsoft.com/office/visio/2012/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <Page ID="0" NameU="Page-1" Name="Page-1">
    <PageSheet>
      <Cell N="PageWidth" U="IN" V="${pageWidth}"/>
      <Cell N="PageHeight" U="IN" V="${pageHeight}"/>
      <Cell N="PageScale" U="IN_F" V="1"/>
      <Cell N="DrawingScale" U="IN_F" V="1"/>
      <Cell N="DrawingSizeType" V="0"/>
      <Cell N="DrawingScaleType" V="0"/>
    </PageSheet>
    <Rel r:id="rId1"/>
  </Page>
</Pages>`;
        zip.file('visio/pages/pages.xml', pagesXml);

        // Build shapes
        let shapesXml = '';
        let shapeId = 1;
        const shapeMap = new Map();

        nodes.forEach(node => {
            const pos = layout[node.id];
            if (!pos) return;
            shapesXml += this.createShape(shapeId, node, pos, pageHeight);
            shapeMap.set(node.id, shapeId);
            shapeId++;
        });

        edges.forEach(edge => {
            const sourceId = shapeMap.get(edge.source);
            const targetId = shapeMap.get(edge.target);
            if (sourceId && targetId) {
                shapesXml += this.createConnector(shapeId, sourceId, targetId, edge.label);
                shapeId++;
            }
        });

        const pageXml = `<?xml version="1.0" encoding="utf-8"?>
<PageContents xmlns="http://schemas.microsoft.com/office/visio/2012/main">
  <Shapes>
${shapesXml}
  </Shapes>
</PageContents>`;
        zip.file('visio/pages/page1.xml', pageXml);
    }

    createPageRels(zip) {
        const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.microsoft.com/visio/2010/relationships/page" Target="page1.xml"/>
</Relationships>`;
        zip.file('visio/pages/_rels/pages.xml.rels', xml);
    }

    createShape(id, node, pos, pageHeight) {
        // Convert pixels to inches and adjust coordinates for Visio
        // Apply offset to normalize coordinates and add margin
        const w = pos.width / this.dpi;
        const h = pos.height / this.dpi;
        const x = (pos.x - this.offsetX) / this.dpi + this.margin;
        const y = (pos.y - this.offsetY) / this.dpi + this.margin;
        
        // Visio Y-axis goes bottom-to-top, web goes top-to-bottom
        const pinX = x + w / 2;
        const pinY = pageHeight - (y + h / 2);

        const name = this.escapeXml(node.label || 'Shape');
        const text = node.subtitle ? `${name}\n${this.escapeXml(node.subtitle)}` : name;
        
        const fill = node.type === 'container' ? '4' : '1';
        const line = node.type === 'container' ? '3' : '2';

        return `    <Shape ID="${id}" NameU="${name}" Name="${name}" Type="Shape">
      <Cell N="PinX" U="IN" V="${pinX}"/>
      <Cell N="PinY" U="IN" V="${pinY}"/>
      <Cell N="Width" U="IN" V="${w}"/>
      <Cell N="Height" U="IN" V="${h}"/>
      <Cell N="LocPinX" U="IN" F="Width*0.5"/>
      <Cell N="LocPinY" U="IN" F="Height*0.5"/>
      <Cell N="Angle" V="0"/>
      <Cell N="FlipX" V="0"/>
      <Cell N="FlipY" V="0"/>
      <Cell N="ResizeMode" V="0"/>
      <Cell N="FillForegnd" V="${fill}"/>
      <Cell N="LineColor" V="${line}"/>
      <Cell N="LineWeight" U="PT" V="1"/>
      <Cell N="LinePattern" V="1"/>
      <Cell N="Rounding" U="IN" V="0.0625"/>
      <Cell N="FillPattern" V="1"/>
      <Section N="Geometry" IX="0">
        <Cell N="NoFill" V="0"/>
        <Cell N="NoLine" V="0"/>
        <Row T="RelMoveTo" IX="1">
          <Cell N="X" U="DL" V="0"/>
          <Cell N="Y" U="DL" V="0"/>
        </Row>
        <Row T="RelLineTo" IX="2">
          <Cell N="X" U="DL" V="1"/>
          <Cell N="Y" U="DL" V="0"/>
        </Row>
        <Row T="RelLineTo" IX="3">
          <Cell N="X" U="DL" V="1"/>
          <Cell N="Y" U="DL" V="1"/>
        </Row>
        <Row T="RelLineTo" IX="4">
          <Cell N="X" U="DL" V="0"/>
          <Cell N="Y" U="DL" V="1"/>
        </Row>
        <Row T="RelLineTo" IX="5">
          <Cell N="X" U="DL" V="0"/>
          <Cell N="Y" U="DL" V="0"/>
        </Row>
      </Section>
      <Section N="Character" IX="0">
        <Row IX="0">
          <Cell N="Font" V="0"/>
          <Cell N="Color" V="0"/>
          <Cell N="Style" V="0"/>
          <Cell N="Case" V="0"/>
          <Cell N="Pos" V="0"/>
          <Cell N="FontScale" V="1"/>
          <Cell N="Size" U="PT" V="11"/>
        </Row>
      </Section>
      <Section N="Paragraph" IX="0">
        <Row IX="0">
          <Cell N="IndFirst" U="IN" V="0"/>
          <Cell N="IndLeft" U="IN" V="0"/>
          <Cell N="IndRight" U="IN" V="0"/>
          <Cell N="SpLine" U="PT" V="-1.2"/>
          <Cell N="SpBefore" U="PT" V="0"/>
          <Cell N="SpAfter" U="PT" V="0"/>
          <Cell N="HorzAlign" V="1"/>
          <Cell N="BulletStr" V=""/>
          <Cell N="BulletFontSize" U="PT" V="-1"/>
          <Cell N="TextPosAfterBullet" U="IN" V="0"/>
          <Cell N="Flags" V="0"/>
        </Row>
      </Section>
      <Text>${text}</Text>
    </Shape>
`;
    }

    createConnector(id, sourceId, targetId, label) {
        const text = label ? this.escapeXml(label) : '';
        
        return `    <Shape ID="${id}" NameU="Connector${id}" Name="Connector${id}" Type="Shape">
      <Cell N="PinX" U="IN" V="5"/>
      <Cell N="PinY" U="IN" V="4"/>
      <Cell N="Width" U="IN" V="0.01"/>
      <Cell N="Height" U="IN" V="0.01"/>
      <Cell N="LocPinX" U="IN" V="0"/>
      <Cell N="LocPinY" U="IN" V="0"/>
      <Cell N="LineColor" V="3"/>
      <Cell N="LineWeight" U="PT" V="1"/>
      <Cell N="LinePattern" V="1"/>
      <Cell N="BeginArrow" V="0"/>
      <Cell N="EndArrow" V="3"/>
      <Cell N="EndArrowSize" V="2"/>
      <Cell N="ObjType" V="2"/>
      <Cell N="BeginX" U="IN" F="Sheet.${sourceId}!PinX" V="0"/>
      <Cell N="BeginY" U="IN" F="Sheet.${sourceId}!PinY" V="0"/>
      <Cell N="EndX" U="IN" F="Sheet.${targetId}!PinX" V="0"/>
      <Cell N="EndY" U="IN" F="Sheet.${targetId}!PinY" V="0"/>
      <Section N="Character" IX="0">
        <Row IX="0">
          <Cell N="Font" V="0"/>
          <Cell N="Color" V="0"/>
          <Cell N="Size" U="PT" V="8"/>
        </Row>
      </Section>
      <Text>${text}</Text>
    </Shape>
`;
    }

    escapeXml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = VisioExporter;
}
