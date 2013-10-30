PHAIS Website
=============

An envisaged web application that allows users to submit bots to compete in games such as Blockade.

At present the repository contains base code to run a website via the wsgi-compatible Flask framework.

This website most likely requires:
- Modules for different games (see the Blockade repo. for the beginning of an implementation)
- Database models for users, game types (and the languages they support), bot submissions, and bot rankings
- A tournament system for playing off bots over time
- A front-end interface allowing submission of bots, visualising games, and debugging submissions (giving submission output and perhaps error output)
- Back-end session management to allow users to interact with their bots and asychronously view the results of games they initiate for testing purposes
- A back-end interface that abstracts independent systems for running bots under a common interface, with all forms of sandboxing and error handling

...none of which have been implemented, so this represents a TODO list.


Current dependencies:
- Python 2.x
- Flask
- MySQLdb https://github.com/farcepest/MySQLdb1 (though easily adaptable to use any compatible database api)
- Flask-Login https://github.com/maxcountryman/flask-login
- Flask-OpenID http://github.com/mitsuhiko/flask-openid/ (probably)
- Flask-Sijax https://github.com/spantaleev/flask-sijax (probably)