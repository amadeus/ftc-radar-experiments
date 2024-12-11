# FTC Radar Tool

Currently this tool is very much in a prototype stage, and for that reason is
using a lot of very simplified infra to get things up an running. The main
requirement to run this project is [bun](https://bun.sh/), a new
javascript/typescript runtime that really excels at being fast and performant,
treats typescript as a first class citizen, and should work cross platform on
windows, mac and linux.

On top of this, we use [vite](https://vite.dev/) for the front end
infrastructure both because it's pretty well self contained, has great defaults
and is pretty portable.

## Getting Started

Before you can run any of the dev environment you'll need to install
[bun](https://bun.sh) as a global dependency. The installation instructions are
right there on their [homepage](https://bun.sh).

Once bun is installed, you should now have a global command in your terminal
app: `bun`. Pretty much all commands to develop will require this global
command.

Once bun is installed, you'll need to install all project dependencies. Make
sure you have navigated into this project directory in your terminal, then
simply run:

```sh
bun install
```

You'll only really need to do this once (or anytime there are changes to the
`package.json` file). Once you've done this you are ready to run the local
websocket and dev server.

## Development

In order to run this project locally and develop against it, you'll need to run
two simultaenous services at the same time.

1. A generalized websocket which is responsible for issuing fake game updates
2. The vite dev server that actually runs the web server that bundles and hot
   reloads the front end assets and dependencies.

The goal of the generalized websocket is to act as a fake game interface, and
is being maintained to act as the game server would, it is our proxy for a game
server during development.

There are two separate commands to run the websocket and web server, both of
which need to be run in separate terminal windows or tabs. The order is
important, always make sure you get the websocket service running before the
web server.

```sh
bun run socket
```

This will get the websocket up and running. All related files to the websocket
are located in the `./socket` folder. If you make any changes to these files,
you will need to manually kill the existing socket and restart it with the
command above.

Once the websocket is running, you'll need to spin up the web server, which
handles serving all of the front end assets as well as acts as a proxy to the
websocket.

```sh
bun run dev
```

Once this is up and running, you'll see some info and prompts in the terminal
window regarding how to view the page -- it will include both the url and port
to load in your browser, as well as offer some helper commands to open the
window in browser automatically if you'd like to do so.

Once the vite dev server is running, any files you edit in `./src` should be
hot reloaded in whatever browser window you are viewing things. Please note
however, certain features of react-three-fiber are not very hot reload
friendly, so you may still have to manually refresh to see certain types of
changes reflected in browser.

## Types, Linting &amp; Formatting

All of the projects are fully typed in
[Typescript](https://www.typescriptlang.org/), linted with
[ESLint](https://eslint.org/) and formatted using
[Prettier](https://prettier.io/). These dependencies are all installed
automatically for the project when you run `bun install`. If your editor
supports these tools out of the box, you should get automatic types, linting
and fixing. However, if you do not, there are some provided commands to run
these on the project.

### Typescript

The entire project is written in Typescript and should be pretty well typed. A
big reason for this is to help others collaborating on the project and ensure
the prevention of stupid bugs. Typescript is by no means perfect, but it's a
lot better than running without it.

We essentially have two Typescript projects in this repo, the front end/web
server project, and the bun based websocket. These are typed a bit differently
because they run in different environments. You can see this reflected in the
two separate tsconfig files we have:

1. `tsconfig.app.json` is the typescript configuration for `./src` directory
2. `tsconfig.bun.json` is the typescript configuration for the `./socket`
   directory

There are two commands to check types of the different projects:

```sh
bun run tsc-app
bun run tsc-socket
```

### Linting

ESLint is a tool that can help enforce certain coding practices and standards
that often go beyond, but may include type aware scenarios. This project
depends heavily on [React](https://react.dev/) and [React Three
Fiber](https://github.com/pmndrs/react-three-fiber). To run a lint check
against the entire repo is a singular comment:

```sh
bun run lint
```

In this case there is no need to have separate commands for the socket versus
the web app.

### Formatting

I am of the strong opinion that code formatters are key, we should be removing
our opinions on whitespace and how we format code and just let the computer do
it for us. It helps free our minds to really focus on what matters, the actual
code we are writing. I would highly recommend you setup your editor to format
code on save, however, if this is not an option, there's a global command you
can run to format all files in the project. Please do this before committing
code.

```sh
bun run prettier
```

This should apply to pretty much any and all files in the codebase. If a file
is invalid syntax the formatter will bail out and not format the file, so
generally you may need to run the typescript or eslint commands before
formatting if you're doing it all manually.
