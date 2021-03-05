# glass
 
Glass is a recursive-descent parser for a Markdown-esque language I am currently designing.

Right now, it supports the following basic syntax:

Heading
```
=1= Heading 1
=2= Heading 2
=3= Heading 3
```

List
```
1. An ordered list item
. An unordered list item
```

Horizontal rule
```
--- 
```

Image
```
image:image_path{}
```

Styled text
```
This is a paragraph that can contain `@bold@`, `/italic/`, `_underlined_`, `=highlighted=`, and `-strikethrough-` text.
```

Link alias
```
`_link alias_(https://www.example.com)`
```

This project is still ongoing, and will be incorporated into a larger project in the near future.
