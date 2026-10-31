import { useEffect } from "react";

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 28);
}

function assignTestId(element: Element) {
  if (element.getAttribute("data-testid")) return;
  const siblings = element.parentElement ? Array.from(element.parentElement.children).filter((child) => child.tagName === element.tagName) : [];
  const siblingIndex = Math.max(0, siblings.indexOf(element));
  const identity = element.id || element.getAttribute("aria-label") || element.getAttribute("name") || element.getAttribute("title") || element.getAttribute("placeholder");
  const segment = `${element.tagName.toLowerCase()}-${identity ? slug(identity) : siblingIndex}`;
  const parentId = element.parentElement?.getAttribute("data-testid");
  element.setAttribute("data-testid", parentId ? `${parentId}-${segment}` : segment);
}

function addTestIds(root: ParentNode) {
  if (root instanceof Element) assignTestId(root);
  root.querySelectorAll("*").forEach(assignTestId);
}

export function useAutomaticTestIds() {
  useEffect(() => {
    addTestIds(document);
    const observer = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (node instanceof Element) {
          addTestIds(node);
        }
      }));
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
}
