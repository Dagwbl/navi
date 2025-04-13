function toggleNav() {
  const leftNav = document.querySelector(".left-nav");
  const navToggle = document.querySelector(".nav-toggle span");
  const container = document.querySelector(".container");

  leftNav.classList.toggle("collapsed");
  const isCollapsed = leftNav.classList.contains("collapsed");

  navToggle.textContent = isCollapsed ? "▶" : "◀";
  localStorage.setItem("navCollapsed", JSON.stringify(isCollapsed));

  if (isCollapsed) {
    container.style.height = "100vh";
    document.querySelector("header").style.display = "none";
    document.querySelector("footer").style.display = "none";
  } else {
    container.style.height = "calc(100vh - var(--header-height))";
    document.querySelector("header").style.display = "";
    document.querySelector("footer").style.display = "";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const navContainer = document.querySelector(".left-nav");
  const toolFrame = document.getElementById("toolFrame");

  // 加载 JSON 数据
  fetch("data/navigation.json")
    .then((response) => response.json())
    .then((data) => {
      let firstLink = null;

      data.forEach((group, index) => {
        const groupDiv = document.createElement("div");
        groupDiv.className = "nav-group";

        const titleWrapper = document.createElement("div");
        titleWrapper.style.position = "relative";

        const title = document.createElement("div");
        title.className = "nav-title";
        title.textContent = group.category.toUpperCase();

        // Add nav-toggle to first group
        if (index === 0) {
          const navToggle = document.createElement("div");
          navToggle.className = "nav-toggle";
          navToggle.innerHTML = "<span>◀</span>";
          navToggle.addEventListener("click", toggleNav);
          titleWrapper.appendChild(navToggle);
        }

        titleWrapper.appendChild(title);
        groupDiv.appendChild(titleWrapper);

        const itemsDiv = document.createElement("div");
        itemsDiv.className = "nav-items";

        const sortedItems = group.items.sort(
          (a, b) => (a.weight || 0) - (b.weight || 0)
        );

        sortedItems.forEach((item) => {
          const wrapper = document.createElement("div");
          wrapper.className = "nav-item-wrapper";

          const link = document.createElement("a");
          link.className = "nav-item";
          link.title = item.name;
          link.setAttribute("data-tool", item.link);
          link.dataset.toolName = item.name; // Add this line

          if (item.refused) {
            link.href = item.link;
            link.target = "_blank";
          } else {
            link.href = `#${encodeURIComponent(item.name)}`;
          }

          if (item.icon) {
            const icon = document.createElement("span");
            icon.className = "icon";
            icon.textContent = item.icon;
            link.appendChild(icon);
          } else {
            // Fetch icon from DuckDuckGo if not provided
            const icon = document.createElement("img");
            icon.className = "icon";
            // Replace item.name with parsed domain from item.link
            const domain = new URL(item.link).hostname;
            icon.src = `https://icons.duckduckgo.com/ip3/${encodeURIComponent(
              domain
            )}.ico`;
            icon.onerror = function () {
              // Fallback to a default icon if the fetch fails
              this.src = "https://icons.duckduckgo.com/ip3/default.ico";
            };
            link.appendChild(icon);
          }

          const text = document.createElement("span");
          text.textContent = item.name;
          link.appendChild(text);
          wrapper.appendChild(link);

          const extLink = document.createElement("a");
          extLink.href = item.link;
          extLink.className = "external-link";
          extLink.target = "_blank";
          extLink.textContent = "↪";
          wrapper.appendChild(extLink);

          itemsDiv.appendChild(wrapper);

          if (!firstLink && !item.refused) {
            firstLink = link;
          }

          if (!item.refused) {
            link.addEventListener("click", (e) => {
              e.preventDefault();
              toolFrame.src = item.link;
              document
                .querySelectorAll(".nav-item-wrapper")
                .forEach((i) => i.classList.remove("active"));
              wrapper.classList.add("active");
              history.replaceState(null, "", link.href);
            });
          }
        });

        groupDiv.appendChild(itemsDiv);
        navContainer.appendChild(groupDiv);
      });

      if (window.location.hash) {
        const hash = decodeURIComponent(window.location.hash.slice(1));
        const hashLink = document.querySelector(`.nav-item[href="#${hash}"]`);
        if (hashLink) {
          hashLink.click();
        }
      } else if (firstLink) {
        firstLink.click();
      }
    });

  // Dark mode toggle
  // Update theme toggle handler in main.js
  document.getElementById("themeToggle").addEventListener("click", () => {
    const body = document.body;
    const sunIcon = document.getElementById("sun-icon");
    const moonIcon = document.getElementById("moon-icon");

    body.classList.toggle("dark-mode");

    // Toggle icons with animation
    if (body.classList.contains("dark-mode")) {
      sunIcon.style.transform = "scale(0)";
      moonIcon.style.transform = "scale(1)";
    } else {
      moonIcon.style.transform = "scale(0)";
      sunIcon.style.transform = "scale(1)";
    }

    // Save preference
    localStorage.setItem("darkMode", body.classList.contains("dark-mode"));
  });

  // Initialize theme with icon state
  if (localStorage.getItem("darkMode") === "true") {
    document.getElementById("sun-icon").style.transform = "scale(0)";
    document.getElementById("moon-icon").style.transform = "scale(1)";
  } else {
    document.getElementById("moon-icon").style.transform = "scale(0)";
  }

  // Update title when nav item is clicked
  document.getElementById("toolFrame").addEventListener("load", function () {
    const activeItem = document.querySelector(
      ".nav-item-wrapper.active .nav-item"
    );
    const itemName = activeItem ? activeItem.dataset.toolName : "Jeapo Navi";
    document.getElementById("pageTitle").textContent = itemName;
  });
});
