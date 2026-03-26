import codecs

with codecs.open('cognify-dark.js', 'r', 'utf-8') as f:
    content = f.read()

# Fix the accidental escapes created by markdown templating
content = content.replace(r'\$', '$').replace(r'\`', '`')

with codecs.open('cognify-dark.js', 'w', 'utf-8') as f:
    f.write(content)
