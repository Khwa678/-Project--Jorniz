# ─── server.py — Unified Healthy Universe Web Gateway & Default Document Server ─
import http.server
import socketserver
import urllib.request
import os, sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 3000

class UnifiedGatewayHandler(http.server.SimpleHTTPRequestHandler):
    """Unified Web Gateway resolving default documents and proxying backend APIs."""
    
    def do_GET(self):
        # 1. Proxy API calls to Flask Backend on Port 8000
        if self.path.startswith("/api/"):
            return self.proxy_request("GET")

        # 2. Fix Directory Listing — resolve default document
        if self.path == "/" or self.path.endswith("/"):
            if os.path.exists("index.html"):
                self.path += "index.html"
            elif os.path.exists("Healthy-Universe-/src/Default.aspx"):
                self.path += "Healthy-Universe-/src/Default.aspx"

        return http.server.SimpleHTTPRequestHandler.do_GET(self)

    def do_POST(self):
        if self.path.startswith("/api/"):
            return self.proxy_request("POST")
        return self.send_error(405, "Method Not Allowed")

    def proxy_request(self, method):
        target_url = f"http://localhost:8000{self.path}"
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length) if content_length > 0 else None
            
            headers = {}
            if self.headers.get("Content-Type"):
                headers["Content-Type"] = self.headers.get("Content-Type")
            if self.headers.get("Authorization"):
                headers["Authorization"] = self.headers.get("Authorization")

            req = urllib.request.Request(target_url, data=body, headers=headers, method=method)
            with urllib.request.urlopen(req) as resp:
                self.send_response(resp.status)
                for k, v in resp.getheaders():
                    self.send_header(k, v)
                self.end_headers()
                self.wfile.write(resp.read())

        except Exception as e:
            self.send_error(502, f"Backend Proxy Error: {e}")

if __name__ == "__main__":
    Handler = UnifiedGatewayHandler
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"[HEALTHY UNIVERSE GATEWAY] Running on http://localhost:{PORT}")
        print(f"[DEFAULT DOCUMENT] index.html / Default.aspx resolved")
        httpd.serve_forever()
