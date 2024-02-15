import { Element } from '@svgdotjs/svg.js';

export const makeHoverable = (el: Element) => {
  el.node.addEventListener('mouseover', (event) => {
    // Prevents the event from bubbling up to avoid triggering parent's mouseover when the child is already hovered
    event.stopPropagation();

    // Remove 'hovered' class from all elements except the current target
    const allElements = document.querySelectorAll('.hovered');
    allElements.forEach((elem) => {
      if (elem !== event.currentTarget) {
        elem.classList.remove('hovered');
      }
    });

    // Add 'hovered' class to the current element
    el.node.classList.add('hovered');
  });

  el.node.addEventListener('mouseout', (event) => {
    // Check if .the mouse is still within the parent element or has moved to a child
    if (!el.node.contains(event.relatedTarget as Node)) {
      // If not moving to a child, remove 'hovered'
      el.node.classList.remove('hovered');
    }
  });
};
