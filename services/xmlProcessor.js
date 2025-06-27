import xml2js from 'xml2js';

export async function processXml(xmlString) {
  let parsed;
  try {
    parsed = await xml2js.parseStringPromise(xmlString, { explicitArray: false, preserveChildrenOrder: true });
  } catch (e) {
    throw new Error('Malformed XML');
  }

  // Helper to traverse and collect info
  const elements = [];
  function traverse(node, path = '', indexMap = {}) {
    if (typeof node !== 'object' || node === null) return;
    for (const key in node) {
      if (key === '$' || key === '#name') continue;
      let children = Array.isArray(node[key]) ? node[key] : [node[key]];
      children.forEach((child, idx) => {
        child['#name'] = key;
        indexMap[key] = (indexMap[key] || 0) + 1;
        const currentPath = `${path}/${key}[${indexMap[key]}]`;
        elements.push({ tag: key, attributes: child['$'] || {}, xpath: currentPath });
        traverse(child, currentPath, {});
      });
    }
  }
  traverse(parsed, '', {});

  const withResourceId = elements.filter(e => e.attributes && e.attributes['resource-id']);
  const withoutResourceId = elements.filter(e => !e.attributes || !e.attributes['resource-id']);

  // For each with resource-id, get xpath and resource-id
  const with_resource_id_details = withResourceId.map(e => {
    let info = { xpath: e.xpath, resource_id: e.attributes['resource-id'] };
    if (e.attributes.bounds) info.bounds = e.attributes.bounds;
    if (e.attributes.text) info.text = e.attributes.text;
    if (e.attributes.focused) info.focused = e.attributes.focused;
    return info;
  });

  // For each without resource-id, get xpath, resource-id (will be undefined), and if available, bounds or text
  const missing_resource_id_details = withoutResourceId.map(e => {
    let info = { xpath: e.xpath, resource_id: e.attributes ? e.attributes['resource-id'] : undefined };
    if (e.attributes && e.attributes.bounds) info.bounds = e.attributes.bounds;
    if (e.attributes && e.attributes.text) info.text = e.attributes.text;
    if (e.attributes && e.attributes.focused) info.focused = e.attributes.focused;
    return info;
  });

  return {
    elements_with_resource_id: withResourceId.length,
    elements_without_resource_id: withoutResourceId.length,
    with_resource_id_details,
    missing_resource_id_details,
    elements_focused: elements.filter(e => e.attributes.focused).length,
    elements_not_focused: elements.filter(e => !e.attributes.focused).length
  };
} 