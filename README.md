# Mars Rover Challenge
My NodeJS attempt at the Mars rover challenge. See https://code.google.com/archive/p/marsrovertechchallenge/ for more information.

It is assumed that rovers can fall off the plateau or crash into one another, rendering themselves useless. Once a rover has been involved in an accident, it stops functioning and cannot move any longer.
## Installation
Requires NodeJS 8+. Simply clone this repository and run
```sh
cd marsroverchallenge && npm install
```

## Usage
Run the programme and provide input via terminal with `node index` (alternatively, `npm start`). You will be prompted to provide input:
```sh
$ node index
Mars rover challenge 0.0.1
Enter your input below:
//Example text below this line
13 25
12 12 S
MRLMRLRMLRM
9 21 W
MMMRRMLLMLRMLM
//Single new line once done.
//Output
10 10 W
5 20 S
```

For your convenience, the `--file=/path/to/file` flag may be added to run calculations on properly formatted rover instruction files:

```sh
$ cat somefile.txt
13 25
12 12 S
MRLMRLRMLRM
9 21 W
MMMRRMLLMLRMLM
```
Then,
```sh
$ node index --file=somefile.txt
10 10 W
5 20 S
```

Additional options are viewable via `node index --help`.

## Tests
A handful of unit tests have been included. Run the tests with
```sh
$ npm test
```

## Todo
* implement a web ui to view the results of - and submit additional - rover instructions.
