from pathlib import Path
import ast
import subprocess
import tempfile

root = Path(__file__).parent
source = ast.parse((root / "generate.py").read_text())
products = next(ast.literal_eval(n.value) for n in source.body if isinstance(n, ast.Assign) and any(isinstance(t, ast.Name) and t.id == "products" for t in n.targets))
function = next(n for n in source.body if isinstance(n, ast.FunctionDef) and n.name == "phone_svg")
namespace = {}
exec(compile(ast.Module(body=[function], type_ignores=[]), "phone_svg", "exec"), namespace)
output = root / "dist" / "images"
output.mkdir(exist_ok=True)
with tempfile.TemporaryDirectory(prefix="flagman-images-") as temporary:
 for product in products:
  svg = Path(temporary) / (product[0] + ".svg")
  png = svg.with_suffix(".png")
  svg.write_text(namespace["phone_svg"](product).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ', 1))
  subprocess.run(["rsvg-convert", "--background-color", "#f0f1eb", "--width", "900", "--height", "900", "--output", str(png), str(svg)], check=True)
  subprocess.run(["sips", "-s", "format", "jpeg", "-s", "formatOptions", "90", str(png), "--out", str(output / (product[0] + ".jpg"))], check=True, stdout=subprocess.DEVNULL)
print(f"Exported {len(products)} JPG images to {output}")
