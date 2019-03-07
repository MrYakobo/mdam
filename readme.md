# **M**ark**d**own with **A**scii**M**ath transpiler

mdam is a program for transpiling **M**ark**D**own and **A**scii**M**ath to rendered SVG math in html. It can take Asciimath embedded into Markdown from either file or stdin. If stdin is choosen as the source and the -O flag is used, the output file will be named `stdout.html`.

## Usage

```bash
      $ mdam [head] <input>
	  $ echo <input> | mdam [head]
```
 
    Options
      -O, Output a file which has the same name but .md/.markdown replaced with .html
 
    Examples
```bash
      $ mdam file.md > file.html
      $ mdam head.html file.md -O # output to file.html
```

No watching is included. That is handled by external programs, like [entr](http://www.entrproject.org/):

    find *.md | entr mdam /_ -O

Math is inputted in backticks (\`x=oo\`) as per AsciiMath best practice.

Read more about asciimath on [http://asciimath.org](http://asciimath.org).

Also, check out my browser implementation of this program here: [https://mryakobo.github.io/asciimath/](https://github.com/MrYakobo/asciimath)
