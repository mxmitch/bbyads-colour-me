figma.showUI(__html__);

figma.ui.resize(300, 500);

console.log("Plugin loaded");

figma.ui.onmessage = (pluginMessage) => {
  console.log("Received plugin message:", pluginMessage);

  if (pluginMessage.word === "") {
    throw new Error("Please enter at least 1 character");
  }

  const targetWord: string = pluginMessage.word;
  const newColorHex: string = pluginMessage.color;

  function hexToRgbA(hex: string): [number, number, number] {
    let r: number = 0,
      g: number = 0,
      b: number = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex[1] + hex[2], 16);
      g = parseInt(hex[3] + hex[4], 16);
      b = parseInt(hex[5] + hex[6], 16);
    }
    return [r / 255, g / 255, b / 255]; // Figma uses RGB values between 0 and 1
  }

  function changeWordColor(
    node: TextNode,
    targetWord: string,
    newColorHex: string
  ): void {
    const text: string = node.characters;
    console.log(`Node text: "${text}"`);

    // Properly escape special characters in the targetWord
    const escapedTargetWord: string = targetWord.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    // Create a regex to match the escaped target word surrounded by non-word characters
    const regex: RegExp = new RegExp(
      `(^|\\s)${escapedTargetWord}(?=\\s|$)`,
      "gi"
    );

    console.log(`Searching for "${escapedTargetWord}" using regex: ${regex}`);

    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      console.log(`Match found: ${match[0]} at index ${match.index}`);
      const index: number = match.index + match[1].length; // Adjust for the leading whitespace
      const length: number = escapedTargetWord.length;

      const rgb: [number, number, number] = hexToRgbA(newColorHex);
      const newFill: Paint = {
        type: "SOLID",
        color: { r: rgb[0], g: rgb[1], b: rgb[2] },
      };

      node.setRangeFills(index, index + length, [newFill]);
    }
  }

  function traverse(
    node: SceneNode | BaseNode,
    targetWord: string,
    newColorHex: string
  ): void {
    if ("children" in node) {
      node.children.forEach((child) =>
        traverse(child as SceneNode, targetWord, newColorHex)
      );
    } else if (node.type === "TEXT") {
      console.log(`Traversing text node: ${node.name}`);
      changeWordColor(node as TextNode, targetWord, newColorHex);
    }
  }

  function runPlugin() {
    const selectedNodes = figma.currentPage.selection;
    console.log(`Selected nodes: ${selectedNodes.length}`);
    selectedNodes.forEach((node) => traverse(node, targetWord, newColorHex));
  }

  runPlugin();
};
