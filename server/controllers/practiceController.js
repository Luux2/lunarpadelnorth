const db = require('../config/firebase'); // Sørg for, at din Firebase-konfiguration er korrekt importeret

const getPracticeTeams = async (req, res) => {
    try {
        // Reference til "practice-teams" i databasen
        const practiceTeamsRef = db.ref('/practice-teams');

        // Hent data fra databasen
        const snapshot = await practiceTeamsRef.once('value');
        const practiceTeams = snapshot.val();

        // Konverter data til et array
        const practiceTeamsArray = practiceTeams
            ? Object.keys(practiceTeams).map((key) => ({ id: key, ...practiceTeams[key] }))
            : [];

        // Returner det konverterede array
        res.status(200).json(practiceTeamsArray);
    } catch (error) {
        console.error("Error fetching practice teams:", error);
        res.status(500).json({ message: "Failed to fetch practice teams" });
    }
};


const postPracticeTeam = async (req, res) => {
    const { startTime, endTime, players } = req.body;

    // Valider input
    if (!startTime || !endTime || !players || players.length !== 4) {
        return res.status(400).json({ message: "Invalid input. Ensure startTime, endTime, and exactly 4 players are provided." });
    }

    try {
        // Reference til "practice-teams" i databasen
        const practiceTeamsRef = db.ref('/practice-teams');

        // Push en ny træning ind i databasen
        const newPracticeTeamRef = practiceTeamsRef.push();
        await newPracticeTeamRef.set({
            startTime,
            endTime,
            players,
        });

        res.status(201).json({
            message: "Practice team created successfully",
            id: newPracticeTeamRef.key, // Returner det genererede ID
        });
    } catch (error) {
        console.error("Error creating practice team:", error);
        res.status(500).json({ message: "Failed to create practice team" });
    }
};

const patchPlayer = async (req, res) => {
    const { teamId } = req.params; // Hent teamId fra URL'en
    const { oldPlayerId, newPlayerId } = req.body; // Hent gamle og nye spillere fra request body

    if (!teamId || !oldPlayerId || !newPlayerId) {
        return res.status(400).json({ message: "Manglende teamId, oldPlayerId eller newPlayerId" });
    }

    try {
        const teamRef = db.ref(`/practice-teams/${teamId}`); // Reference til team i databasen
        const snapshot = await teamRef.get();

        if (!snapshot.exists()) {
            return res.status(404).json({ message: `Hold med ID '${teamId}' ikke fundet` });
        }

        const teamData = snapshot.val();

        // Find positionen af den gamle spiller i players-arrayet
        const playerIndex = teamData.players.indexOf(oldPlayerId);

        if (playerIndex === -1) {
            return res.status(404).json({ message: `Spiller med ID '${oldPlayerId}' ikke fundet på holdet` });
        }

        // Erstat den gamle spiller med den nye spiller
        teamData.players[playerIndex] = newPlayerId;

        // Opdater databasen
        await teamRef.update({ players: teamData.players });

        res.status(200).json({ message: "Spiller erstattet succesfuldt", players: teamData.players });
    } catch (error) {
        console.error("Fejl under opdatering af hold:", error);
        res.status(500).json({ message: "Kunne ikke opdatere holdet" });
    }
};




module.exports = {getPracticeTeams, postPracticeTeam, patchPlayer };
