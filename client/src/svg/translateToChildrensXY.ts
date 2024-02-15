import { Polygon } from '@svgdotjs/svg.js';
import { G } from '@svgdotjs/svg.js';
import { Element } from '@svgdotjs/svg.js';

export const absolutePositions = (el: Element, parentAbsoluteX: number = 0, parentAbsoluteY: number = 0) => {
  // if element has transform attribute with translate
  // get the x and y values and add them to the children as x and y
  // then remove the transform attribute from the parent
  const transform = el.transform?.();
  const translateX = transform?.translateX;
  const translateY = transform?.translateY;
  const x = el.x?.() as number | undefined;
  const y = el.y?.() as number | undefined;

  let absoluteX = parentAbsoluteX;
  let absoluteY = parentAbsoluteY;

  if (x !== undefined) {
    absoluteX += x;
  }

  if (y !== undefined) {
    absoluteY += y;
  }

  if (translateX !== undefined) {
    absoluteX += translateX;
  }

  if (translateY !== undefined) {
    absoluteY += translateY;
  }

  if (el instanceof G || el instanceof Polygon) {
    el.attr({
      transform: `translate(${absoluteX}, ${absoluteY})`
    });
  } else {
    el.attr({
      x: absoluteX,
      y: absoluteY
    });
  }

  el.children().forEach((child) => {
    absolutePositions(child, absoluteX, absoluteY);
  });
}
