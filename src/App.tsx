import { useEffect, useRef } from "react";
import { Button } from "./components/ui/button";
import { useScrollEnable } from "./hook/useScrollEnable";
import { dataFake } from "./mock/data";

function App() {
  const elementContent = useRef({} as HTMLDivElement);
  const outputContent = useRef({} as HTMLTextAreaElement);
  const dropDownElement = useRef({} as HTMLDivElement);
  const previewSelection = useRef({} as Range);

  const getRandomColorForTags = (): string => {
    const colorsMatrix = [
      "#b91c1c",
      "#4d7c0f", "#15803d",
      "#047857", "#0f766e", "#0891b2",
      "#0369a1", "#2563eb", "#4f46e5",
      "#7c3aed", "#7e22ce", "#a21caf",
      "#be185d"
    ];

    return colorsMatrix[Math.floor(Math.random() * colorsMatrix.length)];
  }

  useScrollEnable({
    element: elementContent,
    action_on_enabled: () => {
      elementContent.current.classList.add("customScroll");
      elementContent.current.classList.remove("noScroll");
    },
    action_on_disabled: () => {
      elementContent.current.classList.add("noScroll");
      elementContent.current.classList.remove("customScroll");
    }
  })

  const handleShowContent = () => {
    alert(elementContent.current.innerText);
  }

  const insertContentInCaretPosition = (element: any, hadCustomSelection?: Range) => {
    const selection = window.getSelection() as Selection;
    if (selection.rangeCount > 0) {
      const range = (() => {
        if (hadCustomSelection) {
          selection.removeAllRanges();
          selection.addRange(hadCustomSelection);
        }

        return selection.getRangeAt(0);
      })();

      if (hadCustomSelection) {
        range.setStart(range.startContainer, range.startOffset - 1);
        //range.setEnd(range.endContainer, range.endOffset - 1);
      }

      range.deleteContents();

      range.insertNode(element);
      range.setStartAfter(element);
      range.setEndAfter(element);

      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  const searchForPreviousColorsInTheTag = (tagValue: string): string => {
    const allSpansTags = elementContent.current.querySelectorAll("span");

    for (let i = 0; i < allSpansTags.length; i++) {
      if (allSpansTags[i].getAttribute("data-field") === tagValue) {
        return window.getComputedStyle(allSpansTags[i]).backgroundColor;
      }
    }

    return "";
  }

  const handleInserValue = (value: string) => {
    elementContent.current.focus();

    const textValue = document.createElement("span");
    const tagColor = searchForPreviousColorsInTheTag(`{{${value}}}`);

    textValue.innerText = value;
    textValue.classList.add("tag");
    textValue.contentEditable = "false";
    textValue.style.backgroundColor = tagColor.length ? tagColor : getRandomColorForTags();
    textValue.setAttribute("data-field", `{{${value}}}`);

    insertContentInCaretPosition(textValue, previewSelection.current);
    dropDownElement.current.style.display = "none";
    retriveOutPutFromTextArea();
  }

  const retriveOutPutFromTextArea = () => {
    const parser = new DOMParser();
    const content = parser.parseFromString(elementContent.current.innerHTML, "text/html");
    const tags = content.querySelectorAll("span");
    let finalContent = "";

    for (let i = 0; i < tags.length; i++) {
      tags[i].innerText = tags[i].getAttribute("data-field") as string;
    }

    content.querySelector("body")?.childNodes.forEach(node => {
      console.log(node.nodeName);

      if (node.nodeName === "#text" || node.nodeName === "SPAN")
        finalContent += node.textContent

      if (node.nodeName === "BR")
        finalContent += "\n"
    })

    outputContent.current.value = finalContent;
  }

  useEffect(() => {
    const handleSlashCommand = (e: KeyboardEvent) => {
      retriveOutPutFromTextArea();
      if (e.key === "/") {
        const element = document.createElement("span");
        previewSelection.current = (window.getSelection() as Selection).getRangeAt(0).cloneRange();
        element.id = "joker";

        insertContentInCaretPosition(element);
        const getJokerElement = document.getElementById("joker") as HTMLDivElement;

        if (getJokerElement) {
          const coords = getJokerElement.getBoundingClientRect();
          getJokerElement.remove();

          dropDownElement.current.style.top = `${coords.y + 20}px`;
          dropDownElement.current.style.left = `${coords.x + 10}px`;
          dropDownElement.current.style.display = "block";
        }
        return;
      }

      dropDownElement.current.style.display = "none";
    }

    const removeUnwantedDivs = () => {
      const divs = elementContent.current.querySelectorAll('div');

      divs.forEach(div => {
        const br = document.createElement('br');
        while (div.firstChild) {
          elementContent.current.insertBefore(div.firstChild, div);
        }
        elementContent.current.insertBefore(br, div.nextSibling);
        div.remove();
      });
    }

    elementContent.current.addEventListener("input", removeUnwantedDivs);
    elementContent.current.addEventListener("keyup", handleSlashCommand);
    return () => {
      elementContent.current.removeEventListener("input", removeUnwantedDivs);
      elementContent.current.removeEventListener("keyup", handleSlashCommand);
    }
  }, [])

  return (
    <div className="w-full flex flex-col justify-start items-center p-[30px]">
      <div
        className="w-full p-[15px] rounded-md border outline-none max-h-[250px] overflow-scroll noScroll"
        contentEditable
        ref={elementContent}
      >
      </div>
      <div className="w-full grid grid-cols-3 gap-[10px] mt-[10px]">
        <Button
          className="w-full"
          onClick={() => handleShowContent()}
        >
          Show content
        </Button>
        <Button
          className="w-full"
          onClick={() => localStorage.setItem("editorState", elementContent.current.innerHTML)}
        >
          Salvar
        </Button>
        <Button
          className="w-full"
          onClick={() => {
            elementContent.current.innerHTML = localStorage.getItem("editorState") as string
          }}
        >
          Carregar
        </Button>
      </div>
      <div className="w-[250px] rounded-md border p-[7px] shadow-md hidden absolute bg-white" ref={dropDownElement}>
        <div className="w-full flex flex-col justify-start items-start mb-[0px]">
          <p className="text-gray-400 uppercase font-semibold text-[.8em]">Váriaveis de usário</p>
          {dataFake.map((payload, index) => (
            <div
              className="w-full mt-[10px] rounded-md cursor-pointer text-gray-500 p-[5px] px-[10px] hover:bg-gray-100"
              key={index}
              onClick={() => handleInserValue(payload.title)}
            >
              {payload.title}
            </div>
          ))}
        </div>
      </div>
      <div className="w-full flex flex-col justify-start items-start mt-[30px]">
        <p className="mb-[5px]">Output:</p>
        <textarea
          readOnly
          ref={outputContent}
          className="border rounded-md w-full outline-none p-[15px]"
        ></textarea>
      </div>
    </div>
  )
}

export default App;