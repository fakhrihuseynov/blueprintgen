// Utility Functions
// Helper functions for diagram operations

function showToast(type, message) {
    const toastId = type === 'error' ? 'error-toast' : 'success-toast';
    const messageId = type === 'error' ? 'error-message' : 'success-message';
    
    const toast = document.getElementById(toastId);
    const messageEl = document.getElementById(messageId);
    
    messageEl.textContent = message;
    toast.style.display = 'flex';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const jsonData = JSON.parse(e.target.result);
            loadDiagram(jsonData);
        } catch (error) {
            showToast('error', 'Invalid JSON file: ' + error.message);
            console.error('Error parsing JSON:', error);
        }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
}
