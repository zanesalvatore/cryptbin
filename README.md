cryptbin is a naive encrypted pastebin using client-side JavaScript encryption.

cryptbin uses a basic [one-time pad](https://en.wikipedia.org/wiki/One-time_pad) implementation in JavaScript to encrypt pastes on the client side, then embeds the key in the URL hash as a Base64 encoded value. This allows the key to be shared with the link, without it being transmitted to the server. This unfortunately imposes some limitations on the length of possible messages, since the key must be the same length as the message, and thus long messages will create a long URL.

This is not intended to be a secure piece of software. It's a hobby project I threw together over the course of a few days for fun. I cannot emphasize enough that you should not expect this software to provide any security or safety for any purpose. While one-time pads are theoretically perfect encryption, this assumes a theoretically perfect random number generator was used to produce the key and that no bad actor has tampered with the client, as well as that you have a secure means of transmitting the key.

# Requirements and Installation
## Basic requirements
 * Python 3
 * pip
 * bower

## Installation
You are strongly encouraged to install the Python dependencies in a virtualenv. To install the required packages, do `pip install -r requirements.txt` and `bower install`. Then launch your virtualenv (if you used one) and run `python cryptbin0.py`. This will create a SQLite database called `cryptbin.db` which will be used to store the pastes.