/**
 * Icon Picker Module
 * Handles manual icon selection from the icon inventory
 */

class IconPicker {
    constructor(diagramCore) {
        this.core = diagramCore;
        this.modal = null;
        this.searchInput = null;
        this.categoryFilter = null;
        this.iconGrid = null;
        this.selectedNodeId = null;
        this.allIcons = [];
        this.filteredIcons = [];
        
        this.init();
    }

    init() {
        this.modal = document.getElementById('icon-picker-modal');
        this.searchInput = document.getElementById('icon-search');
        this.categoryFilter = document.getElementById('icon-category-filter');
        this.iconGrid = document.getElementById('icon-picker-grid');
        
        // Setup event listeners
        this.searchInput.addEventListener('input', () => this.filterIcons());
        this.categoryFilter.addEventListener('change', () => this.filterIcons());
        
        // Close modal on background click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
        
        // Load available icons
        this.loadAvailableIcons();
    }

    async loadAvailableIcons() {
        try {
            const response = await fetch('/api/icons');
            const data = await response.json();
            
            if (data.success) {
                this.allIcons = data.icons.map(icon => ({
                    path: icon.path,
                    name: this.getIconName(icon.path),
                    category: this.getIconCategory(icon.path)
                }));
                console.log(`Loaded ${this.allIcons.length} icons for picker`);
            }
        } catch (error) {
            console.error('Failed to load icons:', error);
            showToast('error', 'Failed to load icon inventory');
        }
    }

    getIconName(path) {
        // Extract filename from path
        const filename = path.split('/').pop();
        // Remove extension and format nicely
        return filename.replace('.svg', '').replace(/_/g, ' ');
    }

    getIconCategory(path) {
        // Extract category from path: ./assets/icons/AWS/...
        const parts = path.split('/');
        if (parts.length >= 4) {
            return parts[3]; // AWS, GCP, Kubernetes, Monitoring, General, Azure
        }
        return 'Other';
    }

    open(nodeId) {
        this.selectedNodeId = nodeId;
        this.searchInput.value = '';
        this.categoryFilter.value = 'all';
        this.filterIcons();
        this.modal.classList.add('active');
        this.modal.style.display = 'flex';
    }

    close() {
        this.modal.classList.remove('active');
        this.modal.style.display = 'none';
        this.selectedNodeId = null;
    }

    filterIcons() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const category = this.categoryFilter.value;
        
        this.filteredIcons = this.allIcons.filter(icon => {
            const matchesSearch = icon.name.toLowerCase().includes(searchTerm);
            const matchesCategory = category === 'all' || icon.category === category;
            return matchesSearch && matchesCategory;
        });
        
        this.renderIconGrid();
    }

    renderIconGrid() {
        this.iconGrid.innerHTML = '';
        
        if (this.filteredIcons.length === 0) {
            this.iconGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No icons found</p>';
            return;
        }
        
        this.filteredIcons.forEach(icon => {
            const iconItem = document.createElement('div');
            iconItem.className = 'icon-item';
            iconItem.title = icon.path;
            
            const img = document.createElement('img');
            img.src = icon.path;
            img.alt = icon.name;
            img.onerror = () => {
                img.style.display = 'none';
            };
            
            const span = document.createElement('span');
            span.textContent = icon.name;
            
            iconItem.appendChild(img);
            iconItem.appendChild(span);
            
            iconItem.addEventListener('click', () => this.selectIcon(icon.path));
            
            this.iconGrid.appendChild(iconItem);
        });
    }

    selectIcon(iconPath) {
        if (!this.selectedNodeId) {
            console.error('No node selected for icon change');
            return;
        }
        
        // Find the node in the diagram
        const node = this.core.nodes.find(n => n.id === this.selectedNodeId);
        if (!node) {
            console.error('Node not found:', this.selectedNodeId);
            return;
        }
        
        // Update the icon path
        node.icon = iconPath;
        
        // Clear layout cache to force recalculation
        if (this.core.layoutCache) {
            delete this.core.layoutCache[this.selectedNodeId];
        }
        
        // Redraw the diagram
        this.core.redrawDiagram();
        
        // Close the modal
        this.close();
        
        showToast('success', `Icon updated to: ${this.getIconName(iconPath)}`);
    }
}

// Make closeIconPicker globally accessible for the close button
window.closeIconPicker = function() {
    if (window.iconPicker) {
        window.iconPicker.close();
    }
};
