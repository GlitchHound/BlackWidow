BlackWidow Web Command Interface - 1.0.6
====================

**BlackWidow** is a open source (under GPL) web-based command line interface, that was developed by five developers: Bilawal Hameed, Alejandro Sauze Saucedo, Charlie Brensinger, Anton Smyrnov, Sari Ghamloush.

Infrastructure
---------------------
The system works in the current structure: frontend -> xml -> backend

We've built it intelligently to try and avoid requests where necessary, so you can make pages that are rendered in-browser through the xml/configuration.xml file. If there's nothing found through the configuration.xml file then the engine will send the request to the server where it may process and offer some server-side response that may be what the user's looking for.

__Here's some notes:__

*   **aliases** simply route a request (i.e. a alias from "test" to "other" will do so accordingly)
*   **php/api.php** is an empty php page that contains the command data sent by the JS engine
*   **BW.init()** is needed to run the engine once the **js/core/** and **js/blackwidow/** has been loaded
*   All the code is fully documented (but is subject to much improvements)

About Us
---------------------
Black Widow was founded in February 2012 during the Dev8D event held in London, United Kingdom by Bilawal Hameed, Alejandro Sauze Saucedo, Charlie Brensinger, Anton Smyrnov and Sari Ghamloush.

Our goal was to initially to build anything overnight, and we came to an idea that had great initial reception at Dev8D, and we began at work that same night for show on the final day of the Dev8D event. Ever since, we've come somewhere and we expect that the community helps us build Black Widow into something new and faster.

We are five developers of different calibres, with something unique to build. We felt that the community can take this somewhere special, and for this reason alone, it will always be open source; but we intend to do something more powerful with the engine.

Notices
---------------------
Black Widow was initially built on XKCD.com's command line website, however since then we've recoded almost the whole engine to support XML and many other things that you will see for yourself. GPL License (where found) goes to XKCD's open source code.
