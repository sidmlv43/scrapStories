const http = require("http");
const https = require("https");

const fs = require("fs");

const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.writeHead(200, {
      "Content-type": "text/html",
    });
    res.end('<a href="/getTimeStories">Please tap me to get latest news </a>');
  }
  if (req.url === "/getTimeStories") {
    https.get("https://time.com/", (response) => {
      let data = [];

      response.on("data", (chunk) => {
        data.push(chunk);
      });
      response.on("end", () => {
        fs.writeFileSync("time.html", data.join("").toString(), function (err) {
          if (err) {
            console.log(err);
          }
          console.log("file written");
        });

        fs.readFile("time.html", (err, data) => {
          if (err) {
            console.log(err);
          }
          const parsedData = data.toString();

          const arrayData = parsedData.split("</div>");

          const targetDiv = arrayData.filter((el) =>
            el.includes(`class="latest-stories__item"`)
          );
          const targetDivString = targetDiv.toString();
          const targetList = targetDivString.split("</li>");
          const targetLink = targetList.map((el) => {
            const link = el.match(/<a[^>]*href=["']([^"']*)["']/g);
            return link;
          });

          //   console.log(targetList);

          const realLink = targetLink.map((link) => {
            return String(link);
          });

          const extactedLink = realLink.map((link) => {
            return link.substring(9, link.length - 1);
          });
          //   console.log(extactedLink);

          const postTitleTags = targetList.map((el) =>
            el.match(/<h3\sclass="latest-stories__item-headline">(.*)<\/h3>/)
          );

          console.log(postTitleTags);
          const postTitleTagsString = postTitleTags.toString();
          const processedPostTitleString = postTitleTagsString.split(",");

          const extractedPostTitleString = [
            processedPostTitleString[1],
            processedPostTitleString[3],
            processedPostTitleString[5],
            processedPostTitleString[7],
            processedPostTitleString[9],
            processedPostTitleString[11],
          ];

          const resData = [];

          console.log(extractedPostTitleString);
          for (const key in extractedPostTitleString) {
            console.log(key);
            resData.push({
              title: extractedPostTitleString[key],
              link: "https://www.time.com/" + extactedLink[key],
            });
          }

          console.log(resData);

          res.writeHead(200, {
            "Content-type": "application/json",
          });
          res.end(JSON.stringify({ data: resData }));
        });
      });
      //   console.log(data);
    });
  }
});

server.listen(3000, (req, res) => {
  console.log("server is running at http://localhost:3000");
});
