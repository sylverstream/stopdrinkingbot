import * as fs from "fs";
import LemmyBot, { BotActions } from "lemmy-bot";
import { env } from "process";
import * as yaml from "yaml";

const getCurrentDay: () => number = () => {
  const nzDateTimeStr = new Date().toLocaleString("en-US", {
    timeZone: "Pacific/Auckland",
  });
  const nzDate = new Date(nzDateTimeStr);
  const currentDay = nzDate.getDay();
  return currentDay;
};
const bot = new LemmyBot({
  instance: "lemmy.world",
  credentials: {
    username: env.BOT_USERNAME,
    password: env.BOT_PASSWORD,
  },
  //dbFile: "db.sqlite3",
  connection: {
    minutesBeforeRetryConnection: 1,
  },
  schedule: [
    {
      runAtStart: false,
      cronExpression: "0 9 * * *",
      timezone: "Pacific/Auckland",
      doTask: async (botActions: BotActions) => {
        console.log("Starting bot task");
        const dailycheckinsFile = fs.readFileSync(
          "./dailycheckins.yml",
          "utf8"
        );
        const dailycheckins = yaml.parse(dailycheckinsFile);
        const communityId = await botActions.getCommunityId({
          instance: "lemmy.world",
          name: "stopdrinking",
        });
        const currentDay = getCurrentDay();
        const key = `day_${currentDay}`;
        const post = dailycheckins[key];
        const name = post["title"];
        const body = post["body"];
        botActions.createPost({
          name,
          communityId,
          body,
          nsfw: false,
        });
        return Promise.resolve();
      },
    },
  ],
});
console.log(`starting bot at day ${getCurrentDay()}`);
bot.start();

const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req: any, res: any) => {
  res.send("OK");
});

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});
