# Figma Plugin: Contrast Description

![Cover](https://user-images.githubusercontent.com/19694054/144676188-ff1bd55e-cea7-4cef-a40e-ba01738f4246.jpg)

Quickly add [WCAG](https://www.w3.org/WAI/WCAG2AAA-Conformance) (Web Content Accessibility Guidelines) contrast ratio info to your color styles for easy reference right in the color panel. No need to break your design flow to check accessibility, this helps everyone working in the file know which color pairs are safe to use by providing contextual information directly in the Figma UI.


## Credits
Some resources that helped in the development of this plugin:
- [Dan Hollick](https://alcohollick.com/)'s [Figma plugin tutorial](https://alcohollick.com/writing/figma-plugin-tutorial-4-6) with formulas to calculate contrast
- [Roamn Shamin](https://twitter.com/romanshamin)'s article [Building a Color System Plugin](https://evilmartians.com/chronicles/figma-diy-building-a-color-system-plugin)


---

## Setup

Below are the steps to get the plugin running. You can also find instructions at:

https://www.figma.com/plugin-docs/setup/

This plugin template uses Typescript and NPM, two standard tools in creating JavaScript applications.

First, download Node.js which comes with NPM. This will allow you to install TypeScript and other
libraries. You can find the download link here:

https://nodejs.org/en/download/

Next, install TypeScript using the command:

```
npm install -g typescript
```

Finally, in the directory of your plugin, get the latest type definitions for the plugin API by running:

```
npm install --save-dev @figma/plugin-typings
```

If you are familiar with JavaScript, TypeScript will look very familiar. In fact, valid JavaScript code
is already valid Typescript code.

TypeScript adds type annotations to variables. This allows code editors such as Visual Studio Code
to provide information about the Figma API while you are writing code, as well as help catch bugs
you previously didn't notice.

For more information, visit https://www.typescriptlang.org/

Using TypeScript requires a compiler to convert TypeScript (code.ts) into JavaScript (code.js)
for the browser to run.

We recommend writing TypeScript code using Visual Studio code:

1. Download Visual Studio Code if you haven't already: https://code.visualstudio.com/.
2. Open this directory in Visual Studio Code.
3. Compile TypeScript to JavaScript: Run the "Terminal > Run Build Task..." menu item,
    then select "tsc: watch - tsconfig.json". You will have to do this again every time
    you reopen Visual Studio Code.

That's it! Visual Studio Code will regenerate the JavaScript file every time you save.

## About

Hello, I'm Andrew, a product designer at [thoughtbot](https://thoughtbot.com/). I've made it a habit of always recording WCAG color contrast for the colors defined in each project. Hopefully this plugin can help you do the same by automating the process!

I'm building this plugin in the open, feel free to follow along!

[Website](https://andrew-spencer.com/) | [Dribbble](https://dribbble.com/iam_aspencer)
