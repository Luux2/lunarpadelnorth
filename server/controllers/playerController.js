const db = require('../config/firebase');

const getPlayers = async (req, res) => {
    const ref = db.ref('/players');
    await ref.once('value', (snapshot) => {
        const data = snapshot.val();

        const playersArray = data ? Object.keys(data).map(key => ({id: key, ...data[key]})) : [];

        res.json(playersArray);
    });
}

const postPlayer = async (req, res) => {
    const ref = db.ref('/players');
    await ref.push(req.body);
    res.json({message: 'Player added'});
}

const deletePlayer = async (req, res) => {
    const ref = db.ref(`/players/${req.params.id}`);
    await ref.remove();
    res.json({message: 'Player deleted'});
}

module.exports = {getPlayers, postPlayer, deletePlayer};
