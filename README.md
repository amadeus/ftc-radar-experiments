# FTC Radar Tool

Currently this tool is very much in a prototype stage, and for that reason is
using a lot of very simplified infra to get things up an running.  The main
requirement to run this project is [bun](https://bun.sh/), a new
javascript/typescript runtime that really excels at being fast and performant, treats
typescript as a first class citizen, and should work cross platform on windows,
mac and linux.

On top of this, we use [vite](https://vite.dev/) for the front end
infrastructure both because it's pretty well self contained, has great defaults
and is pretty portable.

## Getting Started

Before you can run any of the dev environment you'll need to install
[bun](https://bun.sh) as a global dependency.  The installation instructions
are right there on their [homepage](https://bun.sh).

Once bun is installed, you should now have a global command in your terminal
app: `bun`.  Pretty much all commands to run the server will require this
global command.

Once bun is installed, you'll need to install all project dependencies.  Make
sure you have navigated into this project directory in your terminal, then
simply run:

```sh
bun install
```

You'll only really need to do this once (or anytime there are changes to the
`package.json` file).  Once you've done this you are ready to run the local
websocket and dev server.

## Development

In order to run this project locally and develop against it, you'll need to run
two simultaenous services at the same time.  

1. A generalized websocket which is responsible for issuing fake game updates
2. The vite dev server that actually runs the web server with which the web app
   runs

The goal of the generalized websocket is to act as a fake game interface, and
over time we will make this act in the same way as the game would, enabling use
to run it as a proxy during development.

There are two separate commands to run the websocket and the server, both of
which need to be run in separate terminal windows or tabs. The order is
important, always make sure you get the websocket service running before the
vite dev server.

```sh
bun run server
```

This will get the websocket up and running.  All related files to the websocket
are located in the `./server` folder.  If you make any changes to these files,
you will need to manually restart the websocket server with the command above.

Once the websocket is running, you'll need to spin up the vite dev server,
which handles serving all of the front end assets as well as acts as a proxy to
the websocket.

```sh
bun run dev
```

Once this is up and running, you'll see some info and prompts in the terminal
window regarding how to view the page -- it will include both the url and port
to load in your browser, as well as offer some helper commands to open the
window in browser automatically if you'd like to do so.

Once the vite dev server is running, any files you edit in `./src` should be
hot reloaded in whatever browser window you are viewing things.  Please note
however, certain features of react-three-fiber are not very hot reload
friendly, so you may still have to manually refresh to see certain types of
changes reflected in browser.
