import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const port = Number(process.env.PORT) || 4174;
const root = fileURLToPath(new URL('.', import.meta.url));
const types = {'.css':'text/css; charset=utf-8','.html':'text/html; charset=utf-8','.jpg':'image/jpeg','.js':'text/javascript; charset=utf-8','.mp4':'video/mp4','.png':'image/png','.svg':'image/svg+xml','.webm':'video/webm'};
const server = createServer((request,response)=>{
  const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
  const relative=pathname==='/'?'index.html':pathname.replace(/^\/+/, '');
  const file=normalize(join(root,relative));
  if(!file.startsWith(normalize(root))||!existsSync(file)||!statSync(file).isFile()){response.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});response.end('Not found');return;}
  const size=statSync(file).size;
  const type=types[extname(file).toLowerCase()]||'application/octet-stream';
  const range=request.headers.range;
  if(range&&type.startsWith('video/')){
    const [startText,endText]=range.replace('bytes=','').split('-');
    const start=Number(startText)||0;
    const end=Math.min(Number(endText)||size-1,size-1);
    response.writeHead(206,{'Accept-Ranges':'bytes','Cache-Control':'no-cache','Content-Length':end-start+1,'Content-Range':`bytes ${start}-${end}/${size}`,'Content-Type':type});
    createReadStream(file,{start,end}).pipe(response);
    return;
  }
  response.writeHead(200,{'Accept-Ranges':'bytes','Cache-Control':'no-cache','Content-Length':size,'Content-Type':type});
  createReadStream(file).pipe(response);
});
server.listen(port,'127.0.0.1',()=>console.log(`Limitless Reels is available at http://127.0.0.1:${port}`));
export { server };
