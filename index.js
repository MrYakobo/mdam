var mjpage = require('mathjax-node-page').mjpage
var fs = require('fs-extra')
const cheerio = require('cheerio')
var minify = require('html-minify').minify
const path = require('path')
const showdown = require('showdown')
const md = new showdown.Converter({
    simpleLineBreaks: true,
    noHeaderId: false,
    literalMidWordAsterisks: true,
    literalMidWordUnderscores: true,
    tables: true,
    emoji: true
})

const stdin = require('get-stdin')

async function compileAM({input = '', isHTML = false, title = 'fl', head = `<!DOCTYPE html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>`, tail = ''} = {}) {
    if(isHTML){
    //remove mathjax script, escape `''`, insert search highlighting script, remap ../style.css to style.css
    input = input
            .replace(/<script src=".*mathjax.*/g, '')
            .replace(/''/g, `^&#x2033;`)
            .replace('../style.css','style.css')
    }
    else {
        const $$ = cheerio.load(head)
        $$('head').append(`<title>${title}</title>`)
	    head = $$.html()
        const $ = cheerio.load(`${head}<body class="markdown">${input}${tail}</body>`)
        
        const nodes = $('p:contains("`")').contents().toArray() //unpack <p>`foo`bar</p> to `foo`<p>bar</p>.
        const unpack = nodes.filter(t=> t.data != null && t.data.indexOf('\\`')>-1)
        unpack.forEach(t=> {
            const math = /\\`(.+?)\\`/.exec(t.data)
            $(t).text(t.data.replace(math, '')) //remove math from element
            $(t.parentNode).before(math) //add math as a seperate text node before <p>.
        })
        $('em').toArray().map(t=>{
            $(t).before($(t).text()) //unpack <em>foo</em> to foo
            $(t).remove()
        })
        input = $.html()
    }
    //compile asciimath to svg (heavy operation):
    var str = await mjPromise(input)

    try{
        var minified = minify(str)
        return minified
    }
    catch(er){
        return str
    }
}


function mjPromise(input) {
    return new Promise((res, rej) => {
        mjpage(input, {
            format: 'AsciiMath'
        }, {
            svg: true
        }, (output) => {
            res(output)
        })
    })
}

async function compileMd(opt){
    const escaped = opt.input.replace(/`(.+?)`/g,'\\`$1\\`')
    opt.input = md.makeHtml(escaped)
    return await compileAM(opt)
}

module.exports = async function (inputFile, toFile = false, title, head, tail) {
	let out = ''
	let file = ''
    // main:
    if (inputFile != null) {
		const input = fs.readFileSync(inputFile, 'utf8')
        out = await compileMd({input, title, head, tail})
        let ext = path.extname(inputFile).toLowerCase()
        file = path.basename(inputFile).replace(ext, '.html')
	}
    else {
        const str = await stdin()
        if (str == '') {
            throw 'no stdin not argument'
        }

        out = await compileMd({input: str, title, head, tail})
		file = 'stdout.html'
    }

	if (toFile)
    	fs.writeFileSync(file, out)
	else
    	console.log(out)
}
