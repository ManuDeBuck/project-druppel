#!/usr/bin/env python

import cgi
import random
import ast
import json

def new_game(size=5):
    board = getRandomBoard(size)
    moves = getPossibleMoves(board)
    score = 0
    message = ""
    return {'board': board, 'moves': moves, 'score': score, 'message': message}


def getRandomBoard(size=5):
    """
        >>> len(getRandomBoard(5)[0])
        5
        >>> len(getRandomBoard(10)) == 10
        True
        >>> len(getRandomBoard(10)[0]) == 10
        True
        >>> getRandomBoard(-10)
        Traceback (most recent call last):
          File "/Applications/PyCharm.app/Contents/helpers/pycharm/docrunner.py", line 140, in __run
            compileflags, 1), test.globs)
          File "<doctest cgiscript.new_game[2]>", line 1, in <module>
            new_game(-10)
          File "/Users/manudebuck/PyCharmProjects/ProjectSTCGI/cgiscript.py", line 18, in new_game
            assert size >= 0, "Ongeldige grootte van het spelbord"
        AssertionError: Ongeldige grootte van het spelbord
        """
    assert size >= 0, "Ongeldige grootte van het spelbord"
    with open("cgi-bin/colors.txt", "r") as file:
        kleuren = file.read().splitlines()
    kleuren = random.sample(kleuren, size)
    board = []
    for i in range(size):
        rij = []
        for j in range(size):
            rij.append(kleuren[random.randint(0, len(kleuren) - 1)])
        board.append(rij)
    return board


def getPossibleMoves(board):
    """
    >>> all(c in getPossibleMoves([['orange', 'orange', 'red'], ['green', 'blue', 'red'], ['green', 'blue', 'yellow']]) for c in {'yellow', 'orange', 'red', 'blue', 'green'})
    True
    >>> all(c in getPossibleMoves([['orange', 'orange', 'red'], ['green', 'blue', 'red'], ['green', 'blue', 'yellow']]) for c in {'yellow', 'orange', 'red', 'blue', 'green', 'purple'})
    False
    >>> getPossibleMoves([])
    Traceback (most recent call last):
      File "/Applications/PyCharm.app/Contents/helpers/pycharm/docrunner.py", line 140, in __run
        compileflags, 1), test.globs)
      File "<doctest cgiscript.getPossibleMoves[1]>", line 1, in <module>
        getPossibleMoves([])
      File "/Users/manudebuck/PyCharmProjects/ProjectSTCGI/cgiscript.py", line 56, in getPossibleMoves
        assert len(board) > 0, "leeg board meegegeven"
    AssertionError: leeg board meegegeven
    >>> getPossibleMoves([["red", "red"],["red", "red"]])
    ['red']
    """
    assert len(board) > 0, "leeg board meegegeven"
    colors = set()
    for row in board:
        for color in row:
            colors.add(color)
    colors.remove(board[0][0])
    return list(colors)


def do_move(board, kleur, locatie):
    """
    >>> all(kleur in do_move({"board":[["red","blue","green"],["red","blue","green"],["red","red","green"]], "moves": ["red", "blue", "green"], "score": 3, "message": ""}, "blue", [0,0])["moves"] for kleur in ["blue", "green"])
    True
    >>> do_move({"board":[["red","blue","green"],["red","blue","green"],["red","red","green"]], "moves": ["red", "blue", "green"], "score": 3, "message": ""}, "blue", [0,0])["board"]
    [['blue', 'blue', 'green'], ['blue', 'blue', 'green'], ['blue', 'blue', 'green']]
    >>> len(do_move({'board': [['blue', 'blue', 'green'], ['blue', 'blue', 'green'], ['blue', 'blue', 'green']], 'moves': ['green', 'blue'], 'score': 4, 'message': ''}, "green", [0,0])["message"]) > 0
    True
    >>> len(do_move({'board': [['blue', 'blue', 'green'], ['blue', 'red', 'green'], ['blue', 'blue', 'green']], 'moves': ['green', 'blue'], 'score': 4, 'message': ''}, "green", [0,0])["message"]) > 0
    False
    """
    greetings = ["Hello, sunshine!","Howdy  partner!","Hey, howdy hi!","What's kickin', little chicken?","Peek-a-boo!","Howdy-doody!","My name's Ralph, and I'm a bad guy.","Hi  mister!","I come in peace!","Put that cookie down!","Ahoy, matey!","Hiya!","'Ello, gov'nor!","Top of the mornin' to ya!","What's crackin'?","GOOOOOD MORNING  VIETNAM!","'Sup  homeslice?","This call may be recorded for training purposes.","Howdy, howdy, howdy!","Hi, my name is Lion. Pleased to eat you.","I'm Batman.","At least  we meet for the first time for the last time!","Hello, who's there, I'm talking.","Here's Johnny!","You know who this is.","Ghostbusters, whatya want?","Yo!","Whaddup.","Greetings and salutations!","Hellon it's me."]
    locatie = [int(locatie[0]), int(locatie[1])]
    score = board["score"] + 1
    bordvoorstelling = board["board"]
    assert kleur in board["moves"], "Kleur kan niet gespeeld worden"
    assert score > 0, "ongeldige score"
    bordvoorstelling = doeDruppel(bordvoorstelling, kleur, locatie)
    moves = getPossibleMoves(bordvoorstelling)
    message = ""
    if(checkFinished(bordvoorstelling)):
        message = greetings[random.randint(0, len(greetings) - 1)] + "\n" + \
                  "Congratulations, you finished the game in: " + str(score) + " rounds!"
    return {'board': bordvoorstelling, 'moves': moves, 'score': score, 'message': message}


