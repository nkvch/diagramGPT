import { Element } from '@svgdotjs/svg.js';

// function makeNodeDraggable(g: Element) {
//   const target = g.node;

//   let offsetX: number;
//   let offsetY: number;
//   let isDragging = false;

//   target.addEventListener('mousedown', function (e) {
//     const transformMatrix = g.transform();
//     offsetX = e.clientX - transformMatrix.e;
//     offsetY = e.clientY - transformMatrix.f;
//     isDragging = true;
//   });

//   document.addEventListener('mousemove', function (e) {
//       if (isDragging) {
//           target.setAttribute('transform', `translate(${e.clientX - offsetX}, ${e.clientY - offsetY})`);
//       }
//   });

//   document.addEventListener('mouseup', function () {
//       isDragging = false;
//   });
// }