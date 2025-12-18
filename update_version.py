import os, re, sys
def main():
    if len(sys.argv) != 2:
        print("Usage: python update_version.py <version>")
        return
    os.chdir(os.path.dirname(__file__))
    for i in ("script.user.js", "index.html"):
        with open(i) as f:
            file = f.read()
        file = re.sub(r"(// +?@version +?)[0-9.]+([^0.9.])", f"\\g<1>{sys.argv[1]}\\g<2>", file)
        with open(i, "w") as f:
            f.write(file)

if __name__ == "__main__":
    main ()