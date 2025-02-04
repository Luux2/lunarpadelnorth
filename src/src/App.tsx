import './App.css'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import CreateMatchesScreen from "./pages/CreateMatchesScreen.tsx";
import RoundsScreen from "./pages/RoundsScreen.tsx";
import IndexScreen from "./pages/IndexScreen.tsx";
import PracticeTeamsScreen from "./pages/PracticeTeamsScreen.tsx";
import ViewPracticeTeamsScreen from "./pages/ViewPracticeTeamsScreen.tsx";
import EditScreen from "./pages/EditScreen.tsx";
import EditRounds from "./pages/EditRounds.tsx";
import EditPracticeTeams from "./pages/EditPracticeTeams.tsx";

function App() {

    return (
        <BrowserRouter>
            <Routes>
                <Route index path="/" element={<IndexScreen/>}/>
                <Route path="/create-matches" element={<CreateMatchesScreen/>}/>
                <Route path="/rounds" element={<RoundsScreen/>}/>
                <Route path="/practice-teams" element={<PracticeTeamsScreen/>}/>
                <Route path="/view-practice-teams" element={<ViewPracticeTeamsScreen/>}/>
                <Route path="/edit" element={<EditScreen/>}/>
                <Route path="/edit-rounds" element={<EditRounds/>}/>
                <Route path="/edit-practice-teams" element={<EditPracticeTeams/>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App
