import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./Login";
import Welcome from "./Welcome";
import SignUp from "./SignUp";
import MainPageClient from "./client/MainPageClient";
import MainPageAdmin from "./administrator/MainPageAdmin";
import DetaliiCarte from "./client/DetaliiCarte";
import Favorite from "./client/Favorite";
import ProfilAdmin from "./administrator/ProfilAdmin";
import ProfilClient from "./client/ProfilClient";
import CartiAdmin from "./administrator/CartiAdmin";
import Utilizatori from "./administrator/Utilizatori";
import DetaliiCarteAdmin from "./administrator/DetaliiCarteAdmin";
import Exemplare from "./administrator/Exemplare";
import Imprumuturi from "./administrator/Imprumuturi";
import AdaugaCarte from "./administrator/AdaugaCarte";
import EditeazaCarte from "./administrator/EditeazaCarte";
import ImprumuturiClient from "./client/ImprumuturiClient";
import Istoric from "./client/Istoric";
import IstoricImprumuturiAdmin from "./administrator/IstoricImprumuturiAdmin";
import Recomandate from "./client/Recomandate";
import ChatWidget from "./chatbot/ChatWidget";
import IstoricUtilizator from "./administrator/IstoricUtilizator";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/client" element={<MainPageClient />} />
        <Route path="/admin" element={<MainPageAdmin />} />
        <Route path="/detalii/:id" element={<DetaliiCarte />} />
        <Route path="/favorite" element={<Favorite />} />
        <Route path="/profil-admin" element={<ProfilAdmin />} />
        <Route path="/profil-client" element={<ProfilClient />} />
        <Route path="/carti" element={<CartiAdmin />} />
        <Route path="/utilizatori" element={<Utilizatori />} />
        <Route path="/detalii-admin/:id" element={<DetaliiCarteAdmin />} />
        <Route path="/exemplare/:id" element={<Exemplare />} />
        <Route path="/imprumuturi" element={<Imprumuturi />} />
        <Route path="/adauga-carte" element={<AdaugaCarte />} />
        <Route path="/editeaza-carte/:id" element={<EditeazaCarte />} />
        <Route path="/imprumuturi-curente" element={<ImprumuturiClient />} />
        <Route path="/istoric" element={<Istoric />} />
        <Route
          path="/istoric-imprumuturi"
          element={<IstoricImprumuturiAdmin />}
        />
        <Route path="/recomandate" element={<Recomandate />} />
        <Route path="/chat" element={<ChatWidget />} />
        <Route path="/istoric-utilizator/:id" element={<IstoricUtilizator />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
