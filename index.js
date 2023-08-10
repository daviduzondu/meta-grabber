const PORT=5000;
import  cheerio  from "cheerio";
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import url from 'url';
import fs from "fs";
import moment from "moment";

const app = express();
app.use(cors())

let html;
let metadata = {img:"", description:"", error:true, message:""};

async function getMainPage(target, res){
    let options = url.parse(target);
    try {
        const response = await fetch(target)
            html = await response.text();
            const $ = cheerio.load(html);

            function formatURL(link){
                if (!link.startsWith("http")){
                    return options.protocol + "//" + options.host + link;
                } else {
                    return link
                }
            }

            $('meta').each(function(index){
                if($(this).attr('property')==="og:image" && !metadata.img) {metadata.img = formatURL($(this)['0'].attribs.content); metadata.error=false; metadata.message+="image_"}

                if($(this).attr('name') === "image" && !metadata.img) {metadata.img = formatURL($(this)['0'].attribs.content); metadata.error=false; metadata.message+="image_"}

                if($(this).attr('property')==="og:description" && !metadata.description){ metadata.description = $(this)['0'].attribs.content; metadata.error=false; metadata.message+="description_"}

                if($(this).attr('name') === "description" && !metadata.description){ metadata.description = $(this)['0'].attribs.content; metadata.error=false; metadata.message="description_"}

                if(index===$('meta').length - 1 && !metadata.img && !metadata.description) {throw new Error('not_found')}
            })    
            
        } catch (error) {
            metadata.error=true;
            metadata.test="hello";
            metadata.message=error.message;
        } finally {
            res.json(metadata);
            metadata = {img:"", description:"", error:true, message:"not_found"};
        }
}


app.get('/', (req, res)=>{
    if(req.query.url) getMainPage(JSON.parse(req.query.url), res);
    else res.redirect("*");
})

app.get('*', (req, res)=>{
    getMainPage(null, res);
})



app.listen(process.env.PORT || PORT)