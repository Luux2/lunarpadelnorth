const db = require('../config/firebase');

// Hent alle runder
const getRounds = async (req, res) => {
    try {
        const ref = db.ref('/rounds');
        await ref.once('value', (snapshot) => {
            const data = snapshot.val();

            const roundsArray = data
                ? Object.keys(data).map(key => ({
                    id: key,
                    matches: Object.keys(data[key]).map(matchKey => ({
                        id: matchKey,
                        team1: {
                            player1: data[key][matchKey].team1.player1,
                            player2: data[key][matchKey].team1.player2,
                        },
                        team2: {
                            player1: data[key][matchKey].team2.player1,
                            player2: data[key][matchKey].team2.player2,
                        },
                        sidesFixed: data[key][matchKey].sidesFixed || false,
                    })),
                }))
                : [];
            res.json(roundsArray);
        });
    } catch (error) {
        console.error("Error fetching rounds:", error);
        res.status(500).json({ message: "Failed to fetch rounds" });
    }
};




// Gem en ny runde
const postRound = async (req, res) => {
    const { matches } = req.body;
    const { date } = req.params;

    if (!date || !matches || !Array.isArray(matches) || matches.length === 0) {
        return res.status(400).json({ message: "Invalid input data. Ensure matches and date are provided." });
    }

    try {
        const roundRef = db.ref(`/rounds/${date}`);

        const removeUndefinedFields = (obj) => {
            return Object.entries(obj).reduce((acc, [key, value]) => {
                if (value !== undefined) {
                    acc[key] = value;
                }
                return acc;
            }, {});
        };

        const formattedMatches = matches.map(match => ({
            team1: removeUndefinedFields({
                player1: match.team1.player1,
                player2: match.team1.player2,
            }),
            team2: removeUndefinedFields({
                player1: match.team2.player1,
                player2: match.team2.player2,
            }),
            sidesFixed: match.sidesFixed || false,
        }));

        const promises = formattedMatches.map(match => roundRef.push(match));
        await Promise.all(promises);

        res.json({ message: "Round added" });
    } catch (error) {
        console.error("Error saving round:", error);
        res.status(500).json({ message: "Failed to save round" });
    }
};



const updateMatchTeams = async (req, res) => {
    const { roundId, matchId } = req.params;
    const { team1, team2 } = req.body;

    console.log("Received in backend:", { roundId, matchId, team1, team2 }); // Debug-log

    if (!roundId || !matchId || !team1 || !team2) {
        return res.status(400).json({ message: "Missing required parameters or body data" });
    }

    try {
        const matchRef = db.ref(`/rounds/${roundId}/${matchId}`);

        await matchRef.update({
            team1,
            team2,
        });

        res.json({ message: "Match teams updated successfully" });
    } catch (error) {
        console.error("Error updating match teams:", error);
        res.status(500).json({ message: "Failed to update match teams" });
    }
};







module.exports = { getRounds, postRound, updateMatchTeams };
