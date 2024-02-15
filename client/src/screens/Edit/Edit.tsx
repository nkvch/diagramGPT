import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { setupMermaidFlowChart } from "../../parsers/mermaid";
import { Svg } from "@svgdotjs/svg.js";
import { downloadSVG } from "../../utils/downloadSVGAsImage";

function Edit() {
  const { id } = useParams();
  const [svg, setSvg] = useState<Svg | null>(null);
  const [mermaidCode, setMermaidCode] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('http://localhost:3000/getMermaidCode/' + id)
      .then(response => response.json())
      .then(data => {
        setMermaidCode(data);
        return setupMermaidFlowChart(ref.current!, data);
      })
      .then(svg => {
        setSvg(svg);
      })
      .catch(error => console.error('Error:', error));
  }, [id]);

  return (
    <div>
      <h1>Edit</h1>
      <button onClick={() => {
        if (svg) {
          const svgNode = svg.node;
          downloadSVG(svgNode);
        }
      }}>Save</button>
      <div ref={ref}></div>
    </div>
  );
}

export default Edit;
