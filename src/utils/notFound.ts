import path from 'path';
import fs from 'fs-extra';
import ejs from 'ejs';
import { sendFile, sendError, splitPath } from './index';
import { IServerResponse } from './props';
import getFileDirectory from './getFileDirectory';
import sortDirs from './sortDirs';


export default async (res: IServerResponse, resource: string, message: string = '') => {
  const filename: string = path.join(__dirname, '404.ejs');
  const projectName: string = path.basename(res.projectDir)
  let html: string = '';
  try {
    let nav: { [key: string]: any }[] = [{ name: projectName, path: '/' }]
    html = (await fs.readFile(filename)).toString();
    if (res.fileDir && res.projectDir) {
      let dirs = await getFileDirectory(res.fileDir, res.projectDir);
      dirs = sortDirs(dirs);
      nav = [...nav,...splitPath(res.pathname)];
      html = await ejs.render(html, {
        title: `Files within ssr${(nav[nav.length - 1] && nav[nav.length - 1].path) || '/'}`,
        nav,
        projectName,
        date: [...dirs],
        message,
      }, { filename });
    } else {
      html = await ejs.render(html, { title: message, projectName, nav, date: [], message, }, { filename });
    }
  } catch (error) {
    console.log(error.message);
  }

  sendFile(res, resource, 404, html, 'html');
  return sendError(res, decodeURI(resource), 404);
}