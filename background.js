// background.js

const fileName = "email_links.txt";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.currentLinkUrl) {
    let date = getCurrentDateTime();
    const linkContent = `${date}: ${message.currentLinkUrl} -> ${message.clickedLinkUrl}\n\n`; // Include both URLs

    // Step 1: Read the existing file content
    chrome.downloads.search({ filenameRegex: fileName }, (results) => {
      if (results.length > 0) {
        console.log("file found, results: " + results);
        const existingFile = results[0];

        // Step 2: Append the new data
        fetch(existingFile.url)
          .then((response) => response.text())
          .then((existingContent) => {
            const updatedContent = existingContent + linkContent;
            downloadFile(updatedContent);
          });
      } else downloadFile(linkContent);
    });
  }
});

function getCurrentDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const milliseconds = String(now.getMilliseconds()).padStart(3, "0"); // Ensure 3 digits

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}

function downloadFile(updatedContent) {
  const blob = new Blob([updatedContent], { type: "text/plain" });
  const reader = new FileReader();
  reader.onloadend = () => {
    const base64Data = reader.result.split(",")[1];
    const base64Url = `data:text/plain;base64,${base64Data}`;

    // Step 2: Save the updated file
    chrome.downloads.download(
      {
        url: base64Url,
        filename: fileName,
        saveAs: false,
        conflictAction: "overwrite",
      },
      (newDownloadId) => {
        if (chrome.runtime.lastError) {
          console.error(
            "Failed to save updated file:",
            chrome.runtime.lastError
          );
        } else {
          console.log("File updated successfully:", newDownloadId);
        }
      }
    );
  };
  reader.readAsDataURL(blob);
}

console.log("Background script loaded"); // Debug log

const destinationDir = "EmailAttachments";

// Listen for download started

chrome.downloads.onCreated.addListener(function (downloadItem) {
  console.log("Download created:", downloadItem); // Debug log
});

chrome.downloads.onChanged.addListener(function (downloadDelta) {
  console.log("Download changed:", downloadDelta); // Debug log

  if (downloadDelta.state && downloadDelta.state.current === "complete") {
    chrome.downloads.search({ id: downloadDelta.id }, function (results) {
      console.log("Search results:", results); // Debug log

      if (results.length > 0) {
        const downloadItem = results[0];

        console.log("Processing download:", downloadItem); // Debug log

        // Check if file is from Gmail (more specific check)
        const isFromGmail =
          downloadItem.referrer &&
          (downloadItem.referrer.includes("mail.google.com") ||
            downloadItem.url.includes("mail.google.com"));

        console.log("referrerer before if statement: " + downloadItem.referrer);
        console.log("isfromgmail: " + isFromGmail);
        if (isFromGmail) {
          console.log("Gmail attachment detected"); // Debug log

          // Get the filename without path

          const filename = downloadItem.filename

            .split("\\")

            .pop()

            .split("/")

            .pop();

          // Create new download

          chrome.downloads.download(
            {
              url: downloadItem.url,

              filename: `${destinationDir}/${filename}`,

              saveAs: false,
            },

            function (downloadId) {
              if (chrome.runtime.lastError) {
                console.error("Copy failed:", chrome.runtime.lastError);
              } else {
                console.log(
                  "File copied successfully to:",

                  `${destinationDir}/${filename}`
                );
              }
            }
          );
        } else {
          console.log(
            "Not a Gmail attachment, the referrer was " +
              downloadItem.referrer +
              "."
          ); // Debug log
        }
      }
    });
  }
});

// Log any download errors

chrome.downloads.onErased.addListener(function (downloadId) {
  console.error("Download erased:", downloadId);
});
