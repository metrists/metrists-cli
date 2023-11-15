import { HTMLElement } from 'node-html-parser';

export type DividedSection = {
  title: string;
  content: HTMLElement[];
};

function findNearestCommonAncestor(document, element1, element2) {
  const ancestors1 = getAncestors(element1);
  const ancestors2 = getAncestors(element2);

  for (const ancestor1 of ancestors1) {
    for (const ancestor2 of ancestors2) {
      if (ancestor1 === ancestor2) {
        return ancestor1;
      }
    }
  }

  // If no common ancestor found, return the document
  return document;
}

function getAncestors(element: HTMLElement) {
  const ancestors = [];
  let currentElement = element;

  while (currentElement.parentNode) {
    ancestors.push(currentElement.parentNode);
    currentElement = currentElement.parentNode;
  }

  return ancestors;
}

export function divideIntoSections(document: HTMLElement, tag = 'h2') {
  const sections: DividedSection[] = [];

  // Find all H2 elements in the document
  const h2Elements = document.querySelectorAll(tag);

  // Iterate over each H2 element and create sections
  h2Elements.forEach((element, index) => {
    const nextElement = h2Elements[index + 1];
    const section = {
      title: element.textContent,
      content: [],
    };

    // Find the nearest common ancestor for the H2 element
    const commonAncestor = nextElement
      ? findNearestCommonAncestor(document, element, nextElement)
      : element;

    // Get all content within the common ancestor, starting from the H2 element
    const content = Array.from(commonAncestor.getElementsByTagName('*')).filter(
      (el: HTMLElement) => el.textContent.trim().length > 0,
    );

    // Add content to the section
    content.forEach((contentElement: HTMLElement) => {
      section.content.push(contentElement.clone());
    });

    sections.push(section);
  });

  return sections;
}
