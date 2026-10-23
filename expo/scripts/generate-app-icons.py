"""Render the existing Flutter eco glyph into launcher assets (fontTools + ImageMagick)."""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
import subprocess
root = Path(__file__).resolve().parents[1]
font = TTFont(root / 'assets/fonts/MaterialIcons-Regular.otf')
glyphs = font.getGlyphSet(); glyph = glyphs[font.getBestCmap()[63218]]
pen = SVGPathPen(glyphs); glyph.draw(pen)
bounds = BoundsPen(glyphs); glyph.draw(bounds)
x0,y0,x1,y1 = bounds.bounds
scale = 430 / max(x1-x0,y1-y0)
x = 512 - (x0+x1)*scale/2; y = 512 + (y0+y1)*scale/2
mark = f'<path transform="translate({x} {y}) scale({scale} {-scale})" d="{pen.getCommands()}"/>'
for name,bg,shape,color in [
 ('icon','<rect width="1024" height="1024" fill="#8CE4FF"/>','<circle cx="512" cy="512" r="340" fill="white"/>','#8CE4FF'),
 ('android-icon-foreground','','<circle cx="512" cy="512" r="300" fill="white"/>','#8CE4FF'),
 ('android-icon-monochrome','','','#000000'),
]:
 svg = root / f'assets/branding/{name}.svg'
 svg.write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">{bg}{shape}<g fill="{color}">{mark}</g></svg>')
 subprocess.run(['magick','-background','none',str(svg),str(root/f'assets/{name}.png')],check=True)
