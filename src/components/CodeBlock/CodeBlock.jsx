import React from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import vscDarkPlus from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus';

import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import powershell from 'react-syntax-highlighter/dist/esm/languages/prism/powershell';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';

/**
 * Syntax highlighting, registering only the languages this site uses.
 *
 * `import { Prism } from 'react-syntax-highlighter'` bundles every grammar
 * Prism ships - roughly 300 of them - which was most of the 1.2MB ProjectDetail
 * chunk. `PrismLight` starts empty and takes explicit registrations.
 *
 * The markdown in public/markdowns currently uses bash, python and powershell;
 * the rest are registered because they are the obvious next ones to appear.
 */
const languages = { bash, python, powershell, javascript, typescript, jsx, json, sql, yaml };
Object.entries(languages).forEach(([name, definition]) => {
  SyntaxHighlighter.registerLanguage(name, definition);
});

// Aliases so ```js / ```ts / ```sh in markdown resolve to a registered grammar.
SyntaxHighlighter.registerLanguage('js', javascript);
SyntaxHighlighter.registerLanguage('ts', typescript);
SyntaxHighlighter.registerLanguage('sh', bash);
SyntaxHighlighter.registerLanguage('shell', bash);

const supported = new Set([...Object.keys(languages), 'js', 'ts', 'sh', 'shell']);

const CodeBlock = ({ language, children, ...props }) => (
  <SyntaxHighlighter
    language={supported.has(language) ? language : 'text'}
    style={vscDarkPlus}
    {...props}
  >
    {children}
  </SyntaxHighlighter>
);

export default CodeBlock;
