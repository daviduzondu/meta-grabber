const PORT=5000;
import  cheerio  from "cheerio";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors())

let html;

let metadata = {img:"", description:"", error:false, message:""};

async function getMainPage(target, res){
    metadata.img="";
    metadata.description="";
    metadata.error=false;
    metadata.message="";
    try {
            const response = await fetch(target)
            html = await response.text();
    
            const $ = cheerio.load(html);
            $('meta').each(function(){
                if($(this).attr('property')==="og:image") metadata.img = $(this)['0'].attribs.content;
                if($(this).attr('property')==="og:description") metadata.description = $(this)['0'].attribs.content;
            })    
            
        } catch (error) {
            metadata.error=true;
            metadata.message=error.message;
        }
        res.json(metadata);
}

app.get('/', (req, res)=>{
    if(req.query.url) getMainPage(JSON.parse(req.query.url), res);
    else res.redirect("*");
})

app.get('*', (req, res)=>{
    getMainPage(null, res);
})


app.listen(process.env.PORT || PORT)