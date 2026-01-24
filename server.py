#!/usr/bin/env python3
"""
Simple HTTP server with Ollama proxy to avoid CORS issues.
Serves static files and proxies requests to Ollama API.
"""

import http.server
import socketserver
import json
import urllib.request
import urllib.error
from urllib.parse import urlparse, parse_qs

PORT = 8080
OLLAMA_URL = "http://localhost:11434"

class OllamaProxyHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP handler that serves static files and proxies Ollama requests."""
    
    def end_headers(self):
        """Add CORS headers to all responses."""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_OPTIONS(self):
        """Handle preflight CORS requests."""
        self.send_response(200)
        self.end_headers()
    
    def do_POST(self):
        """Handle POST requests - proxy to Ollama API."""
        if self.path == '/api/ollama':
            try:
                # Read request body
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                
                print(f"[Proxy] Forwarding request to Ollama...")
                
                # Forward to Ollama
                req = urllib.request.Request(
                    f"{OLLAMA_URL}/api/generate",
                    data=post_data,
                    headers={'Content-Type': 'application/json'}
                )
                
                with urllib.request.urlopen(req, timeout=300) as response:
                    response_data = response.read()
                    
                    # Send success response
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(response_data)
                    
                    print(f"[Proxy] Successfully received response from Ollama")
                    
            except urllib.error.URLError as e:
                print(f"[Proxy] Error connecting to Ollama: {e}")
                self.send_response(503)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                error_msg = json.dumps({
                    'error': f'Cannot connect to Ollama. Is it running? Error: {str(e)}'
                })
                self.wfile.write(error_msg.encode())
                
            except Exception as e:
                print(f"[Proxy] Unexpected error: {e}")
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                error_msg = json.dumps({'error': str(e)})
                self.wfile.write(error_msg.encode())
        else:
            # Not a proxy endpoint
            self.send_response(404)
            self.end_headers()
    
    def do_GET(self):
        """Handle GET requests - serve static files or API endpoints."""
        if self.path == '/api/icons':
            try:
                import os
                icons = []
                icons_dir = './assets/icons'
                
                # Walk through all icon directories
                for root, dirs, files in os.walk(icons_dir):
                    for file in files:
                        if file.endswith('.svg'):
                            # Get relative path from icons directory
                            rel_path = os.path.join(root, file)
                            icons.append({'path': rel_path.replace('\\', '/')})
                
                # Send JSON response
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                response = json.dumps({'success': True, 'icons': icons})
                self.wfile.write(response.encode())
                print(f"[API] Served {len(icons)} icons")
                
            except Exception as e:
                print(f"[API] Error loading icons: {e}")
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                error_msg = json.dumps({'success': False, 'error': str(e)})
                self.wfile.write(error_msg.encode())
        else:
            # Serve static files normally
            super().do_GET()

def main():
    """Start the server."""
    handler = OllamaProxyHandler
    
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"🚀 Blueprint Generator Server")
        print(f"   📡 Serving at: http://localhost:{PORT}")
        print(f"   🤖 Ollama proxy: {OLLAMA_URL}")
        print(f"   ⏸️  Press Ctrl+C to stop\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n👋 Server stopped")

if __name__ == '__main__':
    main()
