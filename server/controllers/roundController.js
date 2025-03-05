const db = require('../config/firebase');

// Hent alle runder
const getRounds = async (req, res) => {
    try {
        const ref = db.ref('/rounds');
        await ref.once('value', (snapshot) => {
            const data = snapshot.val();

            const roundsArray = data
                ? Object.keys(data).map(key => {
                    const round = data[key];

                    // Filtrér noder, der ikke er startTime eller endTime
                    const matches = Object.keys(round)
                        .filter(matchKey => matchKey !== "startTime" && matchKey !== "endTime")
                        .map(matchKey => {
                            const match = round[matchKey];

                            // Sikrer, at både team1 og team2 eksisterer
                            if (!match || !match.team1 || !match.team2) return null;

                            return {
                                id: matchKey,
                                team1: {
                                    player1: match.team1.player1 || null,
                                    player2: match.team1.player2 || null,
                                },
                                team2: {
                                    player1: match.team2.player1 || null,
                                    player2: match.team2.player2 || null,
                                },
                                sidesFixed: match.sidesFixed || false,
                            };
                        }).filter(match => match !== null);

                    return {
                        id: key,
                        startTime: round.startTime || null,
                        endTime: round.endTime || null,
                        matches,
                    };
                })
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
    const { matches, startTime, endTime } = req.body;

    if (!matches || !Array.isArray(matches) || matches.length === 0) {
        return res.status(400).json({ message: "Invalid input data. Ensure matches are provided." });
    }

    try {
        const roundsRef = db.ref(`/rounds`);
        const newRoundRef = roundsRef.push(); // Genererer et unikt ID til runden

        // Funktion til at fjerne undefined felter
        const removeUndefinedFields = (obj) => {
            return Object.fromEntries(Object.entries(obj).filter(([_, value]) => value !== undefined));
        };

        // Klargør kampene
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

        // Strukturér runde-data med kampene direkte under runden
        const roundData = {
            startTime: startTime || null,
            endTime: endTime || null,
            ...Object.fromEntries(
                formattedMatches.map((match, index) => [`match${index + 1}`, match])
            ),
        };

        // Gem hele runden i Firebase
        await newRoundRef.set(roundData);

        res.json({ message: "Round added", roundId: newRoundRef.key });
    } catch (error) {
        console.error("Error saving round:", error);
        res.status(500).json({ message: "Failed to save round" });
    }
};






const updateMatchTeams = async (req, res) => {
    const { roundId, matchId } = req.params;
    const { team1, team2 } = req.body;


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
