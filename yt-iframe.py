from setproctitle import setproctitle
setproctitle("yt-iframe")
from http.server import HTTPServer, SimpleHTTPRequestHandler
import os
os.chdir(os.path.dirname(__file__))
HTTPServer(("", 8823), SimpleHTTPRequestHandler).serve_forever()