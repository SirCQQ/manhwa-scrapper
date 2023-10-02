import axios from "axios";
import { load } from "cheerio";
import { existsSync, mkdir, writeFile } from "fs";

type Img = {
  index: number;
  src: string;
};
type Chapter = {
  chapterNumber: number;
  imgs: Img[];
};

const names = [
  //   "the-player-hides-his-past",
  //   "academys-genius-swordmaster",
  //   "revenge-of-the-iron-blooded-sword-hound",
  //   "return-of-the-shattered-constellation",
  "solo-max-level-newbie",
  //   "omniscient-readers-viewpoint",
];

const getChapters = async (name: string) => {
  const data = (
    await axios.get(`https://asuracomics.com/manga/4102803034-${name}/`)
  ).data;
  const $ = load(data);
  const chapters = $("div.eph-num>a")
    .map((index, elem) => {
      const url = elem.attribs["href"];
      const $chapter = $(elem);
      const chapter = $chapter.find("span.chapternum").text();
      return { url, chapter };
    })

    .toArray();
  const fullChapters: Chapter[] = await Promise.all(
    chapters.map(async (elem) => {
      const imgs = await getChapterImages(elem.url);
      return {
        chapterNumber: parseInt(elem.chapter.replace("Chapter ", "")),
        imgs,
      };
    })
  );
  const sortedChapters = [...fullChapters].sort(
    (a, b) => a.chapterNumber - b.chapterNumber
  );
  return sortedChapters;
};

const getChapterImages = async (url: string) => {
  const result = (await axios.get(url)).data;
  const $ = load(result)("#readerarea");
  const imgs = $.find("img");
  const images: Img[] = imgs
    .map((idx, elem) => {
      return { index: idx, src: elem.attribs["src"] };
    })
    .toArray();
  return images;
};

const combineAll = (allChapters: Chapter[]) => {
  const content: string[] = [];
  allChapters.forEach((chapter) => {
    const images = [...chapter.imgs].sort((a, b) => a.index - b.index);
    images.forEach((img) => {
      content.push(
        `<img src="${img.src}" alt="${chapter.chapterNumber}-${img.index}" style="width:100%;"/>`
      );
    });
  });
  return content.join("\n");
};

const createChapter = (chapter: Chapter, name: string) => {
  const chapterContent: string[] = [];
  chapter.imgs
    .sort((a, b) => a.index - b.index)
    .forEach((img) => {
      chapterContent.push(
        `<img src="${img.src}" alt="${chapter.chapterNumber}-${img.index}" style="width:100%;"/>`
      );
    });
  let document = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${createName(name)}</title>
    </head>
    <body style="display: flex; align-items:center; justify-content:center;">
    <div style="width:50%;min-width:500px;max-width:750px;" >
    ${chapterContent.join("\n")}
    </div>    
    </body>
    </html> `;

  writePage(document, `./dist/${name}/${chapter.chapterNumber}.html`);
};

const createChapters = (chapters: Chapter[], name: string) => {
  chapters.forEach((chapter) => createChapter(chapter, name));
};

const createFluentStory = async (allChapters: Chapter[], name: string) => {
  let document = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${createName(name)}</title>
    </head>
    <body style="display: flex; align-items:center; justify-content:center;">
    <div style="width:50%;min-width:500px;max-width:750px;" >
    ${combineAll(allChapters)}
    </div>    
    </body>
    </html> `;

  writePage(document, `./dist/${name}/fluent.html`);
};

const createFolder = (folderName: string) => {
  if (!existsSync(folderName)) {
    mkdir(folderName, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("New directory successfully created.");
      }
    });
  } else {
    console.log("FOLDER ALRAEDY EXISTS ");
  }
};

const writePage = (content: string, name: string) => {
  writeFile(name, content, (err) => {
    if (err) {
      console.error(err);
    }
    console.log(`SUCCESSFUL WRITE ${name}`);
  });
};

const createName = (title: string) => {
  const arr = title.toLocaleLowerCase().split(" ");
  for (let i = 0; i < arr.length; i++) {
    arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
  }
  return arr.join(" ");
};

const main = async () => {
  await Promise.all(
    names.map(async (name) => {
      createFolder(name);
      const chapters = await getChapters(name);
      await createFluentStory(chapters, name);
      createChapters(chapters, name);
    })
  );
};

main();
