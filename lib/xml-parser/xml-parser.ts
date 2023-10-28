import { DOMParser, Node } from 'xmldom';
import { select } from 'xpath';

export class XMLParser {
  private xmlDocument: Document;

  constructor(xmlString: string) {
    // Remove namespaces from the XML string
    const xmlStringWithoutNamespaces = xmlString.replace(
      /(xmlns(:\w*)?="[^"]*")/g,
      '',
    );

    // Parse the XML document without namespaces
    this.xmlDocument = new DOMParser().parseFromString(
      xmlStringWithoutNamespaces,
    );
  }

  public getAll(parentNode: NodeInfo | null, xpath: string): NodeInfo[] {
    const contextNode = parentNode?.node || this.xmlDocument;
    const nodes = select(xpath, contextNode);
    const nodesArray = Array.isArray(nodes) ? nodes : [nodes];
    return nodesArray.map((node) => this.getNodeInfo(node));
  }

  public getFirst(parentNode: NodeInfo | null, xpath: string): NodeInfo | null {
    const contextNode = parentNode?.node || this.xmlDocument;
    const node = select(xpath, contextNode)[0];
    return this.getNodeInfo(node);
  }

  public getAllValues(parentNode: NodeInfo | null, xpath: string): string[] {
    const contextNode = parentNode?.node || this.xmlDocument;
    const nodes = select(xpath, contextNode);
    const nodesArray = Array.isArray(nodes) ? nodes : [nodes];
    return nodesArray.map((node) => this.getNodeValue(node));
  }

  public getFirstValue(
    parentNode: NodeInfo | null,
    xpath: string,
  ): string | null {
    const contextNode = parentNode?.node || this.xmlDocument;
    const node = select(xpath, contextNode)[0];
    return this.getNodeValue(node);
  }

  public getFirstAttribute(
    parentNode: NodeInfo | null,
    xpath: string,
    attributeName: string,
  ): string | null {
    const contextNode = parentNode?.node || this.xmlDocument;
    const node = this.getFirst(contextNode, xpath);
    return this.getNodeAttribute(node, attributeName);
  }
  public getNodeAttributes(node: Node | null): { [key: string]: string } {
    const attributes: { [key: string]: string } = {};
    if (node && node.attributes) {
      for (let i = 0; i < node.attributes.length; i++) {
        const attribute = node.attributes[i];
        attributes[attribute.name] = attribute.value;
      }
    }
    return attributes;
  }

  public getNodeValue(node: Node | null): string | null {
    return node ? node.textContent : null;
  }

  public getNodeAttribute(node: Node, attributeName: string): string | null {
    const attributes = this.getNodeAttributes(node);
    return attributes[attributeName];
  }

  private getNodeInfo(node: Node | null): NodeInfo | null {
    if (!node) return null;

    return {
      name: node.nodeName,
      attributes: this.getNodeAttributes(node),
      value: this.getNodeValue(node),
      node: node,
    };
  }
}

export interface NodeInfo {
  name: string;
  attributes: { [key: string]: string };
  value: string | null;
  node: Node | null;
}
