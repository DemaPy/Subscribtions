const state = {
    title: ""
}

// 1. Select content container (sidebar)
const contentContainer = document.querySelector("#contentContainer") 
// attrs swipe-open opened for open STATE or swipe-open for CLOSE state

// 2. Select second element within content container (subscriptions)
const subscriptions = contentContainer.querySelector("#sections").children[1]


function init() {
    // 2.1 Add folder icon to section title
    const titleContainer = subscriptions.querySelector("h3")
    titleContainer.style = "display: flex; align-items: center; justify-content: space-between"
    
    // 2.2 Change content for titleContainer
    titleContainer.append(content.title_svg())
}

const content = {
    title_svg: () => {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg')
        svg.setAttribute("width", "20")
        svg.setAttribute("height", "20")
        svg.setAttribute("viewBox", "0 0 24 24")
        svg.setAttribute("fill", "none")
        svg.setAttribute("stroke", "white")
        
        svg.setAttribute("stroke-width", "1")
        svg.setAttribute("stroke-linecap", "round")
        svg.setAttribute("stroke-linejoin", "round")
        svg.setAttribute("class", "lucide lucide-folder")
        
        applyListeners({key: "title_svg", node: svg})
    
        svg.innerHTML = `
            <title>Create folder</title>
            <use xlink:href="#some-icon"></use>
            <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>
        `
        return svg
    },
    create_folder: () => {
        const details = document.createElement("details")
        details.style = "margin-block-end: 0.6rem;"
        
        const summary = document.createElement('summary')
        summary.textContent = state.title
        summary.style = "font-size: 1.4rem; color: #ffffff; padding: .8rem; background: #24242444; border-radius: 0.6rem; cursor: pointer;"
        
        const subscriptionList = document.createElement("div")
        subscriptionList.style = "display: flex; flex-direction: column; gap: 0.4rem;"
        subscriptionList.textContent = "Subscription list"
        
        details.append(summary)
        details.append(subscriptionList)
        
        return details
    },
    folder_name: () => {
        const input = document.createElement("input")
        input.style = "margin: 0.6rem 1rem; border-radius: 0.4rem; background: #ccc;"
        applyListeners({key: "folder_name", node: input})
        return input
    }
};

function applyListeners({key, node}) {
    const events = {
        "title_svg": [
            {
                event: "click",
                handler: () => {
                    // 3. Create folder with name
                    const items = subscriptions.querySelector("#items")
                    const input = content.folder_name()
                    items.insertAdjacentElement("afterbegin", input)
                    input.focus()
                }
            },
            {
                event: "mouseover",
                handler: (ev) => ev.target.style.cursor = "pointer"
            },
            {
                event: "mouseleave",
                handler: (ev) => ev.target.style.cursor = "auto"
            },
        ],
        "folder_name": [
            {
                event: "input",
                handler: (ev) => state.title = ev.target.value
            },
            {
                event: "keypress",
                handler: (event) => {
                    if (state.title.trim().length < 3) return
                    if (event.key === "Enter") {
                        // 3. Create folder with name
                        const items = subscriptions.querySelector("#items")
                        items.insertAdjacentElement("afterbegin", content.create_folder())
                        state.title = ""
                        event.target.remove()
                    }
                }
            },
            {
                event: "blur",
                handler: (ev) => {
                    if (state.title.trim().length < 3) return
                    // 3. Create folder with name
                    const items = subscriptions.querySelector("#items")
                    items.insertAdjacentElement("afterbegin", content.create_folder())
                    state.title = ""
                    ev.target.remove()
                }
            }
        ]
    }

    for (let {event, handler} of events[key]) {
        node.addEventListener(event, handler)
    }
}

init()
