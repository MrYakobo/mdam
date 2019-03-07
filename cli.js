#!/usr/bin/env node

const meow = require('meow')
const mdam = require('.')
const fs = require('fs')
const path = require('path')

const cli = meow(`
	mdam is a program for transpiling MarkDown and AsciiMath to rendered SVG math in html. It can take Asciimath embedded into Markdown from either file or stdin. If stdin is choosen as the source and the -O flag is used, the output file will be named stdout.html.

    Usage
      $ mdam [head] <input>
      $ mdam [head] [-t tail] <input>
	  $ echo <input> | mdam [head]
 
    Options
      -O, Output a file which has the same name but .md/.markdown replaced with .html
	  -t, tail html, inserted just before </body>
 
    Examples
      $ mdam file.md > file.html
      $ mdam head.html -t tail.html file.md -O # output to file.html
`, {
    flags: {
        O: {
            type: 'boolean'
        },
        t: {
            type: 'string',
            default: ''
        }
    },

})

let inputIdx = cli.input.length == 1 ? 0 : 1
let head = cli.input.length == 2 ? fs.readFileSync(cli.input[0], 'utf8') : ''
let tail = cli.flags.t == '' ? '' : fs.readFileSync(cli.flags.t, 'utf8')

let title = process.env.MDAM_TITLE
title = title == null ? path.basename(process.cwd()) : title

// const input = fs.readFileSync(cli.input[inputIdx], 'utf8')
//console.log('input', input)
mdam(cli.input[inputIdx], cli.flags.O, title, head, tail).then(() => {

}).catch((e) => {
    console.error(e)
    cli.showHelp()
})