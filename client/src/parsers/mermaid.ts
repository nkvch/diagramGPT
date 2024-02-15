import mermaid from "mermaid";
import { SVG, Element } from "@svgdotjs/svg.js";
import '@svgdotjs/svg.draggable.js'
import { Rect } from "@svgdotjs/svg.js";
import { Polygon, Svg } from "@svgdotjs/svg.js";
import { makeHoverable } from "../svg/makeHoverable";
import { absolutePositions } from "../svg/translateToChildrensXY";
import { setupEditableLabel } from "../svg/setupEditableLabel";

export const setupMermaidFlowChart = (container: HTMLDivElement, mermaidCode: string): Promise<Svg> => new Promise((res, rej) => {
  // Create textarea and SVG container
  const svgContainer = document.createElement("div");

  svgContainer.id = "svgContainer";

  container.appendChild(svgContainer);

  let svgElement: Svg;

  mermaid.mermaidAPI.render("mermaid", mermaidCode).then((result) => {
    const svgCode = result.svg;
    svgContainer.innerHTML = '';

    const parser = new DOMParser();
    const svg = parser.parseFromString(svgCode, "image/svg+xml");

    let svgHtmlElement: HTMLElement | null = svg.documentElement;

    const error = svgHtmlElement.querySelector('parsererror');

    if (error) {
      const errorText = error.textContent;
      console.error(errorText);
      return alert(errorText);
    }

    console.log(svgHtmlElement);

    const isSvgElement = svgHtmlElement instanceof SVGElement;

    if (!isSvgElement) {
      svgHtmlElement = svgHtmlElement.querySelector('svg') as HTMLElement | null;
    }

    if (!svgHtmlElement) {
      return alert('Error parsing SVG');
    }

    const svgHtmlElementContent = svgHtmlElement.innerHTML;

    const svgHtmlElementViewBox = svgHtmlElement.getAttribute('viewBox');
    const viewBoxValues = svgHtmlElementViewBox!.split(' ').map(Number);
    const newViewBox = `${-viewBoxValues[2]/2} ${-viewBoxValues[3]/2} ${viewBoxValues[2]*2} ${viewBoxValues[3]*2}`;

    svgElement = SVG().id('mermaid').viewbox(newViewBox).size('100%', '100vh')
      .svg(svgHtmlElementContent).addTo(svgContainer);

    svgElement.find('g.node.default').forEach((g) => {
      g.draggable();
      g.css('cursor', 'move');

      g.find('g.label').forEach((label) => {
        makeHoverable(label);
        setupEditableLabel(label, g);
        label.draggable();
        label.css('cursor', 'text');
      });

      let nodesEdgePaths;
      let incomingEdgePaths: { edgePath: Element, outgoingNodeId: string }[] = [];
      let outgoingEdgePaths: { edgePath: Element, incomingNodeId: string }[] = [];
      let nodeWidth = 0;
      let nodeHeight = 0;

      const child = g.children()[0];

      makeHoverable(child);

      // add edges to the node
      const isRect = child instanceof Rect;
      const isPolygon = child instanceof Polygon;

      if (isRect) {
        // add transparent frame to the node
        const rect = child as Rect;
        const x = rect.x() as number;
        const y = rect.y() as number;
        const width = rect.width() as number;
        const height = rect.height() as number;

        const topEdge = svgElement.path(`M ${x} ${y} L ${x + width} ${y}`)
          .addClass('transparent-edge top-edge')
          .css('cursor', 'ns-resize');
        const rightEdge = svgElement.path(`M ${x + width} ${y} L ${x + width} ${y + height}`)
          .addClass('transparent-edge right-edge')
          .css('cursor', 'ew-resize');
        const bottomEdge = svgElement.path(`M ${x + width} ${y + height} L ${x} ${y + height}`)
          .addClass('transparent-edge bottom-edge')
          .css('cursor', 'ns-resize');
        const leftEdge = svgElement.path(`M ${x} ${y + height} L ${x} ${y}`)
          .addClass('transparent-edge left-edge')
          .css('cursor', 'ew-resize');

        topEdge.draggable();
        rightEdge.draggable();
        bottomEdge.draggable();
        leftEdge.draggable();

        topEdge.on('dragmove', () => {
          const rectY = rect.y() as number;
          const rectX = rect.x() as number;
          const rectHeight = rect.height() as number;
          const rectWidth = rect.width() as number;
          const newY = topEdge.y() as number;
          const newHeight = rectY + rectHeight - newY;
          rect.y(newY);
          rect.height(newHeight);

          rightEdge.plot(`M ${rectX + rectWidth} ${newY} L ${rectX + rectWidth} ${newY + newHeight}`);
          leftEdge.plot(`M ${rectX} ${newY + newHeight} L ${rectX} ${newY}`);
        });

        topEdge.on('dragend', () => {
          const rectX = rect.x() as number;
          const rectWidth = rect.width() as number;
          const newY = topEdge.y() as number;
          topEdge.plot(`M ${rectX} ${newY} L ${rectX + rectWidth} ${newY}`);
        });

        rightEdge.on('dragmove', () => {
          const rectX = rect.x() as number;
          const rectY = rect.y() as number;
          const rectHeight = rect.height() as number;
          const newRightEdgeX = rightEdge.x() as number;
          const newWidth = newRightEdgeX - rectX;
          rect.width(newWidth);

          topEdge.plot(`M ${rectX} ${rectY} L ${newRightEdgeX} ${rectY}`);
          bottomEdge.plot(`M ${rectX} ${rectY + rectHeight} L ${newRightEdgeX} ${rectY + rectHeight}`);
        });

        rightEdge.on('dragend', () => {
          const rectY = rect.y() as number;
          const newRightEdgeX = rightEdge.x() as number;
          rightEdge.plot(`M ${newRightEdgeX} ${rectY} L ${newRightEdgeX} ${rectY + (rect.height() as number)}`);
        });

        bottomEdge.on('dragmove', () => {
          const rectX = rect.x() as number;
          const rectY = rect.y() as number;
          const rectWidth = rect.width() as number;
          const newBottomEdgeY = bottomEdge.y() as number;
          const newHeight = newBottomEdgeY - rectY;
          rect.height(newHeight);

          rightEdge.plot(`M ${rectX + rectWidth} ${rectY} L ${rectX + rectWidth} ${newBottomEdgeY}`);
          leftEdge.plot(`M ${rectX} ${rectY} L ${rectX} ${newBottomEdgeY}`);
        });

        bottomEdge.on('dragend', () => {
          const rectX = rect.x() as number;
          const newBottomEdgeY = bottomEdge.y() as number;
          bottomEdge.plot(`M ${rectX} ${newBottomEdgeY} L ${rectX + (rect.width() as number)} ${newBottomEdgeY}`);
        });

        leftEdge.on('dragmove', () => {
          const rectY = rect.y() as number;
          const rectX = rect.x() as number;
          const rectHeight = rect.height() as number;
          const rectWidth = rect.width() as number;
          const newX = leftEdge.x() as number;
          const newWidth = rectX + rectWidth - newX;
          rect.x(newX);
          rect.width(newWidth);

          topEdge.plot(`M ${newX} ${rectY} L ${newX + newWidth} ${rectY}`);
          bottomEdge.plot(`M ${newX + newWidth} ${rectY + rectHeight} L ${newX} ${rectY + rectHeight}`);
        });

        leftEdge.on('dragend', () => {
          const rectY = rect.y() as number;
          const rectHeight = rect.height() as number;
          const newX = leftEdge.x() as number;
          leftEdge.plot(`M ${newX} ${rectY} L ${newX} ${rectY + rectHeight}`);
        });

        g.add(topEdge);
        g.add(rightEdge);
        g.add(bottomEdge);
        g.add(leftEdge);
      }

      g.on('dragstart', () => {
        const draggingId = g.id();
        const nodeIdRegex = /flowchart-(.*)-\d+/;
        const nodeId = draggingId.match(nodeIdRegex)![1];

        nodesEdgePaths = svgElement.find(`g.edgePaths path[id*=${nodeId}]`);

        const child = g.children()[0];

        const isRect = child instanceof Rect;
        const isPolygon = child instanceof Polygon;

        nodeWidth = child.width() as number;
        nodeHeight = child.height() as number;

        nodesEdgePaths.forEach((edgePath) => {
          const className = edgePath.attr('class');
          const nodesConnectedRegex = /LS-(.*) LE-(.*)/;
          const nodesConnected = className.match(nodesConnectedRegex)!;
          const outgoingNodeId = nodesConnected[1];
          const incomingNodeId = nodesConnected[2];

          if (outgoingNodeId === nodeId) {
            outgoingEdgePaths.push({
              edgePath,
              incomingNodeId,
            });
          } else if (incomingNodeId === nodeId) {
            incomingEdgePaths.push({
              edgePath,
              outgoingNodeId,
            });
          }
        });
      });

      g.on('dragmove', () => {
        // recalculating the d attribute of the edge paths
        const xProperty = g.x() as number;
        const yProperty = g.y() as number;
        const transform = g.transform();
        const translateX = transform.translateX ?? 0;
        const translateY = transform.translateY ?? 0;

        const xCoordinateOfUpperLeft = xProperty + translateX;
        const yCoordinateOfUpperLeft = yProperty + translateY;

        const xCoordinateOfCenter = xCoordinateOfUpperLeft + nodeWidth / 2;
        const yCoordinateOfCenter = yCoordinateOfUpperLeft + nodeHeight / 2;

        outgoingEdgePaths.forEach((edgePath) => {
          const { edgePath: path, incomingNodeId } = edgePath;
          const incomingNode = svgElement.find(`g.node.default[id*=${incomingNodeId}]`)[0];
          const incomingNodeX = incomingNode.x() as number;
          const incomingNodeY = incomingNode.y() as number;

          const incomingNodeTransform = incomingNode.transform();
          const incomingNodeTranslateX = incomingNodeTransform.translateX ?? 0;
          const incomingNodeTranslateY = incomingNodeTransform.translateY ?? 0;

          const incomingNodeRect = incomingNode.children()[0];
          const incomingNodeWidth = incomingNodeRect.width() as number;
          const incomingNodeHeight = incomingNodeRect.height() as number;

          const centerOfIncomingNodeX = incomingNodeX + incomingNodeTranslateX + incomingNodeWidth / 2;
          const centerIncomingNodeY = incomingNodeY + incomingNodeTranslateY + incomingNodeHeight / 2;

          const angle = - Math.atan2(yCoordinateOfCenter - centerIncomingNodeY, xCoordinateOfCenter - centerOfIncomingNodeX);
          const angleOfRect = Math.atan2(incomingNodeHeight, incomingNodeWidth);

          const isIncomingOnHorizontalEdge = Math.abs(angle) > angleOfRect && Math.abs(angle) < Math.PI - angleOfRect;
          const isIncomingOnVerticalEdge = Math.abs(angle) < angleOfRect || Math.abs(angle) > Math.PI - angleOfRect;

          const sin = Math.sin(angle);
          const cos = Math.cos(angle);

          const dd = isIncomingOnVerticalEdge ? incomingNodeWidth/2/Math.abs(cos) + 10 : incomingNodeHeight/2/Math.abs(sin) + 10;

          let xCoordinateOfIncomingPoint;
          let yCoordinateOfIncomingPoint;

          if (isIncomingOnHorizontalEdge) {
            xCoordinateOfIncomingPoint = centerOfIncomingNodeX + dd*Math.cos(angle);
            yCoordinateOfIncomingPoint = centerIncomingNodeY - dd*Math.sin(angle);
          } else {
            xCoordinateOfIncomingPoint = centerOfIncomingNodeX + dd*Math.cos(angle);
            yCoordinateOfIncomingPoint = centerIncomingNodeY - dd*Math.sin(angle);
          }

          const d = `M ${xCoordinateOfCenter} ${yCoordinateOfCenter} L ${xCoordinateOfIncomingPoint} ${yCoordinateOfIncomingPoint}`;

          path.attr('d', d);
        });

        incomingEdgePaths.forEach((edgePath) => {
          const { edgePath: path, outgoingNodeId } = edgePath;
          const outgoingNode = svgElement.find(`g.node.default[id*=${outgoingNodeId}]`)[0];
          const outgoingNodeX = outgoingNode.x() as number;
          const outgoingNodeY = outgoingNode.y() as number;

          const outgoingNodeTransform = outgoingNode.transform();
          const outgoingNodeTranslateX = outgoingNodeTransform.translateX ?? 0;
          const outgoingNodeTranslateY = outgoingNodeTransform.translateY ?? 0;

          const xCoordinateOfUpperLeftOutgoingNode = outgoingNodeX + outgoingNodeTranslateX;
          const yCoordinateOfUpperLeftOutgoingNode = outgoingNodeY + outgoingNodeTranslateY;

          const outGoingNodeRect = outgoingNode.children()[0];

          const outgoingNodeWidth = outGoingNodeRect.width() as number;
          const outgoingNodeHeight = outGoingNodeRect.height() as number;

          const centerOfOutgoingNodeX = xCoordinateOfUpperLeftOutgoingNode + outgoingNodeWidth / 2;
          const centerOutgoingNodeY = yCoordinateOfUpperLeftOutgoingNode + outgoingNodeHeight / 2;

          const angle = - Math.atan2(centerOutgoingNodeY - yCoordinateOfCenter, centerOfOutgoingNodeX - xCoordinateOfCenter);
          const angleOfRect = Math.atan2(nodeHeight, nodeWidth);

          const isIncomingOnHorizontalEdge = Math.abs(angle) > angleOfRect && Math.abs(angle) < Math.PI - angleOfRect;
          const isIncomingOnVerticalEdge = Math.abs(angle) < angleOfRect || Math.abs(angle) > Math.PI - angleOfRect;

          const sin = Math.sin(angle);
          const cos = Math.cos(angle);

          const dd = isIncomingOnVerticalEdge ? nodeWidth/2/Math.abs(cos) + 10 : nodeHeight/2/Math.abs(sin) + 10;

          let xCoordinateOfIncomingPoint;
          let yCoordinateOfIncomingPoint;

          if (isIncomingOnHorizontalEdge) {
            xCoordinateOfIncomingPoint = xCoordinateOfCenter + dd*Math.cos(angle);
            yCoordinateOfIncomingPoint = yCoordinateOfCenter - dd*Math.sin(angle);
          } else {
            xCoordinateOfIncomingPoint = xCoordinateOfCenter + dd*Math.cos(angle);
            yCoordinateOfIncomingPoint = yCoordinateOfCenter - dd*Math.sin(angle);
          }
          
          const d = `M ${centerOfOutgoingNodeX} ${centerOutgoingNodeY} L ${xCoordinateOfIncomingPoint} ${yCoordinateOfIncomingPoint}`;

          path.attr('d', d);
        });
      });
    });

    svgElement.find('g.edgeLabels > g.edgeLabel').forEach((g) => {
      g.draggable();
      g.css('cursor', 'move');
    });

    res(svgElement);
  });
});
