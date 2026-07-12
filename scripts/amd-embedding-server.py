"""
AMD ROCm Embedding Service for TriageAI

Run this in your AMD AI Notebook (notebooks.amd.com/hackathon).
It starts a lightweight API server that generates embeddings using
sentence-transformers on AMD GPU (ROCm) and exposes it via cloudflared tunnel.

Usage:
  1. Upload this script to your AMD AI Notebook
  2. Run: python amd-embedding-server.py
   3. Copy the generated URL (starts with https://<random>.trycloudflare.com)
   4. Set AMD_CLOUD_ENDPOINT=<url>/embed and AMD_CLOUD_API_KEY=<key> in .env.local
   5. Set LLM_PROVIDER=gemma (or leave default)
   6. If cloudflared fails to install, set up manually or run locally without tunnel

Requirements:
  pip install sentence-transformers numpy
  # cloudflared is auto-downloaded (optional — server runs without it)
"""

import json
import os
import subprocess
import sys
import tempfile
import threading
import time
import uuid
from http.server import HTTPServer, BaseHTTPRequestHandler

API_KEY = os.environ.get("AMD_API_KEY", str(uuid.uuid4()))

MODEL_NAME = "intfloat/e5-large-v2"
INSTRUCTION = "Represent the customer support email for retrieval: "


class EmbeddingHandler(BaseHTTPRequestHandler):
    model = None

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-API-Key")
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.read_body(content_length)

        if body is None:
            self.send_error(400, "Invalid JSON")
            return

        api_key = self.headers.get("X-API-Key", "")
        if api_key != API_KEY:
            self.send_error(401, "Invalid API key")
            return

        input_text = body.get("input", "")
        if not input_text:
            self.send_error(400, "Missing 'input' field")
            return

        instruction_text = body.get("instruction", INSTRUCTION)

        try:
            embedding = self.generate(instruction_text, input_text)
            self.send_json({"embedding": embedding})
        except Exception as e:
            self.send_error(500, str(e))

    def read_body(self, length: int):
        try:
            raw = self.rfile.read(length)
            return json.loads(raw)
        except Exception:
            return None

    def send_json(self, data: dict, status: int = 200):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def send_error(self, code: int, message: str):
        self.send_json({"error": message}, code)

    def generate(self, instruction: str, text: str) -> list[float]:
        import numpy as np

        if self.model is None:
            raise RuntimeError("Model not loaded")

        full_text = f"{instruction}{text}"
        emb = self.model.encode(full_text, normalize_embeddings=True)
        return np.round(emb, 6).tolist()

    def log_message(self, format, *args):
        print(f"[AMD Embedding] {args[0]}")


def load_model():
    print(f"[AMD Embedding] Loading {MODEL_NAME}...")
    start = time.time()

    try:
        import torch

        if torch.cuda.is_available():
            device_count = torch.cuda.device_count()
            device_name = torch.cuda.get_device_name(0)
            print(f"[AMD Embedding] ROCm GPU detected: {device_name} ({device_count}x)")
        else:
            print("[AMD Embedding] WARNING: No ROCm GPU found, using CPU")
    except Exception:
        print("[AMD Embedding] torch not available, will use CPU")

    from sentence_transformers import SentenceTransformer

    model = SentenceTransformer(MODEL_NAME)
    EmbeddingHandler.model = model

    elapsed = time.time() - start
    print(f"[AMD Embedding] Model loaded in {elapsed:.1f}s")
    return model


def find_cloudflared() -> str:
    candidates = ["cloudflared"]
    if sys.platform == "darwin":
        candidates.append("/opt/homebrew/bin/cloudflared")
    elif sys.platform == "linux":
        candidates.extend([
            os.path.expanduser("~/.cloudflared/cloudflared"),
            "/usr/local/bin/cloudflared",
        ])
    for c in candidates:
        try:
            subprocess.run([c, "--version"], capture_output=True, check=True)
            return c
        except (FileNotFoundError, subprocess.CalledProcessError):
            continue
    return install_cloudflared()


