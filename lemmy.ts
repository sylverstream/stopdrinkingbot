import * as fs from "fs";
import LemmyBot, { BotActions } from "lemmy-bot";
import { env } from "process";
import * as yaml from "yaml";
console.log("defining bot");
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
        const currentDay = new Date().getDay();
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

bot.start();
