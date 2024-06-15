const state = {
  items_node: null,
};

const types = {
  folder: "FOLDER",
  channel: "CHANNEL",
};

function init() {
  // 1. Select content container (sidebar)
  const contentContainer = document.querySelector("#contentContainer");
  // attrs swipe-open opened for open STATE or swipe-open for CLOSE state

  // need to wait until user hover sidebar
  let id = setInterval(async () => {
    if (contentContainer.querySelector("#guide-renderer")) {
      // 2. Select second element within content container (subscriptions)
      const subscriptions =
        contentContainer.querySelector("#sections").children[1];
      const items = subscriptions.querySelector("#items");
      state.items_node = items;
      // 2.1 Add folder icon to section title
      const titleContainer = subscriptions.querySelector("h3");
      titleContainer.style =
        "display: flex; align-items: center; justify-content: space-between";

      // 2.2 Change content for titleContainer
      titleContainer.append(content.title_svg());

      const prev = await chrome.storage.local.get("subscriptions");
      const folders = prev ? prev.subscriptions : [];
      for (let folder of folders) {
        const details = content.create_folder(folder, {
          delete: (id) => deleteFolder(id),
        });
        state.items_node.insertAdjacentElement("afterbegin", details);
      }
      clearInterval(id);
    }
  }, 500);
}

const content = {
  title_svg: () => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "20");
    svg.setAttribute("height", "20");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "white");

    svg.setAttribute("stroke-width", "1");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("class", "lucide lucide-folder");

    applyListeners({ key: "title_svg", node: svg });

    svg.innerHTML = `
            <title>Create folder</title>
            <use xlink:href="#some-icon"></use>
            <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>
        `;
    return svg;
  },
  create_folder: (item, handlers) => {
    const details = document.createElement("details");
    details.setAttribute("data-type", item.type);
    details.style = "margin-block-end: 0.6rem;";

    const delete_button = document.createElement("button");
    delete_button.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>';
    delete_button.style =
      "position: absolute; right: 2px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; transition: .3s; opacity: 0";
    delete_button.addEventListener("click", (ev) => {
      ev.stopPropagation();
      handlers.delete(item.id);
    });


    const summary = document.createElement("summary");
    summary.textContent = item.title;
    summary.style =
      "font-size: 1.4rem; color: #ffffff; padding: .8rem; background: #24242444; border-radius: 0.6rem; cursor: pointer; position: relative;";
      summary.addEventListener("mouseover", (ev) => {
        delete_button.style.opacity = "1";
      });
      summary.addEventListener("mouseleave", (ev) => {
        ev.stopPropagation();
        delete_button.style.opacity = "0";
      });

    const subscriptionList = document.createElement("div");
    subscriptionList.style =
      "display: flex; flex-direction: column; gap: 0.4rem;";
    subscriptionList.textContent = "Subscription list";

    summary.append(delete_button);

    details.append(summary);
    details.append(subscriptionList);
    return details;
  },
  folder_name: () => {
    const input = document.createElement("input");
    input.style =
      "margin: 0.6rem 1rem; background: transparent; border: none; border-bottom: 1px solid #ececec; color: #ffffff; outline: none; height: 1rem;";
    applyListeners({ key: "folder_name", node: input });
    return input;
  },
};

function applyListeners({ key, node }) {
  const events = {
    title_svg: [
      {
        event: "click",
        handler: () => {
          // 3. Create folder with name
          const input = content.folder_name();
          state.items_node.insertAdjacentElement("afterbegin", input);
          input.focus();
        },
      },
      {
        event: "mouseover",
        handler: (ev) => (ev.target.style.cursor = "pointer"),
      },
      {
        event: "mouseleave",
        handler: (ev) => (ev.target.style.cursor = "auto"),
      },
    ],
    folder_name: [
      {
        event: "keypress",
        handler: (event) => {
          const value = event.target.value.trim();
          if (value.length < 3) return;
          if (event.key === "Enter") {
            if (value.length <= 20) {
              handleInputSubmit(value);
              event.target.remove();
            }
          }
        },
      },
      {
        event: "blur",
        handler: (event) => {
          const value = event.target.value.trim();
          if (value <= 0) {
            event.target.remove();
          }
        },
      },
    ],
  };

  for (let { event, handler } of events[key]) {
    node.addEventListener(event, handler);
  }
}
async function handleInputSubmit(value) {
  // 3. Create folder
  const prev = await chrome.storage.local.get("subscriptions");
  await chrome.storage.local.set({
    subscriptions: [
      ...(prev.subscriptions || []),
      {
        id: Math.floor(Date.now() / 1000),
        title: value,
        data: [],
        type: types.folder,
      },
    ],
  });
}

async function renderFolders(subscriptions) {
  [...state.items_node.querySelectorAll('[data-type="FOLDER"]')].forEach(
    (item) => item.remove()
  );
  for (let folder of subscriptions || []) {
    const details = content.create_folder(folder, {
      delete: (id) => deleteFolder(id),
    });
    state.items_node.insertAdjacentElement("afterbegin", details);
  }
}

async function deleteFolder(id) {
  const prev = await chrome.storage.local.get("subscriptions");
  const filtered = prev.subscriptions.filter((item) => item.id !== id);
  await chrome.storage.local.set({ subscriptions: filtered });
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  renderFolders(changes.subscriptions.newValue);
});

init();
