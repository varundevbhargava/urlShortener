import express, {Request, Response} from 'express';
import {PrismaClient } from '@prisma/client'
import { create } from 'domain';


const app = express();
const prisma = new PrismaClient();

app.use(express.json());

const PORT = process.env.PORT || 3000;

const createHash: (id : number) => string = ( id: number) => {

    let map : String = "abcdefghijklmnopqrstuvwxyzABCDEF"
    "GHIJKLMNOPQRSTUVWXYZ0123456789";
    let shorturl : Array<String> = [];
    while(id){
      shorturl.push(map[id%62]);
      id= Math.floor(id/62);
    }
    shorturl.reverse();
    return ("http://vdbshortener/" + shorturl.join(""));
  
  };

app.post('/submit-longurl', async (req,res) =>{
    const longurl = req.body.longurl as string;

    console.log("Url requested: ", longurl);
    const url = await prisma.url.findFirst({
        where:{
            originalUrl: longurl,
        },
    })
    if(url){
        console.log('Url already present: ', url.shorturl);
        res.json({message: 'url already present', originalurl : longurl, shortenedurl: url.shorturl});
    }else{
        const newurl = await prisma.url.create({
            data :{
                originalUrl: longurl,
                shorturl : longurl,
            },
        });
        console.log('Added url to database :', longurl, 'id: ', newurl.id);
        
        await prisma.url.update({
            where : {id: newurl.id},
            data : {
                shorturl : createHash(newurl.id)    
            },
        });
        console.log('url updated and shortened to : ', newurl.shorturl);
        res.json({message: 'url created and updated', originalurl : longurl, shortenedurl: createHash(newurl.id)});

    }
});

app.get('/geturl-short', async (req,res) => {
    const short = req.body.short as string;
    
    console.log('Short url given and longurl requested : ', short);
    const urrl = await prisma.url.findUnique({
        where : {
            shorturl : short,
        },
    })
    if(urrl){
        console.log('originalfound: ', urrl.originalUrl);
        res.json({
            message: 'url found',
            originalurl: urrl.originalUrl,
            shorturl: urrl.shorturl,
        });
    }else{
        console.log('Error: original url not found', short);
        res.status(404).json({
            message: " Error, original not found in db",
        });
    }
})


app.listen(PORT, ()=>{
    console.log(`server is running at port:  ${PORT}`);
});