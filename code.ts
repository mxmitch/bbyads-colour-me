figma.showUI(__html__);

figma.ui.resize(300, 500);

figma.ui.onmessage = (pluginMessage) => {
  if (pluginMessage.word === "") {
    throw new Error("Please enter at least 1 character");
  }

  const targetWord: string = pluginMessage.word;
  // New color in hex format (e.g., red)
  const newColorHex: string = pluginMessage.color;

  // Function to convert hex color to RGBA Figma format
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
    return [r / 255, g / 255, b / 255];
  }

  function changeWordColor(
    node: TextNode,
    targetWord: string,
    newColorHex: string
  ): void {
    let text: string = node.characters;
    if (text.includes(targetWord)) {
      let startIndex: number = 0;
      let indices: number[] = [];
      while (text.indexOf(targetWord, startIndex) > -1) {
        let index = text.indexOf(targetWord, startIndex);
        indices.push(index);
        startIndex = index + targetWord.length;
      }

      const rgb = hexToRgbA(newColorHex);
      const newFill: Paint = {
        type: "SOLID",
        color: { r: rgb[0], g: rgb[1], b: rgb[2] },
      };

      indices.forEach((index) => {
        node.setRangeFills(index, index + targetWord.length, [newFill]);
      });
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
      changeWordColor(node, targetWord, newColorHex);
    }
  }

  // Ensure the script kicks off correctly and references are valid
  function runPlugin() {
    figma.currentPage.selection.forEach((node) =>
      traverse(node, targetWord, newColorHex)
    );
    figma.closePlugin();
  }

  runPlugin();
};
