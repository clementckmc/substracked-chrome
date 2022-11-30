const scrapeAmazon = () => {
  const plan = document.querySelectorAll(".mcx-menu-item__heading")[0].textContent.split(" ")[0]
  const endDate = document.querySelectorAll(".mcx-menu-item__heading")[2].textContent
  return {plan, endDate}
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    sendResponse(scrapeAmazon())
  }
);
