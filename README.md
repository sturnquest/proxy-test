Proxy Test
===========

<p>A quick way to run smoke tests against code submissions for the transparent proxy problem.</p>

Install and run unit tests
==========================

> 1. git clone git@github.com:sturnquest/proxy-test.git
> 2. cd proxy-test
> 3. npm install
> 4. mocha test/unit

Smoke test code submissions
===========================

<p>
Run acceptance tests hitting the target proxy server to verify scenarios. The acceptance test will start
a server that records and verifies requests from the proxy. The server listens on port 8080 by default.
</p>

1. configure the proxy server to point to http://localhost:8080
2. configure the proxy server params to be: {duration: 2 seconds, max-size: 1024 bytes, max-elements, 4}
3. configure test/acceptance/server_test.js to point to the proxy server e.g. var proxyBaseUrl = "http://localhost:3000";
4. start the proxy server
5. mocha test/acceptance

Manual testing
===========================

1. configure the proxy server to point to http://localhost:8080
2. configure the proxy server params to be: {duration: 2 seconds, max-size: 1024 bytes, max-elements, 4}
3. node app/start.js
4. start the proxy server
5. open a browser and hit the proxy server