def install_cloudflared() -> str:
    print("[AMD Embedding] Installing cloudflared...")
    if sys.platform == "linux":
        url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64"
    elif sys.platform == "darwin":
        url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-amd64.tgz"
    else:
        raise RuntimeError(f"Unsupported platform: {sys.platform}")

    dest = os.path.expanduser("~/.cloudflared/cloudflared")
    os.makedirs(os.path.dirname(dest), exist_ok=True)

    import ssl
    import urllib.request

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    print(f"[AMD Embedding] Downloading cloudflared from {url}")

    for attempt in range(3):
        try:
            urllib.request.urlretrieve(url, dest, context=ctx)
            break
        except Exception as e:
            print(f"[AMD Embedding] Download attempt {attempt + 1} failed: {e}")
            if attempt < 2:
                time.sleep(3)
            else:
                print("[AMD Embedding] Trying curl fallback...")
                try:
                    subprocess.run(
                        ["curl", "-sL", "--insecure", url, "-o", dest],
                        check=True, timeout=120,
                    )
                except Exception as e2:
                    print(f"[AMD Embedding] curl also failed: {e2}")
                    print(f"[AMD Embedding] Please install cloudflared manually:")
                    print(f"  wget {url} -O {dest} && chmod +x {dest}")
                    raise RuntimeError(
                        "Could not download cloudflared. "
                        "Install it manually, then re-run this script."
                    )

    os.chmod(dest, 0o755)

    if sys.platform == "darwin":
        import tarfile
        extract_dir = tempfile.mkdtemp()
        with tarfile.open(dest) as tf:
            tf.extractall(extract_dir)
        dest = os.path.join(extract_dir, "cloudflared")
        os.chmod(dest, 0o755)

    return dest


def start_tunnel(port: int) -> str:
    cloudflared = find_cloudflared()
    print(f"[AMD Embedding] Starting cloudflared tunnel on port {port}...")

    proc = subprocess.Popen(
        [cloudflared, "tunnel", "--url", f"http://127.0.0.1:{port}",
         "--no-tls-verify", "--log-level", "info"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )

    url = None
    for line in proc.stdout:
        print(line, end="")
        if "trycloudflare.com" in line:
            import re
            match = re.search(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com", line)
            if match:
                url = match.group(0)
                break

    if not url:
        print("[AMD Embedding] WARNING: Could not get cloudflared tunnel URL.")
        print("[AMD Embedding] The server is still running locally.")
        print("[AMD Embedding] To expose it, run in another terminal:")
        print(f"    cloudflared tunnel --url http://127.0.0.1:{port}")
        print()
        return None

    print(f"\n{'='*60}")
    print(f"  AMD Embedding Server Ready!")
    print(f"  Tunnel URL: {url}")
    print(f"  API Key:    {API_KEY}")
    print(f"{'='*60}")
    print(f"\n  Set these in your .env.local or Convex env:")
    print(f"  AMD_CLOUD_ENDPOINT={url}/embed")
    print(f"  AMD_CLOUD_API_KEY={API_KEY}")
    print(f"  LLM_PROVIDER=gemma")
    print()

    def keep_alive():
        while proc.poll() is None:
            time.sleep(1)

    threading.Thread(target=keep_alive, daemon=True).start()
    return url


def main():
    port = int(os.environ.get("PORT", 8765))

    print(f"\n  TriageAI — AMD ROCm Embedding Service")
    print(f"  {'='*40}")
    print(f"  Model:    {MODEL_NAME}")
    print(f"  Port:     {port}")
    print(f"  API Key:  {API_KEY[:8]}...\n")

    load_model()

    server = HTTPServer(("0.0.0.0", port), EmbeddingHandler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    print(f"[AMD Embedding] Server listening on 0.0.0.0:{port}")

    url = start_tunnel(port)

    try:
        while True:
            time.sleep(10)
    except KeyboardInterrupt:
        print("\n[AMD Embedding] Shutting down...")
        server.shutdown()


if __name__ == "__main__":
    main()
