#!/usr/bin/env python3
"""
Serveur de developpement pour barrel-v2 — avec support des requetes Range (206).

POURQUOI CE FICHIER EXISTE
--------------------------
`python3 -m http.server` repond 200 sans en-tete `Accept-Ranges`. Le navigateur
ne peut alors pas se positionner dans une video : `video.seekable` reste vide,
et TOUT scrub video parait fige. La video du chien du chapitre 02 est pilotee
par le scroll — elle est donc INTESTABLE avec le serveur standard.

Ce serveur repond 206 Partial Content. C'est la seule difference qui compte.

USAGE
-----
    python3 tools/serve.py            # port 8790
    python3 tools/serve.py 8781       # autre port

Puis http://localhost:8790
"""

import os
import re
import sys
from functools import partial
from http.server import HTTPServer, SimpleHTTPRequestHandler

RANGE_RE = re.compile(r"bytes=(\d*)-(\d*)")


class RangeHandler(SimpleHTTPRequestHandler):
    """SimpleHTTPRequestHandler + Range, + cache desactive."""

    def end_headers(self):
        # En developpement on ne veut JAMAIS de cache : le piege du ?v= qui
        # protege le CSS mais pas la page qui le reference a deja coute du temps.
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Accept-Ranges", "bytes")
        super().end_headers()

    def send_head(self):
        rng = self.headers.get("Range")
        if not rng:
            return super().send_head()

        m = RANGE_RE.fullmatch(rng.strip())
        if not m:
            return super().send_head()

        path = self.translate_path(self.path)
        if os.path.isdir(path):
            return super().send_head()

        try:
            f = open(path, "rb")
        except OSError:
            self.send_error(404, "File not found")
            return None

        size = os.fstat(f.fileno()).st_size
        first, last = m.group(1), m.group(2)

        if first == "":                      # bytes=-500 : les 500 derniers octets
            length = min(int(last or 0), size)
            start = size - length
            end = size - 1
        else:
            start = int(first)
            end = int(last) if last else size - 1
            end = min(end, size - 1)

        if start > end or start >= size:
            f.close()
            self.send_response(416, "Requested Range Not Satisfiable")
            self.send_header("Content-Range", "bytes */%d" % size)
            self.end_headers()
            return None

        self.send_response(206, "Partial Content")
        self.send_header("Content-Type", self.guess_type(path))
        self.send_header("Content-Range", "bytes %d-%d/%d" % (start, end, size))
        self.send_header("Content-Length", str(end - start + 1))
        self.end_headers()

        f.seek(start)
        self._range_remaining = end - start + 1
        return _Limited(f, self._range_remaining)


class _Limited:
    """Enveloppe de fichier qui s'arrete a la fin de la plage demandee."""

    def __init__(self, fh, remaining):
        self.fh = fh
        self.remaining = remaining

    def read(self, n=-1):
        if self.remaining <= 0:
            return b""
        if n < 0 or n > self.remaining:
            n = self.remaining
        data = self.fh.read(n)
        self.remaining -= len(data)
        return data

    def close(self):
        self.fh.close()


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8790
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    handler = partial(RangeHandler, directory=root)
    srv = HTTPServer(("127.0.0.1", port), handler)
    print("Barrel v2 — http://localhost:%d  (Range 206 actif, cache desactive)" % port)
    print("Racine : %s" % root)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\nArret.")


if __name__ == "__main__":
    main()
