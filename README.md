# podrodze.net

## Prerequisites

You will need node and npm to bootstrap the project. If you're on OSX or Linux
`nvm` is your friend. You can grab it @ https://github.com/creationix/nvm

## Setup

First cd into project root directory. And activate proper version of node:

    nvm use

Next install node dependencies:

    npm install

Then install bower dependencies:

   $(npm bin)/bower install

To be able to build the project you have to provide `GOOGLE_API_KEY` envvar
with your Google Maps API key. You can do it like this:

    export GOOGLE_API_KEY=<your api key goes here>

Then you should be able to build the project with

    $(npm bin)/grunt build

To do some further work run the development server with default task:

    $(npm bin)/grunt

Now you can access the project @ http://localhost:8282. File watcher will
automatically rebuild project on every file save, so just hack for a while
and see your changes in the browser :)
