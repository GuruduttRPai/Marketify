# Unique ID Generator &middot; ![Version](https://img.shields.io/github/package-json/v/olaf-wilkosz/unique-id-generator?style=for-the-badge) ![License: MIT](https://img.shields.io/github/license/olaf-wilkosz/unique-id-generator?style=for-the-badge)

## Description

**Unique ID Generator** is simple node package with the module that generates a unique alphanumeric string of the characters (random id) from the provided set of letters and numbers (A-Z, a-z, 0-9) with the desired length passed as the parameter, and prints it in console.

## Prerequisites

To run this package in your environment you will only need Node.js and npm/yarn installed.

## Instalation

`npm install @olaf-wilkosz/unique-id-generator`
or
`yarn add @olaf-wilkosz/unique-id-generator`

## Usage

``` js
const randomID = require('@olaf-wilkosz/unique-id-generator');

console.log(randomID(10)); // provide desired length, e.g. 10
```

## Features

* the package needs only one parameter - desired length of the final ID (length must be an integer number)
* running the tool results in the generating of the random and unique identifier of the desired length combined from the provided set of the upper and lower-case letters and numbers
* the result is printed in the console
