document.addEventListener("click", function (event) {
  if (event.target.tagName === "A" && document.URL.includes("mail")) {
    console.log("documentURL ", typeof document.URL, document.URL);
    chrome.runtime.sendMessage({
      currentLinkUrl: document.URL,
      clickedLinkUrl: event.target.href,
    });
  }
});
