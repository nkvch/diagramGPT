export function downloadSVG(
  svg: SVGSVGElement, fileName = 'downloaded_image.png'
  ) {
  // Step 1: Serialize SVG
  let serializer = new XMLSerializer();
  let source = serializer.serializeToString(svg);

  // Step 2: Convert serialized SVG to DataURL
  let svgData = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;

  // Step 3: Load into Image and draw on Canvas
  let img = new Image();
  img.onload = function() {
      let canvas = document.createElement('canvas');
      canvas.width = svg.viewBox.baseVal.width || svg.width.baseVal.value; // Adjust as necessary
      canvas.height = svg.viewBox.baseVal.height || svg.height.baseVal.value; // Adjust as necessary
      let ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      // Step 4: Convert Canvas to PNG and trigger download
      let pngData = canvas.toDataURL('image/png');
      let a = document.createElement('a');
      a.download = fileName;
      a.href = pngData;
      document.body.appendChild(a); // Required for Firefox
      a.click();
      document.body.removeChild(a);
  };
  img.src = svgData;
}