def checkFinished(bordvoorstelling):
    """
    >>> checkFinished([[1,2],[1,2]])
    False
    >>> checkFinished([[1,1],[1,1]])
    True
    >>> checkFinished([[1]])
    True
    """
    kleur1 = bordvoorstelling[0][0]
    for row in bordvoorstelling:
        if not all(el == kleur1 for el in row):
            return False
    return True


def doeDruppel(bordvoorstelling, kleur, locatie):
    """
    >>> doeDruppel([[1,2,3],[1,2,2],[1,1,3]], 2, [0,0])
    [[2, 2, 3], [2, 2, 2], [2, 2, 3]]
    >>> doeDruppel([[2, 2, 3], [2, 2, 2], [2, 2, 3]], 3, [0,0])
    [[3, 3, 3], [3, 3, 3], [3, 3, 3]]
    >>> doeDruppel([[1,2,3,4],[5,4,3,2],[1,1,1,1],[2,3,1,4]], 2, [0,0])
    [[2, 2, 3, 4], [5, 4, 3, 2], [1, 1, 1, 1], [2, 3, 1, 4]]
    >>> doeDruppel([[2, 2, 3, 4], [5, 4, 3, 2], [1, 1, 1, 1], [2, 3, 1, 4]], 3, [0,0])
    [[3, 3, 3, 4], [5, 4, 3, 2], [1, 1, 1, 1], [2, 3, 1, 4]]
    >>> doeDruppel([[3, 3, 3, 4], [5, 4, 3, 2], [1, 1, 1, 1], [2, 3, 1, 4]], 1, [0,0])
    [[1, 1, 1, 4], [5, 4, 1, 2], [1, 1, 1, 1], [2, 3, 1, 4]]
    """
    huidigekleur = bordvoorstelling[locatie[0]][locatie[1]]
    bordvoorstelling[locatie[0]][locatie[1]] = kleur
    recDruppel(bordvoorstelling, huidigekleur, kleur, locatie, [])
    return bordvoorstelling


def recDruppel(bordvoorstelling, oudekleur, nieuwekleur,  huidigeLocatie, reeds):
    buren = getBuren(bordvoorstelling, huidigeLocatie)
    for buur in buren:
        if not buur in reeds:
            reeds.append(buur)
            if(bordvoorstelling[buur[0]][buur[1]] == oudekleur):
                bordvoorstelling[buur[0]][buur[1]] = nieuwekleur
                reeds = recDruppel(bordvoorstelling, oudekleur, nieuwekleur, buur, reeds)
    return reeds


def getBuren(bordvoorstelling, huidigeLocatie):
    """
    >>> getBuren([[0,1,2,3],[4,5,6,7],[8,9,10,11],[12,13,14,15]], [0,0])
    [[1, 0], [0, 1]]
    >>> getBuren([[0]], [0,0])
    []
    >>> getBuren([[0,1,2,3],[4,5,6,7],[8,9,10,11],[12,13,14,15]], [2,2])
    [[1, 2], [3, 2], [2, 1], [2, 3]]
    """
    buren = []
    if(huidigeLocatie[0] > 0):
        buren.append([huidigeLocatie[0] - 1, huidigeLocatie[1]])
    if(huidigeLocatie[0] < len(bordvoorstelling) - 1):
        buren.append([huidigeLocatie[0] + 1, huidigeLocatie[1]])
    if(huidigeLocatie[1] > 0):
        buren.append([huidigeLocatie[0], huidigeLocatie[1] - 1])
    if(huidigeLocatie[1] < len(bordvoorstelling) - 1):
        buren.append([huidigeLocatie[0], huidigeLocatie[1] + 1])
    return buren


if __name__ == "__main__":
    import doctest
    print(doctest.testmod())

parameters = cgi.FieldStorage()
print ('Content-Type: application/json\n\n')

if parameters.getvalue("ACTIE") == "new":
    print(json.dumps(new_game(int(parameters.getvalue("GROOTTE")))))
elif parameters.getvalue("ACTIE") == "action":
    print(json.dumps(do_move(ast.literal_eval(parameters.getvalue("BOARD")), parameters.getvalue("COLOR"), ast.literal_eval(parameters.getvalue("LOCATION")))))