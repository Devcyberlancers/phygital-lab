from pathlib import Path

from flask import Flask, redirect, send_from_directory


ROOT = Path(__file__).resolve().parent
WIKI_DIR = ROOT / "wiki"

app = Flask(__name__, static_folder="static", static_url_path="/static")


@app.get("/")
@app.get("/index.html")
def home():
    return send_from_directory(ROOT, "index.html")


@app.get("/faq")
@app.get("/faq.html")
def faq():
    return send_from_directory(ROOT, "faq.html")


@app.get("/wiki")
def wiki_no_slash():
    return redirect("http://172.16.17.219/")


@app.get("/wiki/")
def wiki_home():
    return redirect("http://172.16.17.219/")


@app.get("/wiki/<path:page>")
def wiki_page(page):
    return send_from_directory(WIKI_DIR, f"{page}.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
