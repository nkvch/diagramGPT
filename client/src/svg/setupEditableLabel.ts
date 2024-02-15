import { Element } from '@svgdotjs/svg.js';

export function setupEditableLabel(g: Element, parentG: Element) {
  const labelElement = g.node;
  const foreignObject = labelElement.querySelector('foreignObject') as SVGForeignObjectElement;
  const span = labelElement.querySelector('span.nodeLabel')! as HTMLSpanElement;
  let isEditing = false;

  span.addEventListener('click', function (e) {
    if (isEditing) return;
    isEditing = true;

    e.stopPropagation();
    g.draggable(false);
    parentG.draggable(false);

    const input = document.createElement('input');
    input.type = 'text';
    input.value = span.innerText;
    input.style.width = span.offsetWidth + 'px';

    // Copy styles from span to input
    input.style.font = window.getComputedStyle(span).font;
    input.style.fontSize = window.getComputedStyle(span).fontSize;
    input.style.color = window.getComputedStyle(span).color;
    input.style.backgroundColor = window.getComputedStyle(span).backgroundColor;
    labelElement.classList.add('editing');

    span.parentNode!.replaceChild(input, span);

    input.focus();
    input.select();

    const adjustForeignObjectSize = () => {
      const imaginarySpan = document.createElement('span');
      imaginarySpan.style.font = window.getComputedStyle(input).font;
      imaginarySpan.style.fontSize = window.getComputedStyle(input).fontSize;
      imaginarySpan.style.visibility = 'hidden';
      imaginarySpan.style.position = 'absolute';
      imaginarySpan.style.top = '-9999px';
      imaginarySpan.innerText = input.value;
      document.body.appendChild(imaginarySpan);
      const width = imaginarySpan.offsetWidth;
      document.body.removeChild(imaginarySpan);

      foreignObject.style.width = width + 'px';
      input.style.width = width + 'px';
    };

    input.addEventListener(
      'input',
      adjustForeignObjectSize);

    input.addEventListener('blur', function () {
      adjustForeignObjectSize();
      span.innerText = input.value;
      input.parentNode!.replaceChild(span, input);
      labelElement.classList.remove('editing');
      isEditing = false;
      g.draggable(true);
      parentG.draggable(true);
    }, { once: true });

    document.addEventListener('click', function outsideClickListener(event) {
      if (!input.contains(event.target as Node)) {
        input.blur();
        document.removeEventListener('click', outsideClickListener);
      }
    });
  });
}
