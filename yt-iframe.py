import runpy, socket, sys, threading
from setproctitle import setproctitle
setproctitle("yt-iframe")
from http.server import HTTPServer, SimpleHTTPRequestHandler
import os
os.chdir(os.path.dirname(__file__))
def start_wisp_server():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        if s.connect_ex(("localhost", 9477)) == 0:
            return
    sys.argv = ["--", "--port", "9477"]
    print("Starting wisp server on port 9477...")
    runpy.run_module("wisp.server", run_name = "__main__")
threading.Thread(target=start_wisp_server).start()
HTTPServer(("0.0.0.0", 8823), SimpleHTTPRequestHandler).serve_forever()