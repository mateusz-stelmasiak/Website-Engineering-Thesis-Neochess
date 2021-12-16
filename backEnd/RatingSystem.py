import math

#ELO variables
starting_ELO=1000
starting_ELO_deviation=350
starting_ELO_volatility=0.006

def calculate_elo(winner, loser, draw):
    r_winner = pow(10, winner / 400)
    r_loser = pow(10, loser / 400)
    e_winner = r_winner / (r_winner + r_loser)
    e_loser = r_loser / (r_winner + r_loser)
    if draw:
        winner_n = winner + (32 * (0.5 - e_winner))
        loser_n = loser + (32 * (0.5 - e_loser))
    else:
        winner_n = winner + (32 * (1 - e_winner))
        loser_n = loser + (32 * (0 - e_loser))
    return round(winner_n) - winner, round(loser_n) - loser


def calculate_glicko(player1_rating, player1_RD, player1_vol, player2_rating, player2_RD, player2_vol, result):
    if result == 0.5:
        result2 = 0.5
    else:
        result2 = 1 - result

    player1_rating = (player1_rating - 1500) / 173.7178
    player2_rating = (player2_rating - 1500) / 173.7178

    player1_RD = player1_RD / 173.7178
    player2_RD = player2_RD / 173.7178

    g1 = 1 / math.sqrt(1 + 3 * math.pow(player2_RD, 2) / math.pow(math.pi, 2))
    g2 = 1 / math.sqrt(1 + 3 * math.pow(player1_RD, 2) / math.pow(math.pi, 2))
    e1 = 1 / (1 + math.exp(-1 * g1 * (player1_rating - player2_rating)))
    e2 = 1 / (1 + math.exp(-1 * g2 * (player2_rating - player1_rating)))
    v1 = 1 / (math.pow(g1, 2) * e1 * (1 - e1))
    v2 = 1 / (math.pow(g2, 2) * e2 * (1 - e2))

    delta1 = v1 * g1 * (result - e1)
    delta2 = v2 * g2 * (result2 - e2)
    a1 = math.log(math.pow(player1_vol, 2))
    a2 = math.log(math.pow(player2_vol, 2))
    tau = 0.5
    x0 = a1
    x1 = 0

    while x0 != x1:
        x0 = x1
        d = math.pow(player1_rating, 2) + v1 + math.exp(x0)
        h1 = -(x0 - a1) / math.pow(tau, 2) - 0.5 * math.exp(x0) / d + 0.5 * math.exp(x0) * math.pow(delta1 / d, 2)
        h2 = -1 / math.pow(tau, 2) - 0.5 * math.exp(x0) * (math.pow(player1_rating, 2) + v1) / math.pow(d,
                                                                                                        2) + 0.5 * math.pow(
            delta1, 2) * math.exp(x0) * (math.pow(player1_rating, 2) + v1 - math.exp(x0)) / math.pow(d, 3)
        x1 = x0 - (h1 / h2)

    player1_vol = math.exp(x1 / 2)

    x0 = a2
    x1 = 0

    while x0 != x1:
        x0 = x1
        d = math.pow(player2_rating, 2) + v2 + math.exp(x0)
        h1 = -(x0 - a2) / math.pow(tau, 2) - 0.5 * math.exp(x0) / d + 0.5 * math.exp(x0) * math.pow(delta2 / d, 2)
        h2 = -1 / math.pow(tau, 2) - 0.5 * math.exp(x0) * (math.pow(player2_rating, 2) + v2) / math.pow(d,
                                                                                                        2) + 0.5 * math.pow(
            delta2, 2) * math.exp(x0) * (math.pow(player2_rating, 2) + v2 - math.exp(x0)) / math.pow(d, 3)
        x1 = x0 - (h1 / h2)

    player2_vol = math.exp(x1 / 2)

    player1_RD = math.sqrt(math.pow(player1_RD, 2) + math.pow(player1_vol, 2))
    player1_RD = 1 / math.sqrt((1 / math.pow(player1_RD, 2)) + (1 / v1))

    player2_RD = math.sqrt(math.pow(player2_RD, 2) + math.pow(player2_vol, 2))
    player2_RD = 1 / math.sqrt((1 / math.pow(player2_RD, 2)) + (1 / v2))

    player1_rating += math.pow(player1_RD, 2) * (g1 * (result - e1))
    player2_rating += math.pow(player2_RD, 2) * (g2 * (result2 - e2))

    return (player1_rating * 173.7178) + 1500, player1_RD * 173.7178, player1_vol, (
            player2_rating * 173.7178) + 1500, player2_RD * 173.7178, player2_vol



