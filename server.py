# ─── server.py — Unified Healthy Universe Web Gateway & Default Document Server ─
import http.server
import socketserver
import urllib.request
import urllib.error
import os, sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
DEFAULT_API_TARGET = "http://localhost:8000"
API_TARGET = os.getenv("API_TARGET", DEFAULT_API_TARGET).rstrip("/")

class UnifiedGatewayHandler(http.server.SimpleHTTPRequestHandler):
    """Unified Web Gateway resolving default documents and proxying backend APIs."""
    
    def do_GET(self):
        if self.path.startswith("/api/"):
            return self.proxy_request("GET")

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

    def do_PUT(self):
        if self.path.startswith("/api/"):
            return self.proxy_request("PUT")
        return self.send_error(405, "Method Not Allowed")

    def do_DELETE(self):
        if self.path.startswith("/api/"):
            return self.proxy_request("DELETE")
        return self.send_error(405, "Method Not Allowed")

    def do_OPTIONS(self):
        if self.path.startswith("/api/"):
            self.send_response(200)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
            self.end_headers()
            return
        return http.server.SimpleHTTPRequestHandler.do_OPTIONS(self) if hasattr(http.server.SimpleHTTPRequestHandler, "do_OPTIONS") else self.send_response(200)

    def proxy_request(self, method):
        target_url = f"{API_TARGET}{self.path}"
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length) if content_length > 0 else None
            
            headers = {}
            if self.headers.get("Content-Type"):
                headers["Content-Type"] = self.headers.get("Content-Type")
            if self.headers.get("Authorization"):
                headers["Authorization"] = self.headers.get("Authorization")

            req = urllib.request.Request(target_url, data=body, headers=headers, method=method)
            try:
                with urllib.request.urlopen(req) as resp:
                    self.send_response(resp.status)
                    for k, v in resp.getheaders():
                        self.send_header(k, v)
                    self.end_headers()
                    self.wfile.write(resp.read())
            except urllib.error.HTTPError as e:
                # Pass through backend HTTP status (401, 400, 404, 500, etc.)
                self.send_response(e.code)
                for k, v in e.headers.items():
                    if k.lower() not in ("transfer-encoding", "content-length"):
                        self.send_header(k, v)
                err_body = e.read()
                self.send_header("Content-Length", str(len(err_body)))
                self.end_headers()
                self.wfile.write(err_body)

        except Exception as e:
            self.send_error(502, f"Backend Proxy Error: {e}")

if __name__ == "__main__":
    Handler = UnifiedGatewayHandler
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"[HEALTHY UNIVERSE GATEWAY] Running on http://localhost:{PORT}")
        print(f"[DEFAULT DOCUMENT] index.html / Default.aspx resolved")
        httpd.serve_forever()

