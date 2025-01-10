(() => {
  function convertSchemaToHtml(schema, options = {}) {
    let { scoped } = options;
    let html = "";
    if (typeof schema === "string" || schema instanceof String) {
      schema = JSON.parse(schema);
    }
    if (typeof options === "string" || options instanceof String || options === true) {
      scoped = options;
    }
    if (schema.type === "root" && schema.children.length > 0) {
      if (scoped) {
        html += `
      <div class="${scoped === true ? `rte` : scoped}">
        ${convertSchemaToHtml(schema.children, options)}
      </div>
      `;
      } else {
        html += convertSchemaToHtml(schema.children, options);
      }
    } else {
      for (const el of schema) {
        switch (el.type) {
          case "paragraph":
            html += buildParagraph(el, options);
            break;
          case "heading":
            html += buildHeading(el, options);
            break;
          case "list":
            html += buildList(el, options);
            break;
          case "list-item":
            html += buildListItem(el, options);
            break;
          case "link":
            html += buildLink(el, options);
            break;
          case "text":
            html += buildText(el, options);
            break;
          default:
            break;
        }
      }
    }
    return html;
  }
  function getClass(tag, classes) {
    if (classes && classes[tag]) {
      return classes[tag];
    } else {
      return null;
    }
  }
  function outputAttributes(attributes) {
    if (!attributes && attributes?.class) return "";
    const ATTRIBUTE_SEPARATOR = " ";
    return Object.keys(attributes).map((key) => {
      if (attributes[key]) {
        return `${ATTRIBUTE_SEPARATOR}${key}="${attributes[key]}"`;
      }
    }).join("");
  }
  function createElement(tag, classes, content, attributes = {}) {
    attributes = { ...attributes, class: getClass(tag, classes) };
    return `<${tag}${outputAttributes(attributes)}>${content}</${tag}>`;
  }
  function buildParagraph(el, options) {
    const { classes } = options;
    return createElement("p", classes, convertSchemaToHtml(el?.children, options));
  }
  function buildHeading(el, options) {
    const { classes } = options;
    const tag = `h${el?.level}`;
    return createElement(tag, classes, convertSchemaToHtml(el?.children, options));
  }
  function buildList(el, options) {
    const { classes } = options;
    const tag = el?.listType === "ordered" ? "ol" : "ul";
    return createElement(tag, classes, convertSchemaToHtml(el?.children, options));
  }
  function buildListItem(el, options) {
    const { classes } = options;
    return createElement("li", classes, convertSchemaToHtml(el?.children, options));
  }
  function buildLink(el, options) {
    const { classes } = options;
    const attributes = {
      href: el?.url,
      title: el?.title,
      target: el?.target
    };
    return createElement("a", classes, convertSchemaToHtml(el?.children, options), attributes);
  }
  function buildText(el, options) {
    const { classes, newLineToBreak } = options;
    if (el?.bold) {
      return createElement("strong", classes, el?.value);
    } else if (el?.italic) {
      return createElement("em", classes, el?.value);
    } else {
      return newLineToBreak ? el?.value?.replace(/\n/g, "<br>") : el?.value;
    }
  }

  const jsonInput = document.getElementById('jsonInput');
  const convertButton = document.getElementById('convertButton');
  const outputPre = document.getElementById('output');
  const copyButton = document.getElementById('copyButton');

  // Event listener for the convert button
  convertButton.addEventListener('click', () => {
    try {
      const input = jsonInput.value;
      const schema = JSON.parse(input); // Parse JSON input
      const html = convertSchemaToHtml(schema); // Convert schema to HTML

      outputPre.textContent = html; // Display HTML code
      copyButton.style.display = 'inline-block'; // Show the copy button
    } catch (error) {
      outputPre.textContent = `Error: ${error.message}`; // Handle invalid JSON
      copyButton.style.display = 'none'; // Hide the copy button
    }
  });

  // Event listener for the copy button
  copyButton.addEventListener('click', () => {
    const textToCopy = outputPre.textContent;

    // Use the Clipboard API to copy the text
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        // Provide feedback on successful copy
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
          copyButton.textContent = 'Copy to Clipboard';
        }, 2000); // Reset the button text after 2 seconds
      })
      .catch(() => {
        alert('Failed to copy to clipboard.');
      });
  });

  // src/main.js
  // document.getElementById("convertButton").addEventListener("click", () => {
  //   const input = document.getElementById("jsonInput").value;
  //   const outputDiv = document.getElementById("output");
  //   try {
  //     const schema = JSON.parse(input);
  //     const html = convertSchemaToHtml(schema);
  //     outputDiv.textContent = html;
  //   } catch (error) {
  //     outputDiv.textContent = `Error: ${error.message}`;
  //   }
  // });
})();
