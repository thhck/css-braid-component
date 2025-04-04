# BRAID FOR CSS

this is an experiment in implementing [Braid](https://braid.org) in CSS.

## branches:

#### *main*

is CSS vanilla


#### *braidjs*

this branch kinda works, but is cheating.

Showcase braid working with a pod resource.
However to make it work we have comment all CSS `setHeader`.
Therefore braid workds despite solid spec.

#### *braidjs-braid-response-writter*

This branch try not to cheat, but is still buggy and doesn't work

Forked from *braidjs* this branch try to solve the above by
rewrite CSS BaseResponseWriter, and include braid stuff there.

Since this the `ResponseWriter` the "last-stop" of the HTTP train,
all CSS header should be set and braid can safely write response.
wip...

[**related github issue**](https://github.com/braid-org/braid-http/issues/6)

## install and run

```
npm i
npm build
npm run start
```

## usage

after install

#### create account

 1. got to [http://localhost:3000/.account/login/password/register/](http://localhost:3000/.account/login/password/register/)
 1. create an account
 1. on the account page click `create pod`
 1. create a pod ( `a` in this example )

#### disable multiplexing

edit `./node_modules/braid-http/braid-http-server.js`
add a the top:
```
braidify.enable_multiplex = false
```

rebuild and restart the server

#### let everyone write the pod's card

edit `./data/a/profile/card` ( change `a` with you pod name )

change

```
<#public>
    a acl:Authorization;
    acl:agentClass foaf:Agent;
    acl:accessTo <./card>;
    acl:mode acl:Read.
```

to

```
<#public>
    a acl:Authorization;
    acl:agentClass foaf:Agent;
    acl:accessTo <./card>;
    acl:mode acl:Read, acl:Write, acl:Control.
```

#### set up the client

run the following client: [https://github.com/braid-org/braid-http/tree/58d28edf16db66e20624df3fd83f840a97f74ace/demos/chat](https://github.com/braid-org/braid-http/tree/58d28edf16db66e20624df3fd83f840a97f74ace/demos/chat)

edit `client.html` with the following diff:
please apply this patch manually, basically it just disable multiplexing, change the target url, and add `text/turtle` content-type

```
6a9,13
> 	braid_fetch.enable_multiplex = false
>   const target_endpoint = '/a/profile/card'
17c24
<         <input type=text id=new_stuff onkeydown=${hit_a_key}/>
---
>         <textarea id=new_stuff onkeydown=${hit_a_key}/>
51c59
<       curr_version['/chat'] = [(parseInt(curr_version['/chat'][0]) + 1) + '']
---
>       curr_version[target_endpoint] = [(parseInt(curr_version[target_endpoint][0]) + 1) + '']
58,59c66,76
<       var res = await braid_fetch(url, {method: 'put', patches, peer})
---
>       var res = await braid_fetch(url,
>       	{
>       		method: 'put',
>       		headers: {"content-type": "text/turtle"},
>       		patches,
>       		peer,
>       	})
66,67c83,85
<   var path = '/chat',
<       url = new URL(path, window.location.href),
---
>   var path = target_endpoint,
>       url = new URL(path, 'http://localhost:3000'),
68a87
```







 CSS' original README

----

# Community Solid Server

<img src="https://raw.githubusercontent.com/CommunitySolidServer/CommunitySolidServer/main/templates/images/solid.svg"
 alt="[Solid logo]" height="150" align="right"/>

[![MIT license](https://img.shields.io/npm/l/@solid/community-server)](https://github.com/CommunitySolidServer/CommunitySolidServer/blob/main/LICENSE.md)
[![npm version](https://img.shields.io/npm/v/@solid/community-server)](https://www.npmjs.com/package/@solid/community-server)
[![Node.js version](https://img.shields.io/node/v/@solid/community-server)](https://www.npmjs.com/package/@solid/community-server)
[![Build Status](https://github.com/CommunitySolidServer/CommunitySolidServer/workflows/CI/badge.svg)](https://github.com/CommunitySolidServer/CommunitySolidServer/actions)
[![Coverage Status](https://coveralls.io/repos/github/CommunitySolidServer/CommunitySolidServer/badge.svg)](https://coveralls.io/github/CommunitySolidServer/CommunitySolidServer)
[![DOI](https://zenodo.org/badge/265197208.svg)](https://zenodo.org/badge/latestdoi/265197208)
[![GitHub discussions](https://img.shields.io/github/discussions/CommunitySolidServer/CommunitySolidServer)](https://github.com/CommunitySolidServer/CommunitySolidServer/discussions)
[![Chat on Gitter](https://badges.gitter.im/CommunitySolidServer/community.svg)](https://gitter.im/CommunitySolidServer/community)

**The Community Solid Server is open software
that provides you with a [Solid](https://solidproject.org/) Pod and identity.
This Pod acts as your own personal storage space
so you can share data with people and Solid applications.**

As an open and modular implementation of the
[Solid specifications](https://solidproject.org/TR/),
the Community Solid Server is a great companion:

- 🧑🏽 **for people** who want to try out having their own Pod

- 👨🏿‍💻 **for developers** who want to quickly create and test Solid apps

- 👩🏻‍🔬 **for researchers** who want to design new features for Solid

And, of course, for many others who like to experience Solid.

## ⚡ Running the Community Solid Server

Make sure you have [Node.js](https://nodejs.org/en/) 18.0 or higher.
If this is your first time using Node.js,
you can find instructions on how to do this [here](https://nodejs.org/en/download/package-manager).

```shell
npx @solid/community-server
```

Now visit your brand new server at [http://localhost:3000/](http://localhost:3000/)!

To persist your pod's contents between restarts, use:

```shell
npx @solid/community-server -c @css:config/file.json -f data/
```

In case you prefer to use Docker instead,
you can find instructions for this and other methods in the
[documentation](https://communitysolidserver.github.io/CommunitySolidServer/latest/usage/starting-server/).

## 🔧 Configure your server

Substantial changes to server behavior can be achieved via JSON configuration files.
The Community Solid Server uses [Components.js](https://componentsjs.readthedocs.io/en/latest/)
to specify how modules and components need to be wired together at runtime.

Recipes for configuring the server can be found at [CommunitySolidServer/recipes](https://github.com/CommunitySolidServer/recipes).

Examples and guidance on custom configurations
are available in the [`config` folder](https://github.com/CommunitySolidServer/CommunitySolidServer/tree/main/config),
and the [configurations tutorial](https://github.com/CommunitySolidServer/tutorials/blob/main/custom-configurations.md).
There is also a [configuration generator](https://communitysolidserver.github.io/configuration-generator/).

## 👩🏽‍💻 Developing server code

The server allows writing and plugging in custom modules
without altering its base source code.

The [📗 API documentation](https://communitysolidserver.github.io/CommunitySolidServer/5.x/docs) and
the [📓 user documentation](https://communitysolidserver.github.io/CommunitySolidServer/)
can help you find your way.
There is also a repository of [📚 comprehensive tutorials](https://github.com/CommunitySolidServer/tutorials/)

## 📜 License

The Solid Community Server code
is copyrighted by [Inrupt Inc.](https://inrupt.com/)
and [imec](https://www.imec-int.com/)
and available under the [MIT License](https://github.com/CommunitySolidServer/CommunitySolidServer/blob/main/LICENSE.md).

## 🎤 Feedback and questions

Don't hesitate to [start a discussion](https://github.com/CommunitySolidServer/CommunitySolidServer/discussions)
or [report a bug](https://github.com/CommunitySolidServer/CommunitySolidServer/issues).

There's also [a Matrix-based, CSS-focused chat](https://matrix.to/#/#CommunitySolidServer_community:gitter.im)

Learn more about Solid at [solidproject.org](https://solidproject.org/).
