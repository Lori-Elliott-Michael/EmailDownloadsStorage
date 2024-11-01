// background.js 

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

          console.log("Not a Gmail attachment, the referrer was " + downloadItem.referrer + "."); // Debug log 

        } 

      } 

    }); 

  } 

}); 

 

// Log any download errors 

chrome.downloads.onErased.addListener(function (downloadId) { 

  console.error("Download erased:", downloadId); 

}); 