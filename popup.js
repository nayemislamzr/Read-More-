const componants = {
    checkbox: document.querySelector("input#checkbox"),
    slider: document.querySelector("span[class='slider round']"),
    header: document.querySelector("header"),
    logo: document.querySelectorAll("img.logo"),
}

const Start = {
    switch (event) {
        if (event.target.checked) {
            componants.header.style.backgroundColor = "var(--header-clicked)";
            for (node of componants.logo) {
                node.style.backgroundImage = "linear-gradient( #4ceadb 50% , var(--header-clicked) 50%)";
            }
        } else {
            componants.header.style.backgroundColor = "var(--header-not-clicked)"
            for (node of componants.logo) {
                node.style.backgroundImage = "linear-gradient(#f70e7a 50%,#e91a7b 50%)";
            }
        }
    },
}

componants.checkbox.addEventListener("change", Start.switch, false);