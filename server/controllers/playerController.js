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

module.exports = {getPlayers, postPlayer};
