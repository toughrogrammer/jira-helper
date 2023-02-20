const UI_INTERVAL = 500;

const getElementByXPath = (path, node) => (
  document.evaluate(
      path,
      node,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
  )
  .singleNodeValue
)

const delay = millisecond => new Promise(resolve => {
  setTimeout(resolve, millisecond)
})

const getMenuButton = sprint => (
  getElementByXPath(`//div[text()="${sprint}"]/../..//button[@aria-label="${sprint} actions"]`, document)
)

const getSprintUpButton = sprint => (
  getElementByXPath(`//div[text()="${sprint}"]/../..//span[text()="Move sprint up"]`, document)
)

const getSprintDownButton = sprint => (
  getElementByXPath(`//div[text()="${sprint}"]/../..//span[text()="Move sprint down"]`, document)
)

const moveSprintTop = async sprint => {
  if (getMenuButton(sprint) === null) {
      throw 'sprint not found';
  }

  if (getSprintUpButton(sprint) === null) {
      getMenuButton(sprint).click();
      await delay(UI_INTERVAL);
  }

  while(getSprintUpButton(sprint) !== null) {
      getSprintUpButton(sprint).click();
      await delay(UI_INTERVAL);

      getMenuButton(sprint).click();
      await delay(UI_INTERVAL);
  }
}

const moveSprintBottom = async sprint => {
  if (getMenuButton(sprint) === null) {
      throw 'sprint not found';
  }

  if (getSprintDownButton(sprint) === null) {
      getMenuButton(sprint).click();
      await delay(UI_INTERVAL);
  }

  while(getSprintDownButton(sprint) !== null) {
      getSprintDownButton(sprint).click();
      await delay(UI_INTERVAL);

      getMenuButton(sprint).click();
      await delay(UI_INTERVAL);
  }
}

const getMoveButtonTemplate = (buttonId, sprintName, text) => {
  return `
    <span class="Item-z6qfkt-2 ekgTSK" aria-disabled="false" role="menuitem" tabindex="0">
      <span class="ItemParts__ContentWrapper-sc-14xek3m-4 eDgbRC">
        <span class="ItemParts__Content-sc-14xek3m-5 jRBaLt" id="${buttonId}" attr-sprintname="${sprintName}">
          ${text}
        </span>
      </span>
    </span>
  `
}

function callback(mutationList) {
  mutationList.forEach(function(mutation) {
    mutation.addedNodes.forEach(function(addedNode) {
      if (addedNode.nodeType != 1) {
        return;
      }

    
      // Move sprint up, Edit sprint, Delete sprint 버튼 있는 div
      let menuContainer = addedNode.querySelector("div.bRfepw");
      if (!menuContainer) {
        return;
      }

      // aria-controls="HEADER-DROP-1002" 같은게 있는 div
      let header = menuContainer.closest("div.wl0viz-0");
      let sprintId = header.getAttribute("aria-controls");
      // Icebox 같은 sprint name이 inner text로 있는 div
      let sprintName = header.querySelector("div.wl0viz-5").innerText

      console.log(sprintId);
      console.log(sprintName);

      let moveToTopButtonId = `${sprintId}-move-to-top`;
      console.log(moveToTopButtonId);

      const moveToTopButton = getMoveButtonTemplate(moveToTopButtonId, sprintName, "Move sprint to top");
      menuContainer.insertAdjacentHTML("beforeend", moveToTopButton);
      menuContainer.querySelector(`#${moveToTopButtonId}`).addEventListener("click", function (e) {
        const sprintName = e.target.getAttribute("attr-sprintname");
        moveSprintTop(sprintName);
      });

      let moveToBottomButtonId = `${sprintId}-move-to-bottom`;
      const moveToBottomButton = getMoveButtonTemplate(moveToBottomButtonId, sprintName, "Move sprint to bottom");
      menuContainer.insertAdjacentHTML("beforeend", moveToBottomButton);
      menuContainer.querySelector(`#${moveToBottomButtonId}`).addEventListener("click", function (e) {
        const sprintName = e.target.getAttribute("attr-sprintname");
        moveSprintBottom(sprintName);
      });
    });
  });
}
;
const observer = new MutationObserver(callback);
observer.observe(document.body, { childList: true, subtree: true, attributes: false, characterData: false });  
